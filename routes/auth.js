const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport')
const bcrypt = require('bcrypt');
require('dotenv').config()

router.post('/login', (req, res, next) => {
  // ส่งไปทำงานยัง passport.js
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (user) {
      const users = {
        id_user: user.id_user,
        id_plan:user.id_plan,
        name: user.name,
        employee_id: user.employee_id,
        sex: user.sex,
        email: user.email,
        contact_number: user.contact_number,
        weight: user.weight,
        height: user.height,
        id_department: user.id_department,
        birthday: user.birthday,
        operating_age: user.operating_age,
        member_type_name: user.member_type_name,
        status: user.status,
      }
      let token
      if (user.status === '1') {
        token = jwt.sign({ users, role: 'admin' }, process.env.SECRET_KEY, { expiresIn: '7d' })
      } else {
        token = jwt.sign({ users, role: 'user' }, process.env.SECRET_KEY, { expiresIn: '7d' })
      }
      return res.json({ users, token })
    } else {
      return res.status(422).json(info)
    }

  })(req, res, next)

})

router.post('/register', async (req, res, next) => {
  const name = req.body.name
  const employee_id = req.body.employee_id
  const sex = req.body.sex
  const department = req.body.department
  const operating_age = req.body.operating_age
  const email = req.body.email
  const password = req.body.password
  const contact_number = req.body.contact_number
  const weight = req.body.weight
  const height = req.body.height
  const birthday = req.body.birthday
  const member_type_name = req.body.memberTypeName
  const shirt_size = req.body.shirt_size;
  const hashedPassword = await bcrypt.hashSync(password, 10)
  try {
    const results = await sql_query(
      "INSERT INTO user (name,employee_id,sex,email,contact_number,weight,height,shirt_size,password,id_department,birthday,operating_age,member_type_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)",
      [
        name,
        employee_id,
        sex,
        email,
        contact_number,
        weight,
        height,
        shirt_size,
        hashedPassword,
        department,
        birthday,
        operating_age,
        member_type_name
      ]
    );
    return res.status(200).json({ status: "200", message: "success" })
  } catch (e) {
    return res.status(202).json({ status: "202", message: "resource already exists" })
  }
});

module.exports = router

