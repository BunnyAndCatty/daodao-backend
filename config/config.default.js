'use strict';

const secret = require('../secret');

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1540379430916_4886';

  // add your config here
  config.middleware = [];

  // 微信相关配置
  config.wechat = {
    server: 'https://api.weixin.qq.com',
    appid: secret.wxapp.appid,
    secret: secret.wxapp.appsecret
  }

  return config;
};
