const router = require('express').Router()
const bcrypt = require('bcrypt')
const { sql_query } = require('../configs/connectdb')

router.get('/', async (req, res, next) => {
    // console.log(sql_query(`SELECT id_user,employee_id,name,status,contact_number,email FROM user`));
    try {
        const results = await sql_query(
            `SELECT email FROM user`
        );
        return res.json(results)
    } catch (e) {
        res.status(404).json({ message: e.message })
    } next();
    // res.send({ message: "user" })
})

router.get('/sum/:id/:plan/:sex', async (req, res, next) => {
    const employee_id = req.params.id
    const plan = req.params.plan
    const sex = req.params.sex
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    const yyyy = today.getFullYear()
    let todayCon = yyyy + '-' + mm + '-' + dd
    try {
        let results;
        // console.log(todayCon);
        const result = await sql_query(`SELECT YEAR('${todayCon}')-YEAR(operating_age) AS operating_age FROM user WHERE employee_id="${employee_id}"`);
        //sql_query dynamic รุ่น 

        if (result[0].operating_age >= 0 && result[0].operating_age <= 10) {
            const start = 0;
            const end = 10;
            results = await querySql(`BETWEEN ${start} AND ${end}`, employee_id, sex, plan);

        } else if (result[0].operating_age >= 11 && result[0].operating_age <= 20, employee_id, sex, plan) {
            const start = 11;
            const end = 20;
            results = await querySql(`BETWEEN ${start} AND ${end}`, employee_id, sex, plan);

        } else {
            const start = 20;
            results = await querySql(`> ${start}`, employee_id, sex, plan);

        }
        return res.status(200).json(results);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
})

router.get('/sumbirth/:id_plan/:emp_id/:sex', async (req, res, next) => {
    const id_plan = req.params.id_plan
    const id_emp = req.params.emp_id
    const sex = req.params.sex
    const today = new Date()
    // const dd = String(today.getDate()).padStart(2, '0')
    // const mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    const yyyy = today.getFullYear()
    try {
        let results;
        const result = await sql_query(`SELECT birthday FROM user WHERE employee_id="${id_emp}"`);
        const b = new Date(result[0].birthday);
        const yyyyb = b.getFullYear();
        if (yyyy - yyyyb >= 20 && yyyy - yyyyb <= 45) {
            results = await querySum(`BETWEEN ${20} AND ${45}`, id_plan, sex, id_emp);
        }
        else {
            results = await querySum(`> ${45}`, id_plan, sex, id_emp);
        }
        return res.status(200).json(results);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
})

router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        const results = await sql_query(`SELECT * FROM user WHERE employee_id="${id}"`)
        console.log(results)
        return res.json(results)
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})

router.get('/department', async (req, res, next) => {
    try {
        const results = await sql_query(`SELECT id,name AS department FROM department`);
        return res.status(200).json(results);
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})

// ("${todayCon}" BETWEEN plan.start_date AND plan.end_date) AND
router.get('/distance/:plan/:id', async (req, res, next) => {
    const id_plan = req.params.plan;
    const employee_id = req.params.id;
    console.log(id_plan, employee_id)
    // const today = new Date();
    // const dd = String(today.getDate()).padStart(2, '0')
    // const mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    // const yyyy = today.getFullYear()
    // let todayCon = yyyy + '-' + mm + '-' + dd;
    try {
        const results = await sql_query(
            `SELECT SUM(history.distance) AS sum ,SUM(history.time) AS time ,plan.start_date,plan.end_date,user.sex FROM user 
            INNER JOIN history 
            ON user.employee_id = history.employee_id 
            INNER JOIN plan
            ON history.id_plan = plan.id_plan
            WHERE (history.employee_id="${employee_id}" AND history.status=1 AND plan.id_plan = "${id_plan}") 
            AND YEAR(NOW())=YEAR(from_unixtime(history.date))`
        )
        return res.status(200).json(results);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
})

router.get('/waitapplov/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        const results = await sql_query(`SELECT history.id_history,user.name,date,distance,time,history.status,plan.name AS plan_name 
                FROM history 
                INNER JOIN user 
                ON history.employee_id = user.employee_id 
                INNER JOIN plan ON history.id_plan = plan.id_plan 
                WHERE history.status=0  AND user.employee_id ="${id}"`)
        return res.status(200).json(results)
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})

router.get('/event/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        const results = await sql_query(`SELECT p.id_plan,p.name,p.end_date,p.end_date_register,p.start_date FROM user AS u
        INNER JOIN plan AS p
        ON u.id_plan = p.id_plan 
        INNER JOIN register_plan AS rp 
        ON rp.id_user = u.id_user 
        WHERE u.employee_id = "${id}" AND rp.status = 1`)
        console.log(results);
        return res.status(200).json({ message: "Success", results })
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
})

async function querySql(result, employee_id, sex, plan) {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    const yyyy = today.getFullYear()
    let todayCon = yyyy + '-' + mm + '-' + dd
    let emp_id_split
    const emp_id = String(employee_id);
    const emp_id_split_temp = emp_id.slice(0, 1);
    if (emp_id_split_temp == 'B' || emp_id_split_temp == 'M' || emp_id_split_temp == 'D') {
        emp_id_split = "history.employee_id LIKE '2%' OR history.employee_id LIKE '1%' OR history.employee_id LIKE '5%'"
    } else if (emp_id_split_temp == '2' || emp_id_split_temp == '1' || emp_id_split_temp == '5') {
        emp_id_split = "history.employee_id LIKE 'b%' OR history.employee_id LIKE 'm%' OR history.employee_id LIKE 'd%'"
    }
    return await sql_query(`SELECT user.sex,YEAR('${todayCon}')-YEAR(operating_age) AS operating_age,user.employee_id,user.name,department.name AS department, SUM(history.distance) AS total_distance,SUM(history.time) AS total_time,plan.start_date,plan.end_date,plan.name AS plan_name,plan.id_plan 
    FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
    INNER JOIN department ON department.id = user.id_department 
    INNER JOIN plan ON history.id_plan = plan.id_plan 
    WHERE YEAR('${todayCon}')-YEAR(user.operating_age) ${String(result)}
    AND history.status = 1 
    AND plan.id_plan = "${plan}"
    AND user.sex = "${sex}"
    AND YEAR(NOW()) = YEAR(from_unixtime(history.date))
    AND "${todayCon}" BETWEEN plan.start_date AND plan.end_date 
    AND NOT (${emp_id_split})
    GROUP BY user.name 
    ORDER BY total_distance DESC`)
}

async function querySum(result, id_plan, sex, id_emp) {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    const yyyy = today.getFullYear()
    let todayCon = yyyy + '-' + mm + '-' + dd
    let emp_id_split;
    const emp_id = String(id_emp);
    const emp_id_split_temp = emp_id.slice(0, 1);
    console.log(emp_id_split_temp);
    if (emp_id_split_temp == 'B' || emp_id_split_temp == 'M' || emp_id_split_temp == 'D') {
        emp_id_split = "history.employee_id LIKE '2%' OR history.employee_id LIKE '1%' OR history.employee_id LIKE '5%'"
    } else if (emp_id_split_temp == '2' || emp_id_split_temp == '1' || emp_id_split_temp == '5') {
        emp_id_split = "history.employee_id LIKE 'b%' OR history.employee_id LIKE 'm%' OR history.employee_id LIKE 'd%'"
    }
    return await sql_query(
    `SELECT 
        user.birthday,
        ${yyyy}-(YEAR(user.birthday)) AS yearAge,
        user.sex,
        user.operating_age,
        user.employee_id,
        user.name,
        dep.childName AS department,
        dep.parentName AS parentDepartment,
        SUM(history.distance) AS total_distance,
        SUM(history.time) AS total_time,
        plan.start_date,
        plan.end_date,
        plan.name AS plan_name,
        plan.id_plan,
       '${emp_id_split_temp}' AS prefixId
    FROM history RIGHT JOIN user ON history.employee_id = user.employee_id 
    LEFT JOIN (
        SELECT child.id,child.name AS childName,parent.name AS parentName,child.active FROM department AS child LEFT JOIN department AS parent ON parent.id = child.parent_id 
        ) dep
    ON dep.id = user.id_department 
    INNER JOIN plan ON history.id_plan = plan.id_plan 
    WHERE (${yyyy}-(YEAR(user.birthday)) ${String(result)}) 
    AND history.status = 1 
    AND plan.id_plan = "${id_plan}"
    AND user.sex = "${sex}"
    AND YEAR(NOW()) = YEAR(from_unixtime(history.date))
    AND "${todayCon}" BETWEEN plan.start_date AND plan.end_date 
    AND NOT (${emp_id_split})
    GROUP BY user.name 
    ORDER BY total_distance DESC`
    );
}

module.exports = router