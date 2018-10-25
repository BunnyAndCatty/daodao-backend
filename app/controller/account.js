const {Controller} = require('egg');
const request = require('request');

module.exports = class AccountController extends Controller {
  async login() {
    const {code} = this.ctx.request.query;
    let res = await request(`https://api.weixin.qq.com/sns/jscode2session?appid=${this.app.config.wechat.appid}&secret=${this.app.config.wechat.secret}&js_code=${code}&grant_type=authorization_code`);
    res = await res.json();
    this.ctx.body = res;
  }
}
