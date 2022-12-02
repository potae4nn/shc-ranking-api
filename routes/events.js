const router = require('express').Router()
const { sql_query } = require('../configs/connectdb')
const fs = require('fs')
const moment = require('moment')
const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/infomations/')
    },
    filename: function (req, file, cb) {
        cb(null, Math.floor(Math.random() * 1000001) + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fieldNameSize: 255,
        fileSize: 1500000,
        files: 1,
        fields: 1
    }
})

const uploadMultiFiles = multer({
    storage: storage,
}).array('multiFiles')

const today = new Date();
const dd = String(today.getDate()).padStart(2, '0')
const mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
const yyyy = today.getFullYear()
let todayCon = yyyy + '-' + mm + '-' + dd

const dateNow =
    today.getFullYear() + "-" +
    ("0" + (today.getMonth() + 1)).slice(-2) + "-" +
    ("0" + today.getDate()).slice(-2) + " " +
    ("0" + today.getHours()).slice(-2) + ":" +
    ("0" + today.getMinutes()).slice(-2) + ":" +
    ("0" + today.getSeconds()).slice(-2)

router.get('/ranking', async (req, res, next) => {
    if (req.query.id_range !== undefined) {
        const range_age = await sql_query(`
        SELECT rtt.title,rra.id,rra.id_report_group_member,rra.id_report_type_time,rra.range_start,rra.range_end 
        FROM report_range_age AS rra 
        INNER JOIN report_type_time AS rtt 
        ON rtt.id = rra.id_report_type_time 
        WHERE rra.id=${req.query.id_range}`
        )
        let resultMen;
        let resultWomen;
        switch (range_age[0].id_report_type_time) {
            case 1:
                resultMen = await sql_query(`SELECT user.shirt_size,user.birthday,${yyyy}-(YEAR(user.birthday)) AS yearAge, user.sex,user.operating_age,user.employee_id,user.name,department.name AS department, SUM(history.distance) AS total_distance,SUM(history.time) AS total_time,plan.start_date,plan.end_date,plan.name AS plan_name,plan.id_plan 
                FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
                INNER JOIN department ON department.id = user.id_department 
                INNER JOIN plan ON history.id_plan = plan.id_plan 
                WHERE (${yyyy}-(YEAR(user.birthday)) BETWEEN ${range_age[0].range_start} AND ${range_age[0].range_end}) 
                AND history.status = 1 
                AND plan.id_plan = "${req.query.id_plan}"
                AND user.sex = "1"
                AND NOT (history.employee_id LIKE "b%" OR history.employee_id LIKE "m%" OR history.employee_id LIKE "d%")
                AND '${req.query.year}' = YEAR(from_unixtime(history.date))
                GROUP BY user.name 
                ORDER BY total_distance DESC`)

                resultWomen = await sql_query(`SELECT user.shirt_size,user.birthday,${yyyy}-(YEAR(user.birthday)) AS yearAge, user.sex,user.operating_age,user.employee_id,user.name,department.name AS department, SUM(history.distance) AS total_distance,SUM(history.time) AS total_time,plan.start_date,plan.end_date,plan.name AS plan_name,plan.id_plan 
                FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
                INNER JOIN department ON department.id = user.id_department 
                INNER JOIN plan ON history.id_plan = plan.id_plan 
                WHERE (${yyyy}-(YEAR(user.birthday)) BETWEEN ${range_age[0].range_start} AND ${range_age[0].range_end}) 
                AND history.status = 1 
                AND plan.id_plan = "${req.query.id_plan}"
                AND user.sex = "2"
                AND NOT (history.employee_id LIKE "b%" OR history.employee_id LIKE "m%" OR history.employee_id LIKE "d%")
                AND '${req.query.year}' = YEAR(from_unixtime(history.date))
                GROUP BY user.name 
                ORDER BY total_distance DESC`)
                // console.log(range_age[0].range_start)
                // console.log(range_age[0].range_end)
                // console.log(range_age[0].title)
                break;
            case 2:
                resultMen = await sql_query(`SELECT user.shirt_size,user.sex,YEAR(user.operating_age)+543 AS operating_age,user.employee_id,user.name,department.name AS department, SUM(history.distance) AS total_distance,SUM(history.time) AS total_time,plan.start_date,plan.end_date,plan.name AS plan_name,plan.id_plan 
                FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
                 INNER JOIN department ON department.id = user.id_department 
                 INNER JOIN plan ON history.id_plan = plan.id_plan 
                 WHERE YEAR("${todayCon}")-YEAR(user.operating_age) BETWEEN ${range_age[0].range_start} AND ${range_age[0].range_end}
                 AND history.status = 1 
                 AND plan.id_plan = "${req.query.id_plan}"
                 AND user.sex = "1"
                 AND NOT (history.employee_id LIKE "b%" OR history.employee_id LIKE "m%" OR history.employee_id LIKE "d%")
                 AND '${req.query.year}' = YEAR(from_unixtime(history.date))
                 GROUP BY user.name 
                 ORDER BY total_distance DESC`)

                resultWomen = await sql_query(`SELECT user.shirt_size,user.sex,YEAR(user.operating_age)+543 AS operating_age,user.employee_id,user.name,department.name AS department, SUM(history.distance) AS total_distance,SUM(history.time) AS total_time,plan.start_date,plan.end_date,plan.name AS plan_name,plan.id_plan 
                FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
                 INNER JOIN department ON department.id = user.id_department 
                 INNER JOIN plan ON history.id_plan = plan.id_plan 
                 WHERE YEAR("${todayCon}")-YEAR(user.operating_age) BETWEEN ${range_age[0].range_start} AND ${range_age[0].range_end}
                 AND history.status = 1 
                 AND plan.id_plan = "${req.query.id_plan}"
                 AND user.sex = "2"
                 AND NOT (history.employee_id LIKE "b%" OR history.employee_id LIKE "m%" OR history.employee_id LIKE "d%")
                 AND '${req.query.year}' = YEAR(from_unixtime(history.date))
                 GROUP BY user.name 
                 ORDER BY total_distance DESC`)
                break;

            default:
                break;
        }
        res.status(200).json({ resultMen, resultWomen })
    }
})


//  LEFT JOIN plan_image as pm 
// ON pm.id_plan = p.id_plan
//   CONCAT( '[', GROUP_CONCAT( JSON_OBJECT( 'id', pm.id, 'image', pm.image ) ), ']' ) AS images
router.get('/', async (req, res, next) => {
    const SORT = req.query.sort
    const ORDER = req.query.order
    const SEARCH = req.query.search
    const ITEMS_PER_PAGE = 10
    const OFFSET = (req.query.page - 1) * ITEMS_PER_PAGE
    try {
        const result = await sql_query(`
            SELECT 
            p.id_plan,
            p.name,
            p.start_date,
            p.end_date_register,
            p.end_date,
            p.status,
            p.details
            FROM plan as p 
            WHERE p.name LIKE '%${SEARCH}%'
            ORDER BY ${String(SORT)} ${String(ORDER)} LIMIT ${ITEMS_PER_PAGE} OFFSET ${OFFSET}
        `);

        let resData = result.map(data => {
            return ({
                id_plan: data.id_plan,
                name: data.name,
                start_date: data.start_date,
                end_date_register: data.end_date_register,
                end_date: data.end_date,
                status: data.status,
                details: data.details,
                // images: JSON.parse(data.images)
            })
        });
        const count = await sql_query(`
            SELECT COUNT(*) as count 
            FROM plan 
            WHERE plan.name LIKE '%${SEARCH}%' OR start_date LIKE '%${SEARCH}%' OR end_date LIKE '%${SEARCH}%'
            ORDER BY ${String(SORT)} ${String(ORDER)} LIMIT ${ITEMS_PER_PAGE} OFFSET ${OFFSET}
        `);
        return res.json({ result: resData, count: count });
    } catch (e) {
        res.status(404).json({ message: e.message })
    } next();
})

router.get('/plan', async (req, res, next) => {
    try {
        const result = await sql_query(`SELECT id_plan,name FROM plan WHERE status = ?`, [1])
        return res.status(200).json({ result })
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
})

router.get('/plan_range', async (req, res, next) => {
    try {
        const result = await sql_query(`
        SELECT  rra.id,
                p.name AS activity,
                rgm.title AS typemember,
                rtt.title AS rangeage,
                rra.range_start,
                rra.range_end, 
                p.id_plan
        FROM plan_group AS pg 
        INNER JOIN plan AS p ON pg.id_plan = p.id_plan
        RIGHT JOIN report_range_age AS rra ON rra.id = pg.id_report_range_age
        INNER JOIN report_group_member AS rgm ON rgm.id = rra.id_report_group_member
        INNER JOIN report_type_time AS rtt ON rtt.id = rra.id_report_type_time`)
        return res.status(200).json({ result });
    } catch (error) {
        res.status(201).json({ message: error.message })
    }
})

router.post('/uploadInfomation', upload.single('file'), async (req, res, next) => {
    const { id_img } = req.body
    try {
        if (req?.file !== undefined) {
            await sql_query(`UPDATE plan_image
                     SET image = ?
                     WHERE id = ?`, [req.file.filename, id_img])
            return res.status(200).json({ status: { code: 200, message: 'Upload success' } })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/uploadMultiInfomation', async (req, res, next) => {
    uploadMultiFiles(req, res, async function (err) {
        if (err) {
            console.log(err)
            return;
        }
        let flieName = []
        req.files.forEach(element => flieName.push([Number(req.body.id_plan), element.filename, dateNow]))
        try {
            if (req.files !== undefined) {
                const sql = "INSERT INTO plan_image (id_plan, image, create_at) VALUES ?";
                const values = [flieName];
                await sql_query(sql, values, function (err, result) {
                    if (err) throw err;
                    return res.status(200).json({ status: { code: 200, message: 'Upload success', success: result.affectedRows } })
                })
            }
        } catch (error) {
            console.log(error)
        }
    })
})

router.post('/groupRangeAge', async (req, res, next) => {
    const { rolesRange } = req.body
    let sql = []
    let result = []
    let insert = []
    let update = []
    let valuesIn = []
    let valuesUp = []
    for (let i = 0; i < rolesRange.length; i++) {
        sql[i] = `SELECT * FROM plan_group 
        WHERE id_report_range_age = ${rolesRange[i].id_report_range_age} 
        AND id_plan = ${rolesRange[i].id_plan}`
        result[i] = await sql_query(sql[i])
        if (result[i][0] === undefined) {
            insert[i] = [rolesRange[i].id_plan, rolesRange[i].id_report_range_age, rolesRange[i].checked === true ? 1 : 0, dateNow]
        } else {
            update[i] = [rolesRange[i].id_plan, rolesRange[i].id_report_range_age, rolesRange[i].checked === true ? 1 : 0, rolesRange[i].id]
        }
    }

    insert.map(data => {
        valuesIn.push(data)
    })

    update.map(data => {
        valuesUp.push(data)
    })

    if (valuesIn[0] !== undefined) {
        try {
            const sql = "INSERT INTO plan_group (id_plan, id_report_range_age, checked, create_at) VALUES ?";
            const values = [valuesIn];
            await sql_query(sql, values, function (err, result) {
                valuesIn = []
            })
            return res.status(200).json({ message: 'success' })
        } catch (error) {
            res.status(404).json({ message: error.message })
        }
        return;
    }

    if (valuesUp[0] !== undefined) {
        try {
            for (let i = 0; i < valuesUp.length; i++) {
                await sql_query(`UPDATE plan_group 
            SET id_plan = ${valuesUp[i][0]}, 
            id_report_range_age = ${valuesUp[i][1]}, 
            checked = ${valuesUp[i][2]} 
            WHERE id = ${valuesUp[i][3]}`)
            }
            valuesUp = []
            return res.status(200).json({ message: 'success' })
        } catch (error) {
            res.status(404).json({ message: error.message })
        }
        return;
    }

    // switch (selectMethod) {
    //     case 'insert':
    //         try {
    //             const sql = "INSERT INTO plan_group (id_plan, id_report_range_age, checked, create_at) VALUES ?";
    //             const values = [valuesIn];
    //             await sql_query(sql, values, function (err, result) {
    //                 if (err) throw err;
    //                 return res.status(200).json({ status: { code: 200, message: 'Insert success', success: result.affectedRows } })
    //             })
    //         } catch (error) {
    //             res.status(404).json({ message: error.message })
    //         }
    //         break;
    //     case 'update':
    //         try {
    //             for (let i = 0; i < valuesUp.length; i++) {
    //                 await sql_query(`UPDATE plan_group 
    //             SET id_plan = ${valuesUp[i][0]}, 
    //             id_report_range_age = ${valuesUp[i][1]}, 
    //             checked = ${valuesUp[i][2]} 
    //             WHERE id = ${valuesUp[i][3]}`)
    //             }
    //             return res.status(200).json({ message: 'success' })
    //         } catch (error) {
    //             res.status(404).json({ message: error.message })
    //         }
    //         break;
    //     default:
    //         break;
    // }

})

router.get('/plan_range/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        const result = await sql_query(`
        SELECT  rra.id,
                p.name AS activity,
                rgm.title AS typemember,
                rtt.title AS rangeage,
                rra.range_start,
                rra.range_end, 
                p.id_plan
        FROM plan_group AS pg 
        LEFT JOIN plan AS p ON pg.id_plan = p.id_plan
        INNER JOIN report_range_age AS rra ON rra.id = pg.id_report_range_age
        INNER JOIN report_group_member AS rgm ON rgm.id = rra.id_report_group_member
        INNER JOIN report_type_time AS rtt ON rtt.id = rra.id_report_type_time
        WHERE p.id_plan = ? AND pg.checked = ?`, [id, 1])
        return res.status(200).json({ result });
    } catch (error) {
        res.status(201).json({ message: error.message })
    }
})

router.get('/register/:id_user/:id_plan', async (req, res, next) => {
    const id_plan = req.params.id_plan
    const id_user = req.params.id_user
    try {
        const results = await sql_query(`SELECT p.id_plan,p.name,p.end_date,p.end_date_register,p.start_date,r.status FROM register_plan AS r 
            INNER JOIN plan AS p ON p.id_plan = r.id_plan 
            INNER JOIN user AS u ON u.id_user = r.id_user 
            WHERE r.status = "1" AND r.id_plan = ${Number(id_plan)} AND r.id_user = ${Number(id_user)}`)
        return res.status(200).json({ message: "Success", results })
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})

router.get('/rangeAge', async (req, res, next) => {
    const SORT = req.query.sort
    const ORDER = req.query.order
    const SEARCH = req.query.search
    const ITEMS_PER_PAGE = 10
    const SORTFIXDE = ',rra.range_start ASC'
    const OFFSET = (req.query.page - 1) * ITEMS_PER_PAGE
    try {
        const result = await sql_query(`
            SELECT  rra.id,rra.range_start,rra.range_end,rgm.title as typemember,rtt.title as rangeage
            FROM report_range_age as rra 
            INNER JOIN report_group_member as rgm ON rgm.id = rra.id_report_group_member 
            INNER JOIN report_type_time as rtt ON rtt.id = rra.id_report_type_time
            WHERE rgm.title LIKE '%${SEARCH}%' OR rtt.title  LIKE '%${SEARCH}%'
            ORDER BY ${String(SORT)} ${String(ORDER)} LIMIT ${ITEMS_PER_PAGE} OFFSET ${OFFSET}`)
        const count = await sql_query(`
            SELECT COUNT(*) as count
            FROM report_range_age as rra 
            INNER JOIN report_group_member as rgm ON rgm.id = rra.id_report_group_member 
            INNER JOIN report_type_time as rtt ON rtt.id = rra.id_report_type_time
            WHERE rgm.title LIKE '%${SEARCH}%' OR rtt.title  LIKE '%${SEARCH}%'
            ORDER BY ${String(SORT)} ${String(ORDER)} LIMIT ${ITEMS_PER_PAGE} OFFSET ${OFFSET}`)
        return res.json({ result: result, count: count });
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})

router.post('/activity', async (req, res, next) => {
    const { id_plan, name, start_date, end_date, end_date_register, status, details } = req.body
    let statusConvert = status === true ? 1 : 0
    try {
        await sql_query(
            `UPDATE plan SET
                name = ?,
                start_date = ?,
                end_date_register = ?,
                end_date = ?,
                status = ?,
                details = ?
                WHERE id_plan = ?`, [name, convertDate(start_date), convertDate(end_date_register), convertDate(end_date), statusConvert, details, id_plan]);
        return res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(200).json({ message: error.message })
    }
})

convertDate = (data) => {
    const date = new Date(data);
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0') //January is 0!
    const yyyy = date.getFullYear()
    let todayCon = yyyy + '-' + mm + '-' + dd
    return todayCon
}

router.get('/activity', async (req, res, next) => {
    try {
        const result = await sql_query(`
        SELECT * FROM plan
        `)
        return res.json({ result: result });
    } catch (error) {
        res.status(404).json({ message: e.message })
    }
})

router.get('/image/:id_plan/:id_img', async (req, res, next) => {
    try {
        const result = await sql_query(`
        SELECT id,id_plan,image 
        FROM plan_image
        WHERE id=? AND id_plan =?`, [req.params.id_img, req.params.id_plan]
        )
        return res.json({ result: result })
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})

router.post('/addActivity', async (req, res, next) => {
    const { name, start_date, end_date_register, end_date, details } = req.body
    try {
        const result = await sql_query(`
        INSERT INTO plan (name, start_date, end_date_register,end_date,status,details,create_at)
        VALUES (?,?,?,?,?,?,?)
        `, [name, convertDate(start_date), convertDate(end_date_register), convertDate(end_date), 1, details, dateNow])
        console.log(result)
        return res.json({ message: 'success' })
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})

router.get('/activity/:id', async (req, res, next) => {
    try {
        let resCheck = []
        let result
        let checkPlanGroup
        let images

        checkPlanGroup = await sql_query(`
        SELECT id_plan FROM plan_group 
        WHERE id_plan = ? GROUP BY id_plan`, [req.params.id])

        if (checkPlanGroup[0] === undefined) {
            result = await sql_query(`
            SELECT  p.id_plan,
                p.name,
                p.start_date,
                p.end_date_register,
                p.end_date,
                p.status,
                p.details
            FROM plan as p
            LEFT JOIN plan_group as pg ON pg.id_plan = p.id_plan
            WHERE p.id_plan = ? GROUP BY p.id_plan`, [req.params.id])
            resCheck = await sql_query(`
            SELECT 
                rra.id AS id_report_range_age, 
                rra.range_start, rra.range_end, 
                rgm.title AS report_group_member, 
                rtt.title AS report_type_time 
            FROM report_range_age AS rra 
            INNER JOIN report_group_member AS rgm ON rgm.id = rra.id_report_group_member 
            INNER JOIN report_type_time AS rtt ON rtt.id = rra.id_report_type_time`)
            images = await sql_query(`SELECT 
            CONCAT(
                '[',
                GROUP_CONCAT(
                  JSON_OBJECT(
                    'id', pm.id,
                    'image', pm.image
                  )
                ),
                ']'
              ) AS images 
              FROM plan AS p INNER JOIN plan_image AS pm ON p.id_plan = pm.id_plan
              WHERE pm.id_plan = ?`, [req.params.id])
        } else {
            result = await sql_query(`
            SELECT  p.id_plan,
                p.name,
                p.start_date,
                p.end_date_register,
                p.end_date,
                p.status,
                p.details
            FROM plan as p
            LEFT JOIN plan_group as pg ON pg.id_plan = p.id_plan
            WHERE p.id_plan = ? GROUP BY p.id_plan`, [req.params.id])
            resCheck = await sql_query(`
            SELECT 
                pg.id,
                pg.checked,
                rra.id AS id_report_range_age,
                pg.id_plan,
                rra.range_start,
                rra.range_end,
                rgm.title AS report_group_member,
                rtt.title AS report_type_time
            FROM plan as p
            RIGHT JOIN plan_group as pg ON pg.id_plan = p.id_plan
            RIGHT JOIN report_range_age AS rra ON rra.id = pg.id_report_range_age
            INNER JOIN report_type_time AS rtt ON rtt.id = rra.id_report_type_time
            INNER JOIN report_group_member AS rgm ON rgm.id = rra.id_report_group_member
            WHERE p.id_plan = ? OR pg.checked IS NULL`, [req.params.id])
            images = await sql_query(`SELECT 
            CONCAT(
                '[',
                GROUP_CONCAT(
                  JSON_OBJECT(
                    'id', pm.id,
                    'image', pm.image
                  )
                ),
                ']'
              ) AS images 
              FROM plan AS p INNER JOIN plan_image AS pm ON p.id_plan = pm.id_plan
              WHERE pm.id_plan = ?`, [req.params.id])
        }

        let resData = result.map(data => {
            return ({
                id_plan: data.id_plan,
                name: data.name,
                start_date: data.start_date,
                end_date_register: data.end_date_register,
                end_date: data.end_date,
                status: data.status,
                details: data.details,
                images: JSON.parse(images[0].images),
                check_range_age: resCheck 
            })
        });

        return res.json({ result: resData })
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})

router.get('/range', async (req, res, next) => {
    try {
        const result = await sql_query(`
        SELECT  rra.id,rra.range_start,rra.range_end,rgm.title as typemember,rtt.title as rangeage
        FROM report_range_age as rra 
        INNER JOIN report_group_member as rgm ON rgm.id = rra.id_report_group_member 
        INNER JOIN report_type_time as rtt ON rtt.id = rra.id_report_type_time`)
        return res.json({ result: result });
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})



// router.get('/:id_plan/:yearselect', async (req, res, next) => {
//     // await authorized(req.user.role)
//     const id_plan = req.params.id_plan;
//     const yearselect = req.params.yearselect;
//     const today = new Date();
//     const dd = String(today.getDate()).padStart(2, '0');
//     const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
//     // const yyyy = today.getFullYear();
//     let todayCon = today.getFullYear() + '-' + mm + '-' + dd;

//     let resultsTenMen;
//     let resultsTwentyMen;
//     let resultsTwentyUpMen;
//     let resultsTenWomen;
//     let resultsTwentyWomen;
//     let resultsTwentyUpWomen;

//     let resultsBirthTwentyMen;
//     let resultsBirthThirtyFiveMen;
//     let resultsBirthFortyFiveMen;
//     let resultsBirthTwentyWomen;
//     let resultsBirthThirtyFiveWomen;
//     let resultsBirthFortyFiveWomen;

//     let resultsStudentMen;
//     let resultsStudentWomen;

//     try {
//         // -------------- Results Age Work -------------------
//         // ----------------- Men ----------------- 
//         resultsTenMen = await getqueryAgeWork(0, 10, 1, todayCon, id_plan, yearselect);
//         resultsTwentyMen = await getqueryAgeWork(11, 20, 1, todayCon, id_plan, yearselect);
//         resultsTwentyUpMen = await getqueryUpAgeWork(20, 1, todayCon, id_plan, yearselect);
//         // ----------------- Women ---------------
//         resultsTenWomen = await getqueryAgeWork(0, 10, 2, todayCon, id_plan, yearselect);
//         resultsTwentyWomen = await getqueryAgeWork(11, 20, 2, todayCon, id_plan, yearselect);
//         resultsTwentyUpWomen = await getqueryUpAgeWork(20, 2, todayCon, id_plan, yearselect);

//         // -------------- Results Birth ------------------------
//         // ----------------- Men ----------------- 
//         resultsBirthTwentyMen = await getqueryBirth(20, 35, 1, id_plan, yearselect);
//         resultsBirthThirtyFiveMen = await getqueryBirth(20, 45, 1, id_plan, yearselect);
//         resultsBirthFortyFiveMen = await getqueryUpBirth(45, 1, id_plan, yearselect);
//         // ----------------- Women ---------------
//         resultsBirthTwentyWomen = await getqueryBirth(20, 35, 2, id_plan, yearselect);
//         resultsBirthThirtyFiveWomen = await getqueryBirth(20, 45, 2, id_plan, yearselect);
//         resultsBirthFortyFiveWomen = await getqueryUpBirth(45, 2, id_plan, yearselect);

//         //-------------- Results Student ------------------------
//         // ----------------- Men ----------------- 
//         resultsStudentMen = await getqueryStudent(1, id_plan, yearselect);
//         // ----------------- Women ---------------
//         resultsStudentWomen = await getqueryStudent(2, id_plan, yearselect);

//         return res.status(200).json({
//             resultsTenMen: resultsTenMen,
//             resultsTwentyMen: resultsTwentyMen,
//             resultsTwentyUpMen: resultsTwentyUpMen,
//             resultsTenWomen: resultsTenWomen,
//             resultsTwentyWomen: resultsTwentyWomen,
//             resultsTwentyUpWomen: resultsTwentyUpWomen,
//             resultsBirthTwentyMen: resultsBirthTwentyMen,
//             resultsBirthThirtyFiveMen: resultsBirthThirtyFiveMen,
//             resultsBirthFortyFiveMen: resultsBirthFortyFiveMen,
//             resultsBirthTwentyWomen: resultsBirthTwentyWomen,
//             resultsBirthThirtyFiveWomen: resultsBirthThirtyFiveWomen,
//             resultsBirthFortyFiveWomen: resultsBirthFortyFiveWomen,
//             resultsStudentMen: resultsStudentMen,
//             resultsStudentWomen: resultsStudentWomen
//         });
//     } catch (e) {
//         res.status(404).json({ message: e.message });
//     }
// })

router.post('/', async (req, res, next) => {
    const id_event = req.body.id_event
    try {
        const result = await sql_query(`SELECT * FROM plan WHERE id_plan="?"`, [id_event]);
        return res.json(result);
    } catch (e) {
        res.status(404).json({ message: e.message })
    } next();
})

// router.put('/', async (req, res, next) => {
//     const { name, start_date, end_date_register, end_date, id_plan, details, status, image } = req.body;
//     const date = moment().unix();
//     try {
//         if (image == null) {
//             const results = sql_query(
//                 `UPDATE plan SET
//                     name = '${name}',
//                     start_date = '${start_date}',
//                     end_date_register='${end_date_register}',
//                     end_date = '${end_date}',
//                     details ='${details}',
//                     status= '${status}'
//                     WHERE id_plan = '${id_plan}'`
//             );
//             return res.status(200).json({ message: "Success", results });
//         } else {
//             let dir = './public/image/infomation/';
//             const data = image.replace(/^data:image\/\w+;base64,/, "");
//             const path = dir + 'p' + date + '.jpg';
//             const img = 'p' + date + '.jpg';
//             fs.writeFile(path, data, { encoding: "base64" }, function (err) {
//                 const results = sql_query(
//                     `UPDATE plan SET
//                         name = '${name}',
//                         start_date = '${start_date}',
//                         end_date_register='${end_date_register}',
//                         end_date = '${end_date}',
//                         details ='${details}',
//                         status= '${status}',
//                         image = '${img}'
//                         WHERE id_plan = '${id_plan}'`
//                 );
//                 // console.log(results)
//                 return res.status(200).json({ message: "Success", results });
//             });
//         }
//     } catch (e) {
//         return res.status(404).json({ message: e.message });
//     }
// })

function authorized(role) {
    if (role === 'user') return res.status(404).json({ message: 'Unauthorized' })
}

// async function getqueryAgeWork(start, end, sex, todayCon, id_plan, yearselect) {
//     return await sql_query(`SELECT user.shirt_size,user.sex,YEAR(user.operating_age)+543 AS operating_age,user.employee_id,user.name,department.name AS department, SUM(history.distance) AS total_distance,SUM(history.time) AS total_time,plan.start_date,plan.end_date,plan.name AS plan_name,plan.id_plan 
//     FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
//     INNER JOIN department ON department.id = user.id_department 
//     INNER JOIN plan ON history.id_plan = plan.id_plan 
//     WHERE YEAR("${todayCon}")-YEAR(user.operating_age) BETWEEN ${start} AND ${end}
//     AND history.status = 1 
//     AND plan.id_plan = "${id_plan}"
//     AND user.sex = "${sex}"
//     AND NOT (history.employee_id LIKE "b%" OR history.employee_id LIKE "m%" OR history.employee_id LIKE "d%")
//     AND '${yearselect}' = YEAR(from_unixtime(history.date))
//     GROUP BY user.name 
//     ORDER BY total_distance DESC`);
// }

// async function getqueryUpAgeWork(start, sex, todayCon, id_plan, yearselect) {
//     return await sql_query(`SELECT user.shirt_size,user.sex,YEAR(user.operating_age)+543 AS operating_age,user.employee_id,user.name,department.name AS department, SUM(history.distance) AS total_distance,SUM(history.time) AS total_time,plan.start_date,plan.end_date,plan.name AS plan_name,plan.id_plan 
//     FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
//     INNER JOIN department ON department.id = user.id_department 
//     INNER JOIN plan ON history.id_plan = plan.id_plan 
//     WHERE YEAR("${todayCon}")-YEAR(user.operating_age) > ${start}
//     AND history.status = 1 
//     AND plan.id_plan = "${id_plan}"
//     AND user.sex = "${sex}"
//     AND NOT (history.employee_id LIKE "b%" OR history.employee_id LIKE "m%" OR history.employee_id LIKE "d%")
//     AND '${yearselect}' = YEAR(from_unixtime(history.date)) 
//     GROUP BY user.name 
//     ORDER BY total_distance DESC`);
// }

// async function getqueryBirth(start, end, sex, id_plan, yearselect) {
//     return await sql_query(`SELECT user.shirt_size,user.birthday,${new Date().getFullYear()}-(YEAR(user.birthday)) AS yearAge, user.sex,user.operating_age,user.employee_id,user.name,dep.childName AS department,dep.parentName AS parentDepartment, SUM(history.distance) AS total_distance,SUM(history.time) AS total_time,plan.start_date,plan.end_date,plan.name AS plan_name,plan.id_plan 
//     FROM history 
//     RIGHT JOIN user ON history.employee_id = user.employee_id 
//     LEFT JOIN (
//        SELECT child.id,child.name AS childName,parent.name AS parentName,child.active FROM department AS child LEFT JOIN department AS parent ON parent.id = child.parent_id 
//        ) dep
//     ON dep.id = user.id_department 
//     INNER JOIN plan ON history.id_plan = plan.id_plan 
//     WHERE (${new Date().getFullYear()}-(YEAR(user.birthday)) BETWEEN ${start} AND ${end}) 
//     AND history.status = 1 
//     AND plan.id_plan = "${id_plan}"
//     AND user.sex = "${sex}"
//     AND NOT (history.employee_id LIKE "b%" OR history.employee_id LIKE "m%" OR history.employee_id LIKE "d%")
//     AND '${yearselect}' = YEAR(from_unixtime(history.date))
//     GROUP BY user.name 
//     ORDER BY total_distance DESC`);
// }

// async function getqueryUpBirth(start, sex, id_plan, yearselect) {
//     return await sql_query(`SELECT user.shirt_size,user.birthday,${new Date().getFullYear()}-(YEAR(user.birthday)) AS yearAge,user.sex,user.operating_age,user.employee_id,user.name,dep.childName AS department,dep.parentName AS parentDepartment, SUM(history.distance) AS total_distance,SUM(history.time) AS total_time,plan.start_date,plan.end_date,plan.name AS plan_name,plan.id_plan 
//     FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
//     LEFT JOIN (
//         SELECT child.id,child.name AS childName,parent.name AS parentName,child.active FROM department AS child LEFT JOIN department AS parent ON parent.id = child.parent_id 
//         ) dep
//      ON dep.id = user.id_department 
//     INNER JOIN plan ON history.id_plan = plan.id_plan 
//     WHERE (${new Date().getFullYear()}-(YEAR(user.birthday)) > ${start}) 
//     AND history.status = 1 
//     AND plan.id_plan = "${id_plan}"
//     AND user.sex = "${sex}"
//     AND NOT (history.employee_id LIKE "b%" OR history.employee_id LIKE "m%" OR history.employee_id LIKE "d%")
//     AND '${yearselect}' = YEAR(from_unixtime(history.date))
//     GROUP BY user.name 
//     ORDER BY total_distance DESC`);
// }

// async function getqueryStudent(sex, id_plan, yearselect) {
//     return await sql_query(`SELECT user.shirt_size,user.sex,YEAR(user.operating_age)+543 AS operating_age,user.employee_id,user.name,dep.childName AS department,dep.parentName AS parentDepartment, SUM(history.distance) AS total_distance,SUM(history.time) AS total_time,plan.start_date,plan.end_date,plan.name AS plan_name,plan.id_plan 
//     FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
//     LEFT JOIN (
//         SELECT child.id,child.name AS childName,parent.name AS parentName,child.active FROM department AS child LEFT JOIN department AS parent ON parent.id = child.parent_id 
//         ) dep
//      ON dep.id = user.id_department 
//     INNER JOIN plan ON history.id_plan = plan.id_plan 
//     WHERE history.status = 1 
//     AND plan.id_plan = "${id_plan}"
//     AND user.sex = "${sex}"
//     AND NOT (history.employee_id LIKE "1%" OR history.employee_id LIKE "2%" OR history.employee_id LIKE "5%")
//     AND '${yearselect}' = YEAR(from_unixtime(history.date))
//     GROUP BY user.name 
//     ORDER BY total_distance DESC`);
// }

module.exports = router