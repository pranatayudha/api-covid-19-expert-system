
const Symptoms = require('./domain');
const Posgre = require('../../../../helpers/databases/postgresql/db');
const config = require('../../../../infra/configs/global_config');
const db = new Posgre(config.get('/postgreConfig'));
const symptom = new Symptoms(db);

const getDataAoById = async (payload) => {
  const getCommand = async (x) => symptom.getDataAoById(x);
  return getCommand(payload);
};

const getDataPariById = async (payload) => {
  const getCommand = async (x) => symptom.getDataPariById(x);
  return getCommand(payload);
};

module.exports = {
  getDataAoById,
  getDataPariById
};
