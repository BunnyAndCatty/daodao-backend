'use strict';

const Controller = require('egg').Controller;

module.exports = class BillController extends Controller {
  
  async createBill() {
    const {type, name} = this.ctx.request.query;
    const {openid} = this.ctx.auth;
    await this.ctx.service.bill.createBill(type, name, openid);
    this.ctx.success();
  }

  async getAllRecordTag() {
    const tags = await this.ctx.service.bill.getAllRecordTag();
    const tree = tags.reduce((obj, item) => {
      const parent = obj[item.parent_id];
      if(parent) parent.items = parent.items.concat(item);
      else obj[item.id] = { ...item, items: []};
      return obj;
    }, {});
    this.ctx.body = Object.values(tree);
  }

  async getMyBill() {
    const {openid} = this.ctx.auth;
    this.ctx.body = await this.service.bill.getMyBill(openid);
  }

  async getMemberByBill() {
  }
}
