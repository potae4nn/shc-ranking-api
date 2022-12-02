const router = require('express').Router()
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')

router.get('/', async (req, res, next) => {
    // config สำหรับของ outlook
    const transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: 'nattapon4nn@outlook.com', // your email
            pass: 'potae4nn0510' // your email password
        }
    });

    let mailOptions = {
        from: 'nattapon4nn@outlook.com',                // sender
        to: 'potae4nn@gmail.com',                // list of receivers
        subject: 'Hello from sender test',              // Mail subject
        html: '<b>ทดสอบการส่ง email </b> <button>ทดสอบ</button>'   // HTML body
    };
    //   ก่อนที่เราจะเริ่มส่ง email ถ้าเราใช้ transport service ของ Gmail ให้เราไป enabled less secured app ของ gmail เราก่อน เพื่ออนุญาตให้ nodemailer ใช้ gmail เราส่ง mail ได้ โดยกดเข้าไป ที่นี่
    //   หน้าจอสำหรับอนุญาตให้ nodemailer ใช้ gmail เราส่ง mail ได้
    //   หลังจากเตรียมทุกอย่างเรียบร้อยแล้ว เราสามารถสั่งให้ transport service ส่ง mail โดยใช้คำสั่งตามนี้

    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else {
            console.log(info);
            res.send({ massage: "ส่งสำเร็จ" })
        }
    });
    //   คำสั่ง sendMail ของตัว transporter จะรับ argument เข้าไป 2 ตัว ได้แก่
    //   mail option: สำหรับ config ข้อมูลผู้ส่ง ผู้รับ และเนื้อหาของ mail
    //   callback function: สำหรับ handle หลังจากส่ง mail เสร็จ โดย callback function จะถูกเรียกทั้งในกรณีที่ส่งเมลสำเร็จ และส่งเมลไม่สำเร็จ
    //   สำหรับตัวอย่างโค้ดทั้งหมดดูได้ ที่นี่ :)
})

module.exports = router


// config สำหรับของ gmail
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: 'yourmail@hotmail.com', // your email
    //         pass: 'password' // your email password
    //     }
    // });
    //   หลังจากเรา config ตัว transport service เสร็จแล้ว ให้ทำการเตรียม content ที่จะส่ง โดยจัดให้อยู่ในรูปแบบตามนี้