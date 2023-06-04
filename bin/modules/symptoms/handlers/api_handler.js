const commandHandler = require('../repositories/commands/command_handler');
const commandModel = require('../repositories/commands/command_model');
const wrapper = require('../../../helpers/utils/wrapper');
const validator = require('../../../helpers/utils/validator');
const { ERROR: httpError, SUCCESS: http } = require('../../../helpers/http-status/status_code');
const { WRAPPER } = require('../../../infra/configs/text');

const getSymptoms = async (req, res) => {
  const sendResponse = async (result) => {
    result.err
      ? wrapper.response(res, WRAPPER.FAIL, result, 'Tidak ada data gejala', httpError.NOT_FOUND)
      : wrapper.response(res, WRAPPER.SUCCESS, result, '-', http.OK);
  };

  sendResponse(await commandHandler.getSymptoms());
};

module.exports = {
  getSymptoms,
};
