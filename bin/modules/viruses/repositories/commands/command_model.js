const joi = require('joi');

const checkVirus = joi.object({
    s1: joi.boolean().required(),
    s2: joi.boolean().required(),
    s3: joi.boolean().required(),
    s4: joi.boolean().required(),
    s5: joi.boolean().required(),
    s6: joi.boolean().required(),
    s7: joi.boolean().required(),
    s8: joi.boolean().required(),
    s9: joi.boolean().required(),
    s10: joi.boolean().required(),
    s11: joi.boolean().required(),
    s12: joi.boolean().required(),
    s13: joi.boolean().required(),
    s14: joi.boolean().required(),
    s15: joi.boolean().required(),
    s16: joi.boolean().required(),
    s17: joi.boolean().required(),
    s18: joi.boolean().required(),
    s19: joi.boolean().required(),
    s20: joi.boolean().required(),
    s21: joi.boolean().required(),
});

const getSolution = joi.object({
    idSymptoms: joi.array().required(),
});

module.exports = {
    checkVirus,
    getSolution
};
