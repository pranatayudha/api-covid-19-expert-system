const Query = require('../../../../helpers/databases/postgresql/query');
const wrapper = require('../../../../helpers/utils/wrapper');
const { BadRequestError, NotFoundError } = require('../../../../helpers/error');
const { virusesMapping } = require('../../../../helpers/utils/global');

class Virus {
  constructor(db) {
    this.query = new Query(db);
  }

  async checkVirus(payload) {
    const ctx = 'POST:/v1/viruses/check';

    Object.prototype.allFalse = function () {
      for (var i in this) {
        if (this[i] === true || 'true') return false;
      }
      return true;
    };

    if (payload.allFalse()) {
      return wrapper.error(new NotFoundError());
    } else {
      const { userId } = payload;
      let vmRes = await virusesMapping(payload);

      let values = [vmRes.symptoms, vmRes.virus, userId];
      let params = `
                INSERT INTO public.viruses_mapping
                  ( 
                    id_symptoms, id_virus, id_user
                  )
                VALUES 
                  ( 
                    $1, $2, $3
                  )
                  RETURNING *
            `;

      const insertVirusesMapping = await this.query.updateOrInsertOrDelete(
        params,
        values,
        ctx
      );
      if (insertVirusesMapping.err) {
        return wrapper.error(new BadRequestError('Gagal input gejala'));
      }

      return wrapper.data({
        idVirusesMapping: insertVirusesMapping.data.rows[0].id,
        idVirus: insertVirusesMapping.data.rows[0].id_virus,
        idSymptoms: insertVirusesMapping.data.rows[0].id_symptoms,
      });
    }
  }

  async getSolution(payload) {
    const ctx = 'GET:/v1/solution';
    const { idSymptoms } = payload;

    let values = [idSymptoms];
    let params = `SELECT * FROM public.solutions s
        inner join public.symptoms sy on s."id_symptoms" = sy."id"
        WHERE s."id_symptoms" = ANY($1::INT[])`;
    const dataSolution = await this.query.find(params, values, ctx);
    if (
      dataSolution.err ||
      dataSolution.data.length == 0 ||
      dataSolution.data == undefined ||
      dataSolution.data == ''
    ) {
      return wrapper.error(new NotFoundError('Data tidak ditemukan'));
    }

    return wrapper.data(dataSolution.data);
  }
}

module.exports = Virus;
