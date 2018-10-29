const {Service} = require('egg');
const uuidv1 = require('uuid/v1');

const ERROR_CODE_PREFIX = 1800000;

module.exports = class AccountService extends Service {

  /**
   * 登录
   * @param {String} jscode 临时登录凭票
   */
  async login(jscode) {
    const res = await this.ctx.curl(`https://api.weixin.qq.com/sns/jscode2session?appid=${this.app.config.wechat.appid}&secret=${this.app.config.wechat.secret}&js_code=${jscode}&grant_type=authorization_code`, {
      dataType: 'json',
      timeout: 3000,
    });
    const {data} = res;
    if(data.errcode !== 0) {
      throw new this.ctx.Error(ERROR_CODE_PREFIX + data.errcode, data.errmsg);
    }
    const {openid, unionid, session_key} = data;
    
  }

  /**
   * 验证
   * @param {*} token 
   */
  async verify(token) {

  }
}