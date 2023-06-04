const User = require('./domain');
const Posgre = require('../../../../helpers/databases/postgresql/db');
const config = require('../../../../infra/configs/global_config');
const db = new Posgre(config.get('/postgreConfig'));
const user = new User(db);

const generateToken = async (payload) => {
  const getCommand = async (x) => user.generateToken(x);
  return getCommand(payload);
};

const registerAdmin = async (payload) => {
  const getCommand = async (x) => user.registerAdmin(x);
  return getCommand(payload);
};

const registerUser = async (payload) => {
  const getCommand = async (x) => user.registerUser(x);
  return getCommand(payload);
};

module.exports = {
  generateToken,
  registerAdmin,
  registerUser,
};
