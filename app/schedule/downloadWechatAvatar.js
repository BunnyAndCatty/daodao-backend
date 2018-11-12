const Subscription = require('egg').Subscription;
const download = require('download');
const uuidv1 = require('uuid/v1');

module.exports = class DownloadWechatAvatar extends Subscription {
  
  static get schedule() {
    return {
      interval: '1h', // 1 分钟间隔
      type: 'worker', // 指定所有的 worker 都需要执行
      env: ['prod']
    };
  }

  async subscribe() {
    const list = await this.ctx.service.account.getUnLocalizeAccount();
    for(let i = 0; i<list.length; i++) {
      const user = list[i];
      const filename = `${uuidv1()}-${Date.now()}.png`;
      await download(user.avatar, 'static', { filename });
      await this.ctx.service.account.updateLocalAvatar(user.openid, filename);
    }
  }
}
