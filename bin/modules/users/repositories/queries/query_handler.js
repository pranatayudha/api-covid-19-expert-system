const User = require('./domain');
const Posgre = require('../../../../helpers/databases/postgresql/db');
const config = require('../../../../infra/configs/global_config');
const db = new Posgre(config.get('/postgreConfig'));
const user = new User(db);

const getDataAoById = async (payload) => {
  const getCommand = async (x) => user.getDataAoById(x);
  return getCommand(payload);
};

const getDataPariById = async (payload) => {
  const getCommand = async (x) => user.getDataPariById(x);
  return getCommand(payload);
};

module.exports = {
  getDataAoById,
  getDataPariById,
};
