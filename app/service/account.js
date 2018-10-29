const {Service} = require('egg');
const uuidv1 = require('uuid/v1');

const ERROR_CODE_PREFIX = 1800000;

module.exports = class AccountService extends Service {

  /**
   * 登录
   * @param {String} jscode 临时登录凭票
   */
  async login(jscode) {
    // const res = await this.ctx.curl(`https://api.weixin.qq.com/sns/jscode2session?appid=${this.app.config.wechat.appid}&secret=${this.app.config.wechat.secret}&js_code=${jscode}&grant_type=authorization_code`, {
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
    console.log('wechat_data', data);

    const userInDatabase = await this.app.mysql.get('wechat_account', {openid});
    
    if(!userInDatabase) {
      // 未注册用户创建账户
      await this.app.mysql.insert('wechat_account', {
        openid,
        unionid,
        session_key
      });
    }

    // 签发token
    const token = uuidv1();
    const tokenExpire = Date.now() + this.app.config.token.expireDuration;
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
    }))
    await this.app.redis.expire(`TOKEN:${token}`, parseInt(tokenExpire/1000, 10));

    return {token, tokenExpire};
  }

  /**
   * 更新用户信息
   * @param {String} encryptedData 加密数据
   * @param {String} iv 向量
   */
  updateUserInfo(encryptedData, iv) {
    
  }

  /**
   * 验证
   * @param {String} token 令牌
   */
  async verify(token) {

  }
}