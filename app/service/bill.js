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
}