const restify = require('restify');
const logger = require('../helpers/utils/logger');
const corsMiddleware = require('restify-cors-middleware');
const basicAuth = require('../auth/basic_auth_helper');
const jwtAuth = require('../auth/jwt_auth_helper');
const project = require('../../package.json');
const wrapper = require('../helpers/utils/wrapper');

// handler for module
const user = require('../modules/users/handlers/api_handler');
const symptom = require('../modules/symptoms/handlers/api_handler');
const virus = require('../modules/viruses/handlers/api_handler');


function AppServer() {
  this.server = restify.createServer({
    name: `${project.name}-server`,
    version: project.version,
  });

  this.server.serverKey = '';
  this.server.use(restify.plugins.acceptParser(this.server.acceptable));
  this.server.use(restify.plugins.queryParser());
  this.server.use(
    restify.plugins.bodyParser({
      multiples: true,
    })
  );
  this.server.use(restify.plugins.authorizationParser());

  // required for CORS configuration
  const corsConfig = corsMiddleware({
    preflightMaxAge: 5,
    origins: ['*'],
    allowHeaders: ['*'],
    exposeHeaders: ['*'],
  });
  this.server.pre(corsConfig.preflight);
  this.server.use(corsConfig.actual);

  // required for basic auth
  this.server.use(basicAuth.init());

  this.server.get('/', (req, res) => {
    wrapper.response(res, 'success', wrapper.data('Index'), 'This service is running properly');
  });

  // User
  this.server.post('/v1/login', basicAuth.isAuthenticated, user.generateToken);
  this.server.post('/v1/register/admin', basicAuth.isAuthenticated, user.registerAdmin);
  this.server.post('/v1/register/user', basicAuth.isAuthenticated, user.registerUser);

  // Symptoms
  this.server.get('/v1/symptoms', jwtAuth.verifyToken, symptom.getSymptoms);

  // Check Viruses and Get Solution
  this.server.post('/v1/viruses/check', jwtAuth.verifyToken, virus.checkVirus);
  this.server.get('/v1/viruses/:id', jwtAuth.verifyToken, virus.getVirus);
  this.server.post('/v1/solution', jwtAuth.verifyToken, virus.getSolution);

  // BEGIN GRACEFUL SHUTDOWN
  const startGracefulShutdown = () => {
    logger.log('Starting graceful shutdown', `${this.server.name} stop`, 'stop application');
    if (!this.server.listening) process.exit(0);
    logger.log('Closing graceful shutdown', `${this.server.name} closing`, 'closing application');

    this.server.close((error) => {
      if (error) {
        logger.log('Critical error - graceful shutdown', `${this.server.name} process exit`, 'critical error application');
        return process.exit(1);
      }
      logger.log('Exiting graceful shutdown', `${this.server.name} process exit`, 'exit application');
      process.exit(0);
    });
  };

  process.on('SIGINT', startGracefulShutdown);
  process.on('SIGTERM', startGracefulShutdown);
  process.on('SIGHUP', startGracefulShutdown);
  // END GRACEFUL SHUTDOWN //
}

module.exports = AppServer;
