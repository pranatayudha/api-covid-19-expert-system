const Symptoms = require('./domain');
const Posgre = require('../../../../helpers/databases/postgresql/db');
const config = require('../../../../infra/configs/global_config');
const db = new Posgre(config.get('/postgreConfig'));
const symptom = new Symptoms(db);

const getSymptoms = async () => {
  const getCommand = async () => symptom.getSymptoms();
  return getCommand();
};

module.exports = {
  getSymptoms,
};
