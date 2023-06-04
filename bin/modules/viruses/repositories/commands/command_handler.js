const Virus = require('./domain');
const Posgre = require('../../../../helpers/databases/postgresql/db');
const config = require('../../../../infra/configs/global_config');
const db = new Posgre(config.get('/postgreConfig'));
const virus = new Virus(db);

const checkVirus = async (payload) => {
  const getCommand = async (x) => virus.checkVirus(x);
  return getCommand(payload);
};

const getSolution = async (payload) => {
  const getCommand = async (x) => virus.getSolution(x);
  return getCommand(payload);
};

module.exports = {
  checkVirus,
  getSolution,
};
