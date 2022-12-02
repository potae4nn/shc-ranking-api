const router = require('express').Router()
const { sql_query } = require('../configs/connectdb')
const m = new Date();
const dateNow =
    m.getFullYear() + "-" +
    ("0" + (m.getMonth() + 1)).slice(-2) + "-" +
    ("0" + m.getDate()).slice(-2) + " " +
    ("0" + m.getHours()).slice(-2) + ":" +
    ("0" + m.getMinutes()).slice(-2) + ":" +
    ("0" + m.getSeconds()).slice(-2)
//  -------------------------------------------- Router Method --------------------------------------------------------
// users
router.get('/admin', async (req, res, next) => {
    await authorized(req.user.role)
    const SORT = req.query.sort
    const ORDER = req.query.order
    const SEARCH = req.query.search
    const ITEMS_PER_PAGE = 10
    const OFFSET = (req.query.page - 1) * ITEMS_PER_PAGE
    try {
        const result = await sql_query(
            `SELECT id_user,employee_id,name,status,contact_number,email 
            FROM user WHERE status = ?  
            AND (employee_id LIKE '%${SEARCH}%' OR name LIKE '%${SEARCH}%' OR email LIKE '%${SEARCH}%')
            ORDER BY ${String(SORT)} ${String(ORDER)} LIMIT ${ITEMS_PER_PAGE} OFFSET ${OFFSET}`, [1])
        const count = await sql_query(
            `SELECT COUNT(*) AS count
            FROM user WHERE status = ?  
            AND (employee_id LIKE '%${SEARCH}%' OR name LIKE '%${SEARCH}%' OR email LIKE '%${SEARCH}%')`, [1])
        return res.json({ result, count });
    } catch (e) {
        res.status(404).json({ message: e.message })
    } next()
})

router.get('/member', async (req, res, next) => {
    await authorized(req.user.role)
    const SORT = req.query.sort
    const ORDER = req.query.order
    const SEARCH = req.query.search
    const ITEMS_PER_PAGE = 10
    const OFFSET = (req.query.page - 1) * ITEMS_PER_PAGE
    try {
        const result = await sql_query(
            `SELECT id_user, employee_id, name, status, contact_number, email 
            FROM user WHERE status = ? 
            AND(employee_id LIKE '%${SEARCH}%' OR name LIKE '%${SEARCH}%' OR email LIKE '%${SEARCH}%')
            ORDER BY ${String(SORT)} ${String(ORDER)} LIMIT ${ITEMS_PER_PAGE} OFFSET ${OFFSET}`, [0])
        const count = await sql_query(
            `SELECT COUNT(*) AS count
            FROM user WHERE status = ?  
            AND (employee_id LIKE '%${SEARCH}%' OR name LIKE '%${SEARCH}%' OR email LIKE '%${SEARCH}%')`, [0])
        return res.json({ result, count });
    } catch (e) {
        res.status(404).json({ message: e.message })
    } next()
})

router.get('/details/:id_history', async (req, res, next) => {
    await authorized(req.user.role)
    const id_history = req.params.id_history
    try {
        const results = await sql_query(
            `SELECT history.id_history, user.name, date, distance, time, history.status, history.img
            FROM history
            INNER JOIN user
            ON history.employee_id = user.employee_id 
            WHERE history.id_history =? `, [id_history])
        return res.json({ results })
    } catch (e) {
        res.status(404).json({ message: e.message })
    } next();
})


router.post('/userUpdate', async (req, res, next) => {
    await authorized(req.user.role)
    const { id_user, employee_id, name, status, contact_number, email } = req.body
    try {
        await sql_query(`
        UPDATE user 
        SET status = ?, 
        employee_id=?,
        name=?,
        contact_number=?,
        email=?
        WHERE id_user = ?`, [status, employee_id, name, contact_number, email, id_user])
        return res.json({ message: "success" })
    } catch (e) {
        res.status(404).json({ message: e.message })
    } next()
})

router.delete('/user/:id', async (req, res, next) => {
    await authorized(req.user.role)
    try {
        await sql_query(`DELETE FROM user WHERE id_user = '?'`, [id])
        return res.json({ message: "Delete Success" })
    } catch (e) {
        res.status(404).json({ message: e.message })
    } next()
})

// Person
router.post('/person', async (req, res, next) => {
    await authorized(req.user.role)
    const { id_plan } = req.body
    try {
        const results = await sql_query(
            `SELECT plan.id_plan, plan.name AS plan_name, responsible_person.id_responsible_person, responsible_person.name, responsible_person.last_name
            FROM plan
            LEFT JOIN responsible_person
            ON plan.id_plan = responsible_person.id_plan
            WHERE plan.id_plan = ?`, [id_plan]
        )
        return res.json(results)
    } catch (e) {
        res.status(404).json({ message: e.message })
    } next()
})

// getUserByID
router.get('/user/:id', async (req, res, next) => {
    await authorized(req.user.role)
    const id = req.params.id
    try {
        const result = await sql_query(
            `SELECT id_user, employee_id, name, status, contact_number, email 
            FROM user WHERE id_user = ?`, [id])
        return res.json({ result })
    } catch (e) {
        res.status(404).json({ message: e.message })
    } next()
})

//getRanking
router.post('/ranking', async (req, res, next) => {
    await authorized(req.user.role)
    const id_plan = req.body.id_plan;
    const yearselect = req.body.yearselect;
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    // let todayCon = yyyy + '-' + mm + '-' + dd;
    try {
        // ----------------- Men ---------------
        resultsBirthTwentyMen = await getqueryBirth(20, 35, 1, id_plan, yearselect, yyyy);
        resultsBirthThirtyFiveMen = await getqueryBirth(20, 45, 1, id_plan, yearselect, yyyy);
        resultsBirthFortyFiveMen = await getqueryUpBirth(45, 1, id_plan, yearselect, yyyy);
        // ----------------- Women ---------------
        resultsBirthTwentyWomen = await getqueryBirth(20, 35, 2, id_plan, yearselect, yyyy);
        resultsBirthThirtyFiveWomen = await getqueryBirth(20, 45, 2, id_plan, yearselect, yyyy);
        resultsBirthFortyFiveWomen = await getqueryUpBirth(45, 2, id_plan, yearselect, yyyy);

        //-------------- Results Student ------------------------
        // ----------------- Men ----------------- 
        resultsStudentMen = await getqueryStudent(1, id_plan, yearselect, yyyy);
        // ----------------- Women ---------------
        resultsStudentWomen = await getqueryStudent(2, id_plan, yearselect, yyyy);
    } catch (e) {
        res.status(404).json({ message: e.message })
    } next()
})

// getHistory
// router.get('/getHistory1/:status/:page', async (req, res, next) => {
//     await authorized(req.user.role)
//     const SORT = req.query.sort
//     const ORDER = req.query.order
//     const ITEMS_PER_PAGE = 10
//     const OFFSET = (req.params.page - 1) * ITEMS_PER_PAGE
//     switch (req.params.status) {
//         case "all":
//             try {
//                 const result = await getHistory('WHERE NOT history.status = 0', ITEMS_PER_PAGE, OFFSET, SORT, ORDER)
//                 const count = await getCount('WHERE NOT history.status = 0')
//                 return res.json({ result, count })
//             } catch (e) {
//                 return res.status(404).json({ message: e.message })
//             }
//         case "pending":
//             try {
//                 const result = await getHistory(`WHERE history.status = '0'`, ITEMS_PER_PAGE, OFFSET, SORT, ORDER)
//                 const count = await getCount(`WHERE history.status = '0'`)
//                 return res.json({ result, count })
//             } catch (e) {
//                 return res.status(404).json({ message: e.message })
//             }
//         case "approve":
//             try {
//                 const result = await getHistory(`WHERE history.status = '1'`, ITEMS_PER_PAGE, OFFSET, SORT, ORDER)
//                 const count = await getCount(`WHERE history.status = '1'`)
//                 return res.json({ result, count })
//             } catch (e) {
//                 return res.status(404).json({ message: e.message })
//             }
//         case "disapprove":
//             try {
//                 const result = await getHistory(`WHERE history.status = '2'`, ITEMS_PER_PAGE, OFFSET, SORT, ORDER)
//                 const count = await getCount(`WHERE history.status = '2'`)
//                 return res.json({ result, count })
//             } catch (e) {
//                 return res.status(404).json({ message: e.message })
//             }
//         default:
//             break
//     }next()
// })

//search history
router.get('/searchHistory', async (req, res, next) => {
    await authorized(req.user.role)
    const SORT = req.query.sort
    const ORDER = req.query.order
    const STATUS = req.query.status
    const SEARCH = req.query.search
    const ITEMS_PER_PAGE = 10
    const OFFSET = (req.query.page - 1) * ITEMS_PER_PAGE
    let textStatusSQL;
    if (STATUS !== '') {
        textStatusSQL = `WHERE history.status IN(${STATUS})`
    } else {
        textStatusSQL = `WHERE NOT history.status = 0`
    }
    try {
        const result = await searchHistory(textStatusSQL, ITEMS_PER_PAGE, OFFSET, SORT, ORDER, SEARCH);
        const count = await searchCount(textStatusSQL, SEARCH)
        return res.json({ result, count })
    } catch (e) {
        return res.status(404).json({ message: e.message })
    }
})

// getPlan
router.get('/getPlan', async (req, res, next) => {
    await authorized(req.user.role)
    try {
        const result = await sql_query(
            `SELECT plan.id_plan, plan.name, start_date, end_date, status, details 
            FROM plan`);
        return res.json(result);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
})

router.get('/groupMember', async (req, res, next) => {
    await authorized(req.user.role)
    const SORT = req.query.sort
    const ORDER = req.query.order
    const STATUS = req.query.status
    const SEARCH = req.query.search
    const ITEMS_PER_PAGE = 10
    const OFFSET = (req.query.page - 1) * ITEMS_PER_PAGE
    try {
        const result = await sql_query(`SELECT * FROM report_group_member 
        WHERE title LIKE '%${SEARCH}%' 
        ORDER BY ${String(SORT)} ${String(ORDER)} LIMIT ${ITEMS_PER_PAGE} OFFSET ${OFFSET}`);
        const count = await sql_query(`SELECT COUNT(*) AS count FROM report_group_member 
        WHERE title LIKE '%${SEARCH}%' 
        ORDER BY ${String(SORT)} ${String(ORDER)} LIMIT ${ITEMS_PER_PAGE} OFFSET ${OFFSET}`);
        return res.json({ result, count });
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
})


// staff approv
router.post('/approv', async (req, res, next) => {
    await authorized(req.user.role)
    const { distance, time, status, remark, id_history } = req.body
    try {
        await sql_query(
            `UPDATE history
            SET distance = ?, time = ?, status = ?, remark = ?
            WHERE id_history = ? `, [distance, time, status, remark, id_history])
        return res.status(200).json({ message: "success" });
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
})

router.get('/groupTypeMember', async (req, res, next) => {
    await authorized(req.user.role)
    try {
        const result = await sql_query(
            `SELECT id,title FROM report_group_member`);
        return res.json({ result });
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
})

router.post('/addRangeAge', async (req, res, next) => {
    await authorized(req.user.role)
    const { groupMember, typeTime, range_start, reane_end } = req.body
    try {
        await sql_query(
            `INSERT INTO report_range_age (id_report_group_member,id_report_type_time,range_start,range_end,create_at) 
            VALUES (?,?,?,?,?)`, [groupMember, typeTime, range_start, reane_end, dateNow])
        return res.status(200).json({ message: "success" });
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})

router.get('/typeTime', async (req, res, next) => {
    try {
        const result = await sql_query(
            `SELECT id,title FROM report_type_time`)
        return res.json({ result });
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})

router.post('/addTypeMember', async (req, res, next) => {
    await authorized(req.user.role)
    const { title, detail } = req.body
    try {
        await sql_query(
            `INSERT INTO report_group_member (title,details,create_at) VALUES (?,?,?)`, [title, detail, dateNow])
        return res.status(200).json({ message: "success" });
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
})

// -------------------------------------------- FUNCTIONS SQL QUERY------------------------------------------------------------
function authorized(role) {
    if (role === 'user') return res.status(404).json({ message: 'Unauthorized' })
}
function getUser(status) {
    return sql_query(
        `SELECT id_user, employee_id, name, status, contact_number, email 
        FROM user WHERE status = '?'`, [status]
    )
}
function searchCount(result, SEARCH) {
    return sql_query(
        `SELECT COUNT(*) AS count
        FROM history
        INNER JOIN user
        ON history.employee_id = user.employee_id
        INNER JOIN plan
        ON history.id_plan = plan.id_plan
        ${String(result)} AND(user.employee_id LIKE '%${SEARCH}%' OR user.name LIKE '%${SEARCH}%')
        ORDER BY history.timeupdate DESC`
    )
}
function searchHistory(result, ITEMS_PER_PAGE, OFFSET, SORT, ORDER, SEARCH) {
    return sql_query(
        `SELECT user.employee_id AS user_id, history.id_history, user.name, user.member_type_name, date, distance, time, history.status, plan.name AS plan_name, history.remark, history.start_work
        FROM history
        INNER JOIN user
        ON history.employee_id = user.employee_id
        INNER JOIN plan
        ON history.id_plan = plan.id_plan
        ${String(result)} AND(user.employee_id LIKE '%${SEARCH}%' OR user.name LIKE '%${SEARCH}%')
        ORDER BY ${String(SORT)} ${String(ORDER)} LIMIT ${ITEMS_PER_PAGE} OFFSET ${OFFSET}`)
}
function getCount(result) {
    return sql_query(
        `SELECT COUNT(*) AS count
        FROM history
        INNER JOIN user
        ON history.employee_id = user.employee_id
        INNER JOIN plan
        ON history.id_plan = plan.id_plan
        ${String(result)}
        ORDER BY history.timeupdate DESC`
    )
}
function getHistory(result, ITEMS_PER_PAGE, OFFSET, SORT, ORDER) {
    return sql_query(
        `SELECT user.employee_id AS user_id, history.id_history, user.name, user.member_type_name, date, distance, time, history.status, plan.name AS plan_name, history.remark, history.start_work
        FROM history
        INNER JOIN user
        ON history.employee_id = user.employee_id
        INNER JOIN plan
        ON history.id_plan = plan.id_plan
        ${String(result)}
        ORDER BY ${String(SORT)} ${String(ORDER)} LIMIT ${ITEMS_PER_PAGE} OFFSET ${OFFSET}`)
}
function getqueryBirth(start, end, sex, id_plan, yearselect, yyyy) {
    return sql_query(
        `SELECT user.shirt_size, user.birthday, ${yyyy} - (YEAR(user.birthday)) AS yearAge, user.sex, user.operating_age, user.employee_id, user.name, department.name AS department, SUM(history.distance) AS total_distance, SUM(history.time) AS total_time, plan.start_date, plan.end_date, plan.name AS plan_name, plan.id_plan 
        FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
        INNER JOIN department ON department.id = user.id_department 
        INNER JOIN plan ON history.id_plan = plan.id_plan 
        WHERE(${yyyy} - (YEAR(user.birthday)) BETWEEN ${start} AND ${end}) 
        AND history.status = 1 
        AND plan.id_plan = "${id_plan}"
        AND user.sex = "${sex}"
        AND NOT(history.employee_id LIKE "b%" OR history.employee_id LIKE "m%" OR history.employee_id LIKE "d%")
        AND '${yearselect}' = YEAR(from_unixtime(history.date))
        GROUP BY user.name 
        ORDER BY total_distance DESC`)
}
function getqueryUpBirth(start, sex, id_plan, yearselect, yyyy) {
    return sql_query(
        `SELECT user.shirt_size, user.birthday, ${yyyy} - (YEAR(user.birthday)) AS yearAge, user.sex, user.operating_age, user.employee_id, user.name, department.name AS department, SUM(history.distance) AS total_distance, SUM(history.time) AS total_time, plan.start_date, plan.end_date, plan.name AS plan_name, plan.id_plan 
        FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
        INNER JOIN department ON department.id = user.id_department 
        INNER JOIN plan ON history.id_plan = plan.id_plan 
        WHERE(${yyyy} - (YEAR(user.birthday)) > ${start}) 
        AND history.status = 1 
        AND plan.id_plan = "${id_plan}"
        AND user.sex = "${sex}"
        AND NOT(history.employee_id LIKE "b%" OR history.employee_id LIKE "m%" OR history.employee_id LIKE "d%")
        AND '${yearselect}' = YEAR(from_unixtime(history.date))
        GROUP BY user.name 
        ORDER BY total_distance DESC`)
}
function getqueryStudent(sex, id_plan, yearselect) {
    return sql_query(
        `SELECT user.shirt_size, user.sex, YEAR(user.operating_age) + 543 AS operating_age, user.employee_id, user.name, department.name AS department, SUM(history.distance) AS total_distance, SUM(history.time) AS total_time, plan.start_date, plan.end_date, plan.name AS plan_name, plan.id_plan 
        FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
        INNER JOIN department ON department.id = user.id_department 
        INNER JOIN plan ON history.id_plan = plan.id_plan 
        WHERE history.status = 1 
        AND plan.id_plan = "${id_plan}"
        AND user.sex = "${sex}"
        AND NOT(history.employee_id LIKE "1%" OR history.employee_id LIKE "2%" OR history.employee_id LIKE "5%")
        AND '${yearselect}' = YEAR(from_unixtime(history.date))
        GROUP BY user.name 
        ORDER BY total_distance DESC`)
}

module.exports = router