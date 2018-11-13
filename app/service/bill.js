const { Service } = require('egg');

module.exports = class BillService extends Service {

  /**
   * 创建账单
   * @param {Number} type 账单类型 0-私有账单 1-群组账单
   * @param {String} name 账单名字
   * @param {String} owner 所有者
   */
  async createBill(type, name, owner) {
    const billEntity = await this.app.mysql.insert('bill', {
      type, name, owner
    });
    return billEntity.id;
  }

  /**
   * 获取所有Tag
   */
  async getAllRecordTag() {
    const tags = await this.app.mysql.select('record_tag', {
      columns: ['id', 'name', 'icon', 'parent_id'],
      orders: [['parent_id'], ['id']]
    });
    return tags.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      parent_id: item.parent_id
    }))
  }

  /**
   * 获取我的账单列表
   * @param {String} openid 唯一标示
   */
  async getMyBill(openid) {
    let myPublicBillIds = await this.app.mysql.select('bill_member', {
      columns: ['bill_id'],
      where: {openid}
    });
    myPublicBillIds = myPublicBillIds.map(item => item.bill_id).join(',');
    const myBills = await this.app.mysql.query(`
      Select id, type, name, create_time 
      From bill 
      Where owner='${openid}' OR id in (${myPublicBillIds})
    `);
    return myBills;
  }

  /**
   * 检查指定账户是否有权限操作指定账单
   * @param {*} openid 账户唯一标示
   * @param {*} billId 账单编号
   */
  async haveAuthToBill(openid, billId) {

  }

  /**
   * 获取账单详情
   * @param {Number} billId 账单编号
   */
  async getBillDetail(billId) {
    return this.app.mysql.get('bill', {id: billId});
  }

  /**
   * 获取账单成员
   * @param {Number} billId 账单编号
   */
  async getMemberByBill(billId) {
    return this.app.mysql.select('bill_member', {
      columns: ['openid', 'identity', 'create_time'],
      where: {
        bill_id: billId
      }
    });
  }
}