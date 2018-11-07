const {Controller} = require('egg');

module.exports = class AccountController extends Controller {
  async login() {
    const {code} = this.ctx.request.query;
    const token = await this.service.account.login(code);
    this.ctx.body = token; 
  }

  async updateUserInfo() {
    const {encryptedData, iv} = this.ctx.request.body;
    const {openid, session_key} = this.ctx.auth;
    await this.service.account.updateUserInfo(openid, session_key, encryptedData, iv);
  }
}
