'use strict';

const secret = require('../secret');

module.exports = appInfo => {
  const config = exports = {};

  // Cookies配置
  config.keys = appInfo.name + '_1540379430916_4886';

  // 中间件配置
  config.middleware = [
    'error',
    'trace'
  ];

  // 微信相关配置
  config.wechat = {
    server: 'https://api.weixin.qq.com',
    appid: secret.wxapp.appid,
    secret: secret.wxapp.appsecret
  }

  // Redis配置
  config.redis = {
    client: {
      port: 32770,
      host: 'redis.tool.zh-yu.com',
      password: '',
      db: 0,
    },
  }

  // 数据库配置
  config.mysql = {
    client: {
      host: 'mysql.tool.zh-yu.com',
      port: '32768',
      user: 'root',
      password: secret.mysql.password,
      database: 'daodao',
    },
    app: true,
    agent: false,
  }

  // 令牌配置
  config.token = {
    expireDuration: 30 * 3600 * 1000
  }

  config.auth = {
    whileList: [
      '/'
    ]
  }

  return config;
};
