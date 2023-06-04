
const { NotFoundError, InternalServerError, BadRequestError, ConflictError, ExpectationFailedError,
  ForbiddenError, GatewayTimeoutError, ServiceUnavailableError, UnauthorizedError } = require('../error');
const { ERROR: httpError } = require('../http-status/status_code');
const { logRes } = require('../../helpers/utils/logger');

const data = (data) => ({ err: null, data });

const paginationData = (data, meta) => ({ err: null, data, meta });

const error = (err) => ({ err, data: null });

const response = (res, type, result, message = '', code = 200, log = { id: '', userId: ''}) => {
  let status = true;
  let data = result.data;
  if (type === 'fail') {
    status = false;
    data = '';
    message = result.err.message || message;
    code = checkErrorCode(result.err);
  }
  const content = {
    success: status,
    data,
    message,
    code
  };
  logRes(res, content, log);
  res.send(code, content);
};

const responseSlik = (res, type, result, message = '', code = 200) => {
  let status = code;
  let status1 = true;
  let desc = 'Data Tidak Tersimpan';
  if (status1) desc = 'Data Tersimpan';
  let data1 = result.data;
  if (type === 'fail') {
    status1 = false;
    data1 = '';
    message = result.err.message || message;
    code = checkErrorCode(result.err);
  }
  res.send(code,
    {
      success: status1,
      desc: desc,
      data: data1,
      message,
      status
    });
};

const paginationResponse = (res, type, result, message = '', code = 200) => {
  let status = true;
  let data = result.data;
  if (type === 'fail') {
    status = false;
    data = '';
    message = result.err;
  }
  res.send(code,
    {
      success: status,
      data,
      meta: result.meta,
      code,
      message
    }
  );
};

const checkErrorCode = (error) => {
  switch (error.constructor) {
  case BadRequestError:
    return httpError.BAD_REQUEST;
  case ConflictError:
    return httpError.CONFLICT;
  case ExpectationFailedError:
    return httpError.EXPECTATION_FAILED;
  case ForbiddenError:
    return httpError.FORBIDDEN;
  case GatewayTimeoutError:
    return httpError.GATEWAY_TIMEOUT;
  case InternalServerError:
    return httpError.INTERNAL_ERROR;
  case NotFoundError:
    return httpError.NOT_FOUND;
  case ServiceUnavailableError:
    return httpError.SERVICE_UNAVAILABLE;
  case UnauthorizedError:
    return httpError.UNAUTHORIZED;
  default:
    return httpError.CONFLICT;
  }
};

module.exports = {
  data,
  paginationData,
  error,
  response,
  paginationResponse,
  responseSlik
};
