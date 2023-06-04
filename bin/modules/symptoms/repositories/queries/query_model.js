
const joi = require('joi');

const getAdminList = joi.object({
  page: joi.number().optional().default('1'),
  limit: joi.number().optional().default('10'),
  pn: joi.string().allow('').optional(),
});

const adminByID = joi.object({
  id: joi.string().required()
});

module.exports = {
  getAdminList,
  adminByID
};
