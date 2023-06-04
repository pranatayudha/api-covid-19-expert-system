const Query = require('../../../../helpers/databases/postgresql/query');
const wrapper = require('../../../../helpers/utils/wrapper');
const jwtAuth = require('../../../../auth/jwt_auth_helper');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require('../../../../helpers/error');
const { expiredToken } = require('../../utils/constant');
const { hashPass, comparePass } = require('../../../../helpers/utils/hash');
const { dateValid } = require('../../../../helpers/utils/global');

class User {
  constructor(db) {
    this.query = new Query(db);
  }

  async generateToken(payload) {
    const ctx = 'POST:/v1/login';
    const { email, password } = payload;
    let values = [email, 'A'];
    let params = 'select * from public.users where email = $1 and type = $2';
    const isUserExist = await this.query.find(params, values, ctx);

    if (isUserExist.err) {
      return wrapper.error(new BadRequestError('Error'));
    }

    if (isUserExist.data.length == 0) {
      return wrapper.error(
        new NotFoundError('Username atau password tidak valid')
      );
    }

    const compareResult = await comparePass(
      password,
      isUserExist.data[0].password
    );
    if (!compareResult) {
      return wrapper.error(
        new NotFoundError('Username atau password tidak valid')
      );
    }

    let data = {
      email: isUserExist.data[0].email,
      fullname: isUserExist.data[0].fullname,
    };

    const accessToken = await jwtAuth.generateToken(
      data,
      expiredToken.accessToken
    );
    data = {
      id: isUserExist.data[0].id,
      fullname: isUserExist.data[0].fullname,
      dob: isUserExist.data[0].dob,
      gender: isUserExist.data[0].gender,
      email: isUserExist.data[0].email,
      phoneNum: isUserExist.data[0].phoneNum,
      type: isUserExist.data[0].type,
      accessToken,
      accessTokenExpiresIn: expiredToken.accessToken,
      createdAt: new Date(Date.now()).toISOString(),
    };

    return wrapper.data(data);
  }

  async registerAdmin(payload) {
    const ctx = 'POST:/v1/register/admin';
    const { fullname, dob, gender, email, password, phoneNum } = payload;
    let values = [fullname, 'A'];
    let params =
      'select fullname from public.users where "fullname" = $1 and "type" = $2';
    const getUser = await this.query.find(params, values, ctx);
    if (getUser.err || getUser.data.length > 0) {
      return wrapper.error(
        new BadRequestError('Nama tersebut sudah terdaftar')
      );
    }

    values = [
      fullname,
      dateValid(dob),
      gender,
      email,
      await hashPass(password),
      phoneNum,
      'A',
    ];
    params = `
      INSERT INTO public.users
        ( 
          fullname, dob, gender, email, password, "phoneNum", type
        )
      VALUES 
        ( 
          $1, $2, $3, $4, $5, $6, $7
        )
        RETURNING *`;

    const insertUser = await this.query.updateOrInsertOrDelete(
      params,
      values,
      ctx
    );
    if (insertUser.err) {
      return wrapper.error(new BadRequestError('Gagal register admin'));
    }

    return wrapper.data(insertUser.data.rows[0].fullname);
  }

  async registerUser(payload) {
    const ctx = 'POST:/v1/register/user';
    const { fullname, dob, gender, email, phoneNum } = payload;
    let values = [fullname, email, phoneNum];
    let params = `select * from public.users u inner join public.viruses_mapping vm on u.id = vm.id_user where "fullname" = $1 and "email" = $2 and "phoneNum" = $3`;
    const getUser = await this.query.find(params, values, ctx);
    if (getUser.err) {
      return wrapper.error(new BadRequestError('Gagal input data diri'));
    }

    if (getUser.data.length > 0) {
      let data = {
        id: getUser.data[0].id,
        email: getUser.data[0].email,
        phoneNum: getUser.data[0].phoneNum,
      };

      const accessToken = await jwtAuth.generateToken(
        data,
        expiredToken.accessToken
      );
      data = {
        id: getUser.data[0].id,
        fullname: getUser.data[0].fullname,
        dob: getUser.data[0].dob,
        gender: getUser.data[0].gender,
        email: getUser.data[0].email,
        phoneNum: getUser.data[0].phoneNum,
        type: getUser.data[0].type,
        accessToken,
        isExist: true,
      };

      return wrapper.data(data);
    }

    values = [fullname, dateValid(dob), gender, email, phoneNum, 'U'];
    params = `
    INSERT INTO public.users
      ( 
        fullname, dob, gender, email, "phoneNum", type
      )
    VALUES 
      ( 
        $1, $2, $3, $4, $5, $6
      )
      RETURNING *`;

    const insertUser = await this.query.updateOrInsertOrDelete(
      params,
      values,
      ctx
    );
    if (insertUser.err) {
      return wrapper.error(new BadRequestError('Gagal input data diri'));
    }
    let data = {
      id: insertUser.data.rows[0].id,
      email: insertUser.data.rows[0].email,
      phoneNum: insertUser.data.rows[0].phoneNum,
    };

    const accessToken = await jwtAuth.generateToken(
      data,
      expiredToken.accessToken
    );
    data = {
      id: insertUser.data.rows[0].id,
      fullname: insertUser.data.rows[0].fullname,
      dob: insertUser.data.rows[0].dob,
      gender: insertUser.data.rows[0].gender,
      email: insertUser.data.rows[0].email,
      phoneNum: insertUser.data.rows[0].phoneNum,
      type: insertUser.data.rows[0].type,
      accessToken,
      isExist: false,
    };

    return wrapper.data(data);
  }
}

module.exports = User;
