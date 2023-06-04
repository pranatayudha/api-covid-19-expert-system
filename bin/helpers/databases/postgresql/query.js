const wrapper = require('../../utils/wrapper');
const { BadRequestError } = require('../../error');
const { WRAPPER } = require('../../../infra/configs/text');
class Query {

  constructor(db) {
    this.db = db;
  }

  async updateOrInsertOrDelete(parameter, values, ctx) { // insert/update/delete
    const recordset = await this.db.command(parameter, values, ctx);
    return recordset;
  }

  async find(parameter, values, ctx) {
    const recordset = await this.db.query(parameter, values, ctx);
    if (recordset.err) {
      return wrapper.error(new BadRequestError(WRAPPER.FAILED_DB_SELECT));
    }
    return recordset;
  }

  async findMeta(parameter, ctx) {
    const { paramData, page, limit, values } = parameter;
    const counter = await this.db.query(paramData, values, ctx);
    if (counter.err) {
      return wrapper.error(new BadRequestError(WRAPPER.FAILED_DB_SELECT));
    }
    let lastPage = Math.ceil(counter.data[0].count / limit);
    return {
      currentPage: page,
      size: limit,
      totalData: parseInt(counter.data[0].count),
      lastPage: lastPage
    };
  }
}

module.exports = Query;
