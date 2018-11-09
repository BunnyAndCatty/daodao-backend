const mm = require('egg-mock');

it('下载微信头像', async () => {
  const app = mm.app();
  await app.ready();
  await app.runSchedule('downloadWechatAvatar');
});