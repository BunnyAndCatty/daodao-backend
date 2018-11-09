const {Service} = require('egg');
const uuidv1 = require('uuid/v1');
var WXBizDataCrypt = require('../utils/WXBizDataCrypt');

const ERROR_CODE_PREFIX = 1800000;
const TABLE_NAME_IN_DATABASE = 'wechat_account';

module.exports = class AccountService extends Service {

  /**
   * 登录
   * @param {String} jscode 临时登录凭票
   * @returns {Object} token-登录凭票 isNewUser-是否为新用户 openid-微信用户标识
   */
  async login(jscode) {
    const appId = this.app.config.wechat.appid;
    const appSecret = this.app.config.wechat.secret;

    const res = await this.ctx.curl(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${jscode}&grant_type=authorization_code`, {
      dataType: 'json',
      timeout: 3000,
    });
    const {data} = res;
    if(data.errcode && data.errcode !== 0) {
      throw new this.ctx.Error(ERROR_CODE_PREFIX + data.errcode, data.errmsg);
    }
    const {openid, unionid, session_key} = data;
    let isNewUser = false;

    // 取数据库中已有的当前openid用户
    const userInDatabase = await this.app.mysql.get(TABLE_NAME_IN_DATABASE, {openid});
    // 未注册用户创建账户
    if(!userInDatabase) {
      isNewUser = true;
      await this.app.mysql.insert(TABLE_NAME_IN_DATABASE, {
        openid,
        unionid,
      });
    }
    
    // 检测是否有未过期的token
    const currentToken = await this.app.redis.get(`OPENID:${openid}`);
    let token;
    const tokenExpire = Date.now() + this.app.config.auth.expireDuration;
    if(currentToken) {
      // 命中未过期的token
      const currentTokenEntity = JSON.parse(currentToken);
      token = currentTokenEntity.token;
    }
    else {
      // 无未过期token，签发token
      token = uuidv1();

      // 更新数据库中的Token
      await this.app.mysql.update(TABLE_NAME_IN_DATABASE, {
        token,
        token_expire_time: tokenExpire
      }, {
        where: {
          openid
        }
      });
    }

    // 更新RedisToken
    await this.app.redis.set(`TOKEN:${token}`, JSON.stringify({
      openid, unionid, session_key
    }), 'EX', parseInt(tokenExpire/1000, 10));
    await this.app.redis.set(`OPENID:${openid}`, JSON.stringify({
      token, unionid, session_key
    }), 'EX', parseInt(tokenExpire/1000, 10));

    return {token, isNewUser, openid};
  }

  /**
   * 更新用户信息
   * @param {String} token 登录秘钥
   * @param {String} session_key 会话秘钥
   * @param {String} encryptedData 加密数据
   * @param {String} iv 向量
   * @returns {Boolean} 是否更新了用户信息
   */
  async updateUserInfo(openid, session_key, encryptedData, iv) {
    const appId = this.app.config.wechat.appid;

    // 解密敏感数据
    const wxBizDataCrypt = new WXBizDataCrypt(appId, session_key);
    const userInfo = wxBizDataCrypt.decryptData(encryptedData , iv);
    userInfo.watermark = null;
    const userInfoString = JSON.stringify(userInfo);
    const {nickName, avatarUrl} = userInfo;

    // 取数据库中已有的当前openid用户
    const userInDatabase = await this.app.mysql.get(TABLE_NAME_IN_DATABASE, {openid});
    // 用户信息发生变化
    if(userInDatabase.userinfo_raw_data !== userInfoString) {
      await this.app.mysql.update(TABLE_NAME_IN_DATABASE, {
        nickname: nickName,
        avatar: avatarUrl,
        avatar_local: '',
        userinfo_raw_data: userInfoString
      }, {
        where: {
          openid
        }
      });
      return true
    }
    else {
      return false;
    }
  }

  /**
   * 验证Token
   * @param {String} token 令牌
   * @returns {Object|null} 授权信息实体 包含{openid, unionid, session_key}
   */
  async verify(token) {
    const authEntity = await this.app.redis.get(`TOKEN:${token}`);
    return authEntity ? JSON.parse(authEntity) : null;
  }

  /**
   * 获取用户信息
   * @param {String} openid OpenID
   * @returns {Object|null} 用户信息实体 包含{openid, unionid, nickname, avatar, create_time, userinfo_raw_data}
   */
  async getUserInfo(openid) {
    const userEntity = await this.app.mysql.get(TABLE_NAME_IN_DATABASE, {
      where: {openid},
      columns: ['openid', 'unionid', 'nickname', 'avatar', 'avatar_local', 'create_time', 'userinfo_raw_data']
    });
    if(!userEntity) return null;
    userEntity.userinfo_raw_data = JSON.parse(userEntity.userinfo_raw_data);
    return userEntity;
  }

  /**
   * 获取所有头像未缓存到本地的账户信息
   */
  async getUnLocalizeAccount() {
    const list = await this.app.mysql.query(
      'Select openid, avatar From wechat_account Where ISNULL(avatar_local) AND NOT ISNULL(avatar);'
    );
    return list;
  }

  /**
   * 更新本地头像
   * @param {String} openid 唯一标示
   * @param {String} path 本地化链接
   */
  async updateLocalAvatar(openid, path) {
    return this.app.mysql.update(TABLE_NAME_IN_DATABASE, {
      avatar_local: path
    }, {
      where: {openid}
    });
  }
}