const {Service} = require('egg');
const uuidv1 = require('uuid/v1');
var WXBizDataCrypt = require('../utils/WXBizDataCrypt');

const ERROR_CODE_PREFIX = 1800000;

module.exports = class AccountService extends Service {

  /**
   * 登录
   * @param {String} jscode 临时登录凭票
   * @param {String} encryptedData 加密数据
   * @param {String} iv 向量
   */
  async login(jscode, encryptedData, iv) {
    const appId = this.app.config.wechat.appid;
    const appSecret = this.app.config.wechat.secret;

    // const res = await this.ctx.curl(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${jscode}&grant_type=authorization_code`, {
    //   dataType: 'json',
    //   timeout: 3000,
    // });
    const res = {
      data: {
        errcode: 0,
        openid: '123',
        unionid: '345',
        session_key: '789'
      }
    }
    const {data} = res;
    if(data.errcode !== 0) {
      throw new this.ctx.Error(ERROR_CODE_PREFIX + data.errcode, data.errmsg);
    }
    const {openid, unionid, session_key} = data;

    // 解密敏感数据
    const wxBizDataCrypt = new WXBizDataCrypt(appId, session_key);
    const userInfo = wxBizDataCrypt.decryptData(encryptedData , iv);
    userInfo.watermark = null;
    const userInfoString = JSON.stringify(userInfo);
    const {nickName, avatarUrl} = userInfo;

    // 取数据库中已有的当前openid用户
    const userInDatabase = await this.app.mysql.get('wechat_account', {openid});
    // 未注册用户创建账户
    if(!userInDatabase) {
      await this.app.mysql.insert('wechat_account', {
        openid,
        unionid,
        nickname: nickName,
        avatar: avatarUrl,
        userinfo_raw_data: userInfoString,
      });
    }
    
    // 用户信息发生变化
    if(userInDatabase.userinfo_raw_data !== userInfoString) {
      await this.app.mysql.update('wechat_account', {
        nickname: nickName,
        avatar: avatarUrl,
        userinfo_raw_data: userInfoString
      }, {
        where: {
          openid
        }
      });
    }

    // 检测是否有未过期的token
    const currentToken = await this.app.redis.get(`OPENID:${openid}`);
    let token, tokenExpire;
    if(currentToken) {
      // 命中未过期的token
      const currentTokenEntity = JSON.parse(currentToken);
      token = currentTokenEntity.token;
    }
    else {
      // 无未过期token，签发token
      token = uuidv1();
      tokenExpire = Date.now() + this.app.config.token.expireDuration;

      // 更新数据库中的Token
      await this.app.mysql.update('wechat_account', {
        token,
        token_expire_time: tokenExpire
      }, {
        where: {
          openid
        }
      });

      // 更新RedisToken
      await this.app.redis.set(`TOKEN:${token}`, JSON.stringify({
        openid, unionid, session_key
      }), 'EX', parseInt(tokenExpire/1000, 10));
      await this.app.redis.set(`OPENID:${openid}`, JSON.stringify({
        token, unionid, session_key
      }), 'EX', parseInt(tokenExpire/1000, 10));
    }

    return {token};
  }

  /**
   * 验证
   * @param {String} token 令牌
   */
  async verify(token) {
    const userEntity = this.app.redis.get(`TOKEN:${token}`);
    return userEntity ? JSON.parse(userEntity) : null;
  }
}