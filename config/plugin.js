'use strict';

exports.redis = {
  enable: true,
  package: 'egg-redis',
};

exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};

exports.queue = {
  enable: false,
  package: 'egg-queue',
}