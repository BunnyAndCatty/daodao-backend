const secret = require('../secret');

module.exports = appInfo => {
  const config = exports = {};

  // Redis配置
  config.redis = {
    client: {
      port: 6379,
      host: '172.17.0.3',
      password: '',
      db: 0,
    },
  }

  // 数据库配置
  config.mysql = {
    client: {
      host: '172.17.0.4',
      port: '3306',
      user: 'root',
      password: secret.mysql.password,
      database: 'daodao',
    },
    app: true,
    agent: false,
  }

  return config;
};