const Virus = require('./domain');
const Posgre = require('../../../../helpers/databases/postgresql/db');
const config = require('../../../../infra/configs/global_config');
const db = new Posgre(config.get('/postgreConfig'));
const virus = new Virus(db);

const getVirus = async (payload) => {
    const getCommand = async (x) => virus.getVirus(x);
    return getCommand(payload);
};

module.exports = {
    getVirus,
};
