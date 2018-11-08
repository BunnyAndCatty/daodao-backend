'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  router.get('/account/login', controller.account.login);
  router.post('/account/updateUserInfo', controller.account.updateUserInfo);

  router.get('/bill/create', controller.bill.createBill);
  router.get('/bill/recordTag', controller.bill.getAllRecordTag);
};
