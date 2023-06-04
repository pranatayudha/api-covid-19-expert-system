const winston = require('winston');
const configs = require('../../infra/configs/global_config');
const { v4: uuidv4 } = require('uuid');
// const sentryLog = require('../components/sentry/sentry_log');

const logger = winston.createLogger({
  defaultMeta: { service: 'bridgtl-pr-be-api' },
  exitOnError: false,
  transports: [
    new winston.transports.File({
      handleExceptions: true,
      filename: `logs/${new Date()
        .toLocaleDateString('ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\//g, '_')}.log`,
    }),
  ],
});

if (configs.get('/env') !== 'production') {
  logger.add(
    new winston.transports.Console({
      handleExceptions: true,
      format: winston.format.simple(),
    })
  );
}

const log = (context, message, scope, payload = '') => {
  const obj = {
    context,
    message: message.toString(),
    scope,
    payload,
    time: new Date().toString()
  };
  // sentryLog.sendError(obj);
  logger.info(obj);
};

const logReq = async (req, userId) => {
  const uuidv4Generate = uuidv4();
  const obj = {
    'log-id': uuidv4Generate,
    'log': 'rest',
    'type': 'request',
    'userid': userId,
    'data': {
      'uri': req.url,
      'method': req.method,
      'hostname': req.log.fields.hostname,
      'content-type': req._contentType,
      'content-headers': req.headers,
      'content': {
        'body': req.body,
        'params': req.params,
        'query': req.query,
        'files': req.files,
      },
      'date': req._date,
      'server-name': req.serverName
    }
  };
  logger.info(obj);
  return { id: uuidv4Generate, userId};
};

const logRes = (res, content, log) => {
  const obj = {
    'log-id': log.id,
    'log': 'rest',
    'type': 'response',
    'userid': log.userId,
    'data': {
      'status-code': content.code,
      'uri': res.req.url,
      'method': res.req.method,
      'content-type': res.req._contentType,
      'content': content
    },
    'date': res.req._date,
    'server-name': res.req.serverName
  };
  logger.info(obj);
};

const warn = (context, message, scope, payload = '') => {
  const obj = {
    context,
    message: message.toString(),
    scope,
    payload,
    time: new Date().toString()
  };
  // sentryLog.sendError(obj);
  logger.warn(obj);
};

const error = (context, message, scope, payload = '') => {
  const obj = {
    context,
    message: message.toString(),
    scope,
    payload,
    time: new Date().toString()
  };
  // sentryLog.sendError(obj);
  logger.error(obj);
};

module.exports = {
  log,
  logReq,
  logRes,
  warn,
  error
};
