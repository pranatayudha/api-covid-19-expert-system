
const validate = require('validate.js');
const wrapper = require('../../utils/wrapper');
const pool = require('./connection');

class DB {
  constructor(config) {
    this.config = config;
  }

  async query(statement, values, ctx) {
    let db = await pool.getConnection(this.config);
    if(validate.isEmpty(db)){
      db = await pool.createConnectionPool(this.config);
    }
    const client = await db.connect();
    const recordset = () => {
      return new Promise(async (resolve, reject) => {
        client.query(statement, values, (err, result) => {
          if (err) {
            client.release();
            reject(wrapper.error(err.message));
          }
          else {
            client.release();
            const { rows } = result;
            resolve(wrapper.data(rows));
          }
        });
      });
    };
    const result = await recordset().then(result => {
      return result;
    }).catch(err => {
      return err;
    });
    return result;
  }

  async command(statement, values, ctx) {
    let db = await pool.getConnection(this.config);
    if(validate.isEmpty(db)){
      db = await pool.createConnectionPool(this.config);
    }
    const client = await db.connect();
    const recordset = () => {
      return new Promise( async(resolve, reject) => {
        try {
          await client.query('BEGIN');
          const result = await db.query(statement, values);
          await client.query('COMMIT');
          resolve(wrapper.data(result));
        } catch (error) {
          await client.query('ROLLBACK');
          reject(wrapper.error(error));
        } finally {
          client.release();
        }
      });
    };
    const result = await recordset().then(result => {
      return result;
    }).catch(err => {
      return err;
    });
    return result;
  }

}

module.exports = DB;
