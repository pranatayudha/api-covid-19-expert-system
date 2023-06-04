const joi = require('joi').extend(require('@joi/date'));

const generateToken = joi.object({
  name: joi.string().max(50).required(),
  password: joi.string().required()
});

module.exports = {
  generateToken
};
