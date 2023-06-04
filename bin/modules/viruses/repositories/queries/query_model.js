const joi = require('joi');

const getVirus = joi.object({
    id: joi.string().required(),
});

module.exports = {
    getVirus,
};
