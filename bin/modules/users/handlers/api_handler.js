const commandHandler = require('../repositories/commands/command_handler');
const commandModel = require('../repositories/commands/command_model');
const wrapper = require('../../../helpers/utils/wrapper');
const validator = require('../../../helpers/utils/validator');
const { ERROR: httpError, SUCCESS: http } = require('../../../helpers/http-status/status_code');
const { WRAPPER } = require('../../../infra/configs/text');

const generateToken = async (req, res) => {
  const payload = req.body;
  const validatePayload = await validator.isValidPayload(payload, commandModel.generateToken);
  const postRequest = async (result) => {
    if (result.err) {
      return result;
    }
    return commandHandler.generateToken(payload);
  };
  const sendResponse = async (result) => {
    result.err
      ? wrapper.response(res, WRAPPER.FAIL, result, 'Gagal login', httpError.UNAUTHORIZED)
      : wrapper.response(res, WRAPPER.SUCCESS, result, 'Berhasil login!', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

const registerAdmin = async (req, res) => {
  const payload = req.body;
  const validatePayload = await validator.isValidPayload(payload, commandModel.registerAdmin);
  const postRequest = async (result) => {
    if (result.err) {
      return result;
    }
    return commandHandler.registerAdmin(payload);
  };
  const sendResponse = async (result) => {
    result.err
      ? wrapper.response(res, WRAPPER.FAIL, result, 'Gagal register admin', httpError.UNAUTHORIZED)
      : wrapper.response(res, WRAPPER.SUCCESS, result, 'Berhasil register admin!', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

const registerUser = async (req, res) => {
  const payload = req.body;
  const validatePayload = await validator.isValidPayload(payload, commandModel.registerUser);
  const postRequest = async (result) => {
    if (result.err) {
      return result;
    }
    return commandHandler.registerUser(payload);
  };
  const sendResponse = async (result) => {
    result.err
      ? wrapper.response(res, WRAPPER.FAIL, result, 'Gagal input data diri', httpError.UNAUTHORIZED)
      : wrapper.response(res, WRAPPER.SUCCESS, result, 'Berhasil input data diri!', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

module.exports = {
  generateToken,
  registerAdmin,
  registerUser,
};
