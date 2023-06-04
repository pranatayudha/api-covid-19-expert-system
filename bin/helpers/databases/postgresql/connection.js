
const Postgre = require('pg');
const configDB = require('../../../infra/configs/global_config');

let connectionPool = [];

const createConnectionPool = async (config) => {
  const currConnection = connectionPool.findIndex(conf => conf.config.toString() === config.toString());
  let db;
  if(currConnection === -1) {
    db = new Postgre.Pool(config);
    connectionPool.push({
      config,
      connection: db
    });
  }
  return db;
};

const getConnection = async (config) => {
  const currConnection = connectionPool.filter(conf => conf.config.toString() === config.toString());
  let conn;
  currConnection.forEach((obj,i) => {
    if(i === 0) {
      const { connection } = obj;
      conn = connection;
    }
  });
  return conn;
};

const init = async () => {
  await createConnectionPool(configDB.get('/postgreConfig'));
};

module.exports = {
  init,
  createConnectionPool,
  getConnection
};
