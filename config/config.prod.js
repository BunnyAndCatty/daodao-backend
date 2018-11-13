const secret = require('../secret');

module.exports = appInfo => {
  const config = exports = {};

  // Redis配置
  config.redis = {
    client: {
      port: 32770,
      host: '127.0.0.1',
      password: '',
      db: 0,
    },
  }

  // 数据库配置
  config.mysql = {
    client: {
      host: '127.0.0.1',
      port: '32768',
      user: 'root',
      password: secret.mysql.password,
      database: 'daodao',
    },
    app: true,
    agent: false,
  }

  // 消息队列
  config.queue = {
    register: false,
    listen: 7002,
    prefix: 'kuequeue',
    redis: {
      ...config.redis.client,
      db: 1
    }
  }

  return config;
};