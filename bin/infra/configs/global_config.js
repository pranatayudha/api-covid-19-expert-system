require('dotenv').config();
const confidence = require('confidence');

const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  basicAuthApi: [
    {
      username: process.env.BASIC_AUTH_USERNAME,
      password: process.env.BASIC_AUTH_PASSWORD
    }
  ],
  publicKey: process.env.PUBLIC_KEY_PATH,
  privateKey: process.env.PRIVATE_KEY_PATH,
  audience: process.env.AUDIENCE,
  postgreConfig:{
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    port: process.env.POSTGRES_PORT,
    max:  parseInt(process.env.POSTGRES_MAX),
    idleTimeoutMillis: parseInt(process.env.POSTGRES_TIMEOUT)
  },
};

const store = new confidence.Store(config);

exports.get = key => store.get(key);
