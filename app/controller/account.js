const {Controller} = require('egg');

module.exports = class AccountController extends Controller {
  async login() {
    const {code} = this.ctx.request.query;
    const res = await this.service.account.login(code);
    // this.ctx.body = res.data;
  }
}
