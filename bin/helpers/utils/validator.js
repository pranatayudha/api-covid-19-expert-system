const validate = require('validate.js');
const wrapper = require('./wrapper');

const isValidPayload = async (payload, constraint) => {
  const { value, error } = await constraint.validate(payload);
  if (!validate.isEmpty(error)) {
    const sendErr = error.details[0].message;
    return wrapper.error({ msg: sendErr });
  }
  return wrapper.data(value);
};

module.exports = {
  isValidPayload
};
