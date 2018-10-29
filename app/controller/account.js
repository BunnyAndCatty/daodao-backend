const {Controller} = require('egg');

module.exports = class AccountController extends Controller {
  async login() {
    const {code} = this.ctx.request.query;
    const token = await this.service.account.login(code);
    this.ctx.body = token;
  }
}
