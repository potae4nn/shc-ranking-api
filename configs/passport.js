const passport = require('passport')
const passportJWT = require("passport-jwt")
const ExtractJWT = passportJWT.ExtractJwt
const JWTStrategy = passportJWT.Strategy
const Strategy = require('passport-local')
const bcrypt = require('bcrypt')
const { sql_query } = require('../configs/connectdb')
require('dotenv').config()

//สร้างตัว login
passport.use('login', new Strategy({
  usernameField: 'username',
  passwordField: 'password'
},
  async (username, password, cb) => {
    try {
      const user = await sql_query(`SELECT * FROM user WHERE employee_id=?`, [username])
      if (!user[0]) {
        return cb(null, false, { message: 'ชื่อผู้ใช้ไม่ถูกต้อง' })
      }
      bcrypt.compare(password, user[0]?.password, function (err, res) {
        if (!res)
          return cb(null, false, {
            message: 'รหัสผ่านไม่ถูกต้อง'
          });
        const returnUser = {
          id_user: user[0].id_user,
          id_plan:user[0].id_plan,
          name: user[0].name,
          employee_id: user[0].employee_id,
          sex: user[0].sex,
          email: user[0].email,
          email: user[0].email,
          contact_number: user[0].contact_number,
          weight: user[0].weight,
          height: user[0].height,
          id_department: user[0].id_department,
          birthday: user[0].birthday,
          operating_age: user[0].operating_age,
          member_type_name: user[0].member_type_name,
          status: user[0].status,
        };
        return cb(null, returnUser, {
          message: 'Logged In Successfully'
        });
      })
    } catch (error) {
      return cb(null, false, {
        message: error
      });
    }
  }
))

// ตรวจสอบ Auth
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY
},
  async (jwtPayload, cb) => {
    try {
      // find the user in db if needed
      const user = await sql_query(`SELECT id_user,status FROM user WHERE id_user=?`, [jwtPayload.users.id_user])
      if (jwtPayload.users.id_user === user[0].id_user && jwtPayload.role === 'admin') {
        return cb(null, { role: 'admin' })
      }
      else if (jwtPayload.users.id_user === user[0].id_user) {
        return cb(null, { role: 'user' })
      }
      else {
        return cb(null, false)
      }
    } catch (error) {
      return cb(error, false)
    }
  }
))