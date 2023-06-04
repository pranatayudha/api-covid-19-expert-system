const jwt = require('jsonwebtoken');
const config = require('../infra/configs/global_config');
const { WRAPPER } = require('../infra/configs/text');
const Query = require('../helpers/databases/postgresql/query');
const queryUser = require('../modules/users/repositories/queries/query_handler');
const wrapper = require('../helpers/utils/wrapper');
const { ERROR } = require('../helpers/http-status/status_code');
const { UnauthorizedError, ForbiddenError } = require('../helpers/error');

const userQuery = new Query();
const privateKey = config.get('/privateKey');
const publicKey = config.get('/publicKey');
const audience = config.get('/audience');

const generateToken = async (payload, secondExpired) => {
  const verifyOptions = {
    algorithm: 'RS256',
    audience: audience,
    issuer: 'covid19es',
    expiresIn: secondExpired ? secondExpired : '1000m',
  };
  const token = jwt.sign(payload, privateKey, verifyOptions);
  return token;
};

const getToken = async (headers) => {
  if (headers && headers.authorization && headers.authorization.includes('Bearer')) {
    const parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    }
  }
  return undefined;
};

const generateRefreshToken = async (payload, secondExpired) => {
  const verifyOptions = {
    algorithm: 'HS256',
    issuer: 'covid19es',
    expiresIn: secondExpired ? secondExpired : '1000m',
  };
  const token = jwt.sign(payload, privateKey, verifyOptions);
  return token;
};

const verifyToken = async (req, res, next) => {
  const result = {
    data: null,
  };
  const verifyOptions = {
    algorithm: 'RS256',
    audience: audience,
    issuer: 'covid19es',
  };

  const token = await getToken(req.headers);
  if (!token) {
    result.err = new ForbiddenError(WRAPPER.INVALID_TOKEN);
    return wrapper.response(res, WRAPPER.FAIL, result, WRAPPER.INVALID_TOKEN, ERROR.FORBIDDEN);
  }
  let decodedToken;
  try {
    decodedToken = await jwt.verify(token, publicKey, verifyOptions);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      result.err = new UnauthorizedError(WRAPPER.EXPIRED_TOKEN);
      return wrapper.response(res, WRAPPER.FAIL, result, WRAPPER.EXPIRED_TOKEN, ERROR.UNAUTHORIZED);
    }
    result.err = new UnauthorizedError(WRAPPER.INVALID_TOKEN);
    return wrapper.response(res, WRAPPER.FAIL, result, WRAPPER.INVALID_TOKEN, ERROR.UNAUTHORIZED);
  }

  req.userId = decodedToken.id;

  next();
};

const verifyTokenPari = async (req, res, next) => {
  const result = { data: null };
  const verifyOptions = {
    audience: audience,
    algorithm: 'RS256',
    issuer: 'covid19es',
  };

  const tokenPari = await getToken(req.headers);
  if (!tokenPari) {
    result.err = new ForbiddenError(WRAPPER.INVALID_TOKEN);
    return wrapper.response(res, WRAPPER.FAIL, result, WRAPPER.INVALID_TOKEN, ERROR.FORBIDDEN);
  }
  let decodedToken;
  try {
    decodedToken = await jwt.verify(tokenPari, publicKey, verifyOptions);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      result.err = new UnauthorizedError(WRAPPER.EXPIRED_TOKEN);
      return wrapper.response(res, WRAPPER.FAIL, result, WRAPPER.EXPIRED_TOKEN, ERROR.UNAUTHORIZED);
    }
    result.err = new UnauthorizedError(WRAPPER.INVALID_TOKEN);
    return wrapper.response(res, WRAPPER.FAIL, result, WRAPPER.INVALID_TOKEN, ERROR.UNAUTHORIZED);
  }
  const userId = decodedToken.userPari;
  const userPari = await queryUser.getDataPariById(userId);
  if (userPari.err) {
    result.err = new ForbiddenError(WRAPPER.INVALID_TOKEN);
    return wrapper.response(res, WRAPPER.FAIL, result, WRAPPER.INVALID_TOKEN, ERROR.FORBIDDEN);
  }
  req.user = userPari.data[0];
  next();
};

const verifySuperAdmin = async (req, res, next) => {
  const result = {
    data: null,
  };
  if (req.user.ROLE != 1) {
    result.err = new UnauthorizedError(WRAPPER.NOT_ALLOW);
    return wrapper.response(res, WRAPPER.FAIL, result, WRAPPER.NOT_ALLOW, ERROR.UNAUTHORIZED);
  }
  next();
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifySuperAdmin,
  verifyTokenPari,
};
