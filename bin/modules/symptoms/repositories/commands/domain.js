const Query = require('../../../../helpers/databases/postgresql/query');
const wrapper = require('../../../../helpers/utils/wrapper');
const { NotFoundError } = require('../../../../helpers/error');

class Symptoms {
  constructor(db) {
    this.query = new Query(db);
  }

  async getSymptoms() {
    const ctx = 'POST:/v1/symptoms';

    let values = [];
    let params = 'select id, name from public.symptoms';

    const isSymptomsExist = await this.query.find(params, values, ctx);
    if (isSymptomsExist.err || isSymptomsExist.data.length == 0) {
      return wrapper.error(new NotFoundError('Tidak ada data gejala'));
    }

    let newData = isSymptomsExist.data.map((v) => ({...v, value: false}));

    return wrapper.data(newData);
  }
}

module.exports = Symptoms;
