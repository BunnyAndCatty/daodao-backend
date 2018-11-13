const {Controller} = require('egg');

module.exports = class AccountController extends Controller {
  async login() {
    const {code} = this.ctx.request.query;
    const tokenEntity = await this.service.account.login(code);
    if(tokenEntity.isNewUser) {
      await this.service.bill.createBill(0, '私人账单', tokenEntity.openid);
    }
    this.ctx.body = tokenEntity;
  }

  async updateUserInfo() {
    const {encryptedData, iv} = this.ctx.request.body;
    const {openid, session_key} = this.ctx.auth;
    await this.service.account.updateUserInfo(openid, session_key, encryptedData, iv);
    this.ctx.success();
  }

  async getUserInfo() {
    const {openid} = this.ctx.auth;
    const userEntity = await this.service.account.getUserInfo(openid);
    this.ctx.body = {
      nickname: userEntity.nickname,
      avatar: userEntity.avatar_local ? `${this.app.config.host.static}/${userEntity.avatar_local}` : userEntity.avatar,
      create_time: userEntity.create_time,
      gender: userEntity.userinfo_raw_data.gender
    };
  }
}
