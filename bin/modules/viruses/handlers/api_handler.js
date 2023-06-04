const commandHandler = require('../repositories/commands/command_handler');
const commandModel = require('../repositories/commands/command_model');
const queryModel = require('../repositories/queries/query_model');
const queryHandler = require('../repositories/queries/query_handler');
const wrapper = require('../../../helpers/utils/wrapper');
const validator = require('../../../helpers/utils/validator');
const { ERROR: httpError, SUCCESS: http } = require('../../../helpers/http-status/status_code');
const { WRAPPER } = require('../../../infra/configs/text');

const checkVirus = async (req, res) => {
  const payload = req.body;
  const validatePayload = await validator.isValidPayload(payload, commandModel.checkVirus);
  const postRequest = async (result) => {
    if (result.err) {
      return result;
    }
    return commandHandler.checkVirus({...payload, userId: req.userId });
  };
  const sendResponse = async (result) => {
    result.err
      ? wrapper.response(res, WRAPPER.FAIL, result, 'Gagal', httpError.UNAUTHORIZED)
      : wrapper.response(res, WRAPPER.SUCCESS, result, 'Berhasil', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

const getVirus = async (req, res) => {
  const payload = req.params;
  const validatePayload = await validator.isValidPayload(payload, queryModel.getVirus);
  const postRequest = async (result) => {
    if (result.err) {
      return result;
    }
    return queryHandler.getVirus(payload);
  };
  const sendResponse = async (result) => {
    result.err
      ? wrapper.response(res, WRAPPER.FAIL, result, 'Gagal', httpError.UNAUTHORIZED)
      : wrapper.response(res, WRAPPER.SUCCESS, result, 'Berhasil', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

const getSolution = async (req, res) => {
  const payload = req.body;
  const validatePayload = await validator.isValidPayload(payload, commandModel.getSolution);
  const postRequest = async (result) => {
    if (result.err) {
      return result;
    }
    return commandHandler.getSolution(payload);
  };
  const sendResponse = async (result) => {
    result.err
      ? wrapper.response(res, WRAPPER.FAIL, result, 'Gagal', httpError.UNAUTHORIZED)
      : wrapper.response(res, WRAPPER.SUCCESS, result, 'Berhasil', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

module.exports = {
  checkVirus,
  getVirus,
  getSolution,
};
