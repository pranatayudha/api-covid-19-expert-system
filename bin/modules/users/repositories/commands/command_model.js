const joi = require('joi').extend(require('@joi/date'));

const generateToken = joi.object({
  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'id'] } })
    .optional()
    .allow(''),
  password: joi.string().required(),
});

const registerAdmin = joi.object({
  fullname: joi.string().required(),
  dob: joi.date().format(['DD/MM/YYYY']).required(),
  gender: joi.string().required(),
  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'id'] } })
    .optional()
    .allow(''),
  password: joi.string().required(),
  phoneNum: joi
    .string()
    .regex(/^[+](62)8[1-9][0-9]{7,10}$/)
    .required(),
});

const registerUser = joi.object({
  fullname: joi.string().required(),
  dob: joi.date().format(['DD/MM/YYYY']).required(),
  gender: joi.string().required(),
  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'id'] } })
    .optional()
    .allow(''),
  phoneNum: joi
    .string()
    .regex(/^[+](62)8[1-9][0-9]{7,10}$/)
    .required(),
});

const token = joi.object({
  refreshToken: joi.string().required(),
});

module.exports = {
  generateToken,
  registerAdmin,
  registerUser,
  token,
};
