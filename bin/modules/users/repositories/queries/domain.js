const Query = require('../../../../helpers/databases/postgresql/query');
const wrapper = require('../../../../helpers/utils/wrapper');
const { NotFoundError } = require('../../../../helpers/error');

class User {
  constructor(db) {
    this.query = new Query(db);
  }

  async getDataAoById(id) {
    // for redis cek
    const values = [id];
    const paramsDoc = 'select "pn", "accessLevel" from custom.employees where "pn" = $1';
    const docIsAxist = await this.query.find(paramsDoc, values, 'MIDDLEWARE:VERIFY_TOKEN');
    if (docIsAxist.err || docIsAxist.data.length == 0 || docIsAxist.data == undefined || docIsAxist.data == '') {
      return wrapper.error(new NotFoundError(docIsAxist.err));
    }
    return docIsAxist;
  }

  async getDataPariById(id) {
    // for redis cek
    const values = [id];
    const paramsDoc = 'select "idPari", "fullName", "phoneNum" from custom.user_pari where "idPari" = $1';
    const docIsAxist = await this.query.find(paramsDoc, values, 'MIDDLEWARE:VERIFY_TOKEN_PARI');
    if (docIsAxist.err || docIsAxist.data.length == 0 || docIsAxist.data == undefined || docIsAxist.data == '') {
      return wrapper.error(new NotFoundError(docIsAxist.err));
    }
    return docIsAxist;
  }
}

module.exports = User;
