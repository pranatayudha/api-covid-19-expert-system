const Query = require('../../../../helpers/databases/postgresql/query');
const wrapper = require('../../../../helpers/utils/wrapper');
const { WRAPPER } = require('../../../../infra/configs/text');
const { NotFoundError, BadRequestError } = require('../../../../helpers/error');

class Virus {
    constructor(db) {
        this.query = new Query(db);
    }

    async getVirus(payload) {
        const ctx = 'GET:/v1/viruses/:id';
        const { id } = payload;

        let values = [id];
        let params = 'select * from public.viruses where "id" = $1';

        const virusIsExist = await this.query.find(params, values, ctx);
        if (
            virusIsExist.err ||
            virusIsExist.data.length == 0 ||
            virusIsExist.data == undefined ||
            virusIsExist.data == ''
        ) {
            return wrapper.error(new NotFoundError('Data tidak ditemukan'));
        }

        return wrapper.data(virusIsExist.data[0]);
    }
}

module.exports = Virus;
