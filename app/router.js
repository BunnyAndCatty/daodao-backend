'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  router.get('/account/login', controller.account.login);
  router.get('/account/updateUserInfo', controller.account.updateUserInfo);
};
