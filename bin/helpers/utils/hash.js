const bcrypt = require('bcrypt');
const config = require('../../infra/configs/global_config');
const saltRounds = config.get('/salt');

const hashPass = async (pass) => {
  const salt = await bcrypt.genSaltSync(parseInt(saltRounds));
  const hashing = await bcrypt.hashSync(pass, salt);
  return hashing;
}

const comparePass = async (pass, hash) => {
  const result = await bcrypt.compareSync(pass, hash);;
  return result;
}

module.exports = {
  hashPass,
  comparePass
}