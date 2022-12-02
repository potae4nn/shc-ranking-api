const router = require('express').Router()
const { sql_query } = require('../configs/connectdb')
const fs = require('fs')
const moment = require('moment')

router.post('/', async (req, res, next) => {
    const employee_id = req.body.employee_id;
    const date = moment().unix();
    const distance = req.body.formdata.distance;
    const start_time = req.body.formdata.startTime;
    const time = req.body.formdata.periodH + ":" + checkMinute(req.body.formdata.periodM);
    const status = "0";
    const file = req.body.file;
    const id_plan = req.body.id_plan;

    let dir = './public/images/'
    try {
        const data = file.replace(/^data:image\/\w+;base64,/, "")
        const img = employee_id + 'p' + new Date().getTime() + '.jpg'
        const path = dir + img

        fs.writeFile(path, data, { encoding: "base64" }, async function (err) {
            if (err) {
                console.log(err);
            } else {
                let timeNewData;
                if (time < 0.6) {
                    timeNewData = time * 100;
                } else {
                    let timeSplit = time.split(":");
                    let timeSplitNum;
                    if (!timeSplit[1]) {
                        timeNewData = Number(timeSplit[0] * 60);
                    } else {
                        if (timeSplit[1] == '1' ||
                            timeSplit[1] == '2' ||
                            timeSplit[1] == '3' ||
                            timeSplit[1] == '4' ||
                            timeSplit[1] == '5' ||
                            timeSplit[1] == '6' ||
                            timeSplit[1] == '7' ||
                            timeSplit[1] == '8' ||
                            timeSplit[1] == '9') {
                            timeSplitNum = Number(timeSplit[1] * 10);
                        } else {
                            timeSplitNum = Number(timeSplit[1]);
                        }
                        timeNewData = Number(timeSplit[0] * 60) + timeSplitNum;
                    }
                }
                const results = await sql_query("INSERT INTO history (employee_id,date,distance,time,status,img,id_plan,start_work) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [employee_id, date, distance, timeNewData, status, img, id_plan, start_time]);
                return res.status(200).json({ message: "Success", results });
            }
        });
    } catch (e) {
        console.log(e)
    }

})

router.get('/:id_history', async (req, res, next) => {
    const id_history = req.params.id_history
    try {
        const results = await sql_query(`SELECT * FROM history WHERE id_history = ${id_history}`);
        return res.status(200).json(results);
    } catch (e) {
        res.status(404).json({ message: e.message });
    } next()
})

router.put('/', async (req, res, next) => {
    const id_history = req.body.form.id_history;
    const distance = req.body.form.distance;
    const timeNew = req.body.form.timeNew;
    const periodM = req.body.form.periodM;
    const periodH = req.body.form.periodH;
    const employee_id = req.body.form.employee_id;
    const time = req.body.form.time;
    const imgForm = req.body.form.img;
    const file = req.body.file;
    const dir = './public/image/';
    const date = moment().unix();
    let timeNewCon;
    if (periodM != '' || periodH != '') {
        if (periodM < 10) {
            timeNewCon = (periodH == '' ? '00' : periodH) + ':' + '0' + periodM;
        } else {
            timeNewCon = (periodH == '' ? '00' : periodH) + ':' + (periodM == '' ? '00' : periodM);
        }
    } else if (periodM == '' && periodH == '') {
        timeNewCon = null;
    }
    if (file !== '') {
        // console.log('เปลี่ยนรูปนะ', employee_id);
        try {
            const data = file.replace(/^data:image\/\w+;base64,/, "");
            const path = dir + employee_id + 'p' + date + '.jpg';
            const img = employee_id + 'p' + date + '.jpg';
            fs.writeFile(path, data, { encoding: "base64" }, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    let timeNewData;
                    if (timeNewCon == null) {
                        timeNewData = time;
                    } else {
                        let timeSplit = timeNewCon.split(":");
                        let timeSplitNum;
                        console.log(timeSplit);
                        if (!timeSplit[1]) {
                            timeNewData = Number(timeSplit[0] * 60);
                        } else {
                            if (timeSplit[1] == '1' ||
                                timeSplit[1] == '2' ||
                                timeSplit[1] == '3' ||
                                timeSplit[1] == '4' ||
                                timeSplit[1] == '5' ||
                                timeSplit[1] == '6' ||
                                timeSplit[1] == '7' ||
                                timeSplit[1] == '8' ||
                                timeSplit[1] == '9') {
                                timeSplitNum = Number(timeSplit[1] * 10);
                                // console.log(timeSplitNum);
                            } else {
                                timeSplitNum = Number(timeSplit[1]);
                            }
                            timeNewData = Number(timeSplit[0] * 60) + timeSplitNum;
                        }
                        // }
                    }
                    const results = sql_query(
                        `UPDATE history
                        SET distance = '${distance}',time = '${timeNewData}',img = '${img}'
                        WHERE id_history = ${id_history}`
                    );
                    return res.status(200).json({ message: "Success", results });
                }
            });
        } catch (error) {
            console.log(error);
            res.status(404).json({ message: error.message });
        }
    } else {
        let timeNewData;
        if (timeNewCon == null) {
            timeNewData = time;
        } else {
            let timeSplit = timeNewCon.split(":");
            let timeSplitNum;
            if (!timeSplit[1]) {
                timeNewData = Number(timeSplit[0] * 60);
            } else {
                if (timeSplit[1] == '1' ||
                    timeSplit[1] == '2' ||
                    timeSplit[1] == '3' ||
                    timeSplit[1] == '4' ||
                    timeSplit[1] == '5' ||
                    timeSplit[1] == '6' ||
                    timeSplit[1] == '7' ||
                    timeSplit[1] == '8' ||
                    timeSplit[1] == '9') {
                    timeSplitNum = Number(timeSplit[1] * 10);
                } else {
                    timeSplitNum = Number(timeSplit[1]);
                }
                timeNewData = Number(timeSplit[0] * 60) + timeSplitNum;
            }
        }
        const results = sql_query(
            `UPDATE history
            SET distance = '${distance}',time = '${timeNewData}',img = '${imgForm}'
            WHERE id_history = ${id_history}`
        );
        return res.status(200).json({ message: "Success", results });
    }
})

router.get('/ranking', async (req, res, next) => {
    console.log('data')

    // req.params.id_plan, req.params.id_range, req.params.year
    // if (req.query.id_range !== undefined) {
    //     const range_age = await sql_query(`
    //     SELECT rtt.title,rra.id,rra.id_report_group_member,rra.id_report_type_time,rra.range_start,rra.range_end 
    //     FROM report_range_age AS rra 
    //     INNER JOIN report_type_time AS rtt 
    //     ON rtt.id = rra.id_report_type_time 
    //     WHERE rra.id=${req.query.id_range}`
    //     )
    //     console.log(range_age[0])
    //     switch (range_age[0].id_report_type_time) {
    //         case 1:
    //             // if()
    //             console.log(range_age[0].range_start)
    //             console.log(range_age[0].range_end)
    //             console.log(range_age[0].title)
    //             break;
    //         case 2:
    //             console.log(range_age[0].range_start)
    //             console.log(range_age[0].range_end)
    //             console.log(range_age[0].title)
    //             break;

    //         default:
    //             break;
    //     }
        return res.status(200).json({ message: "Success"});
    // }
    
    // await sql_query(`SELECT user.shirt_size,user.sex,YEAR(user.operating_age)+543 AS operating_age,user.employee_id,user.name,department.name AS department, SUM(history.distance) AS total_distance,SUM(history.time) AS total_time,plan.start_date,plan.end_date,plan.name AS plan_name,plan.id_plan 
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
    //     ORDER BY total_distance DESC`)
})


// function 
function checkMinute(periodM) {
    let timeNewCon = '';
    if (periodM !== '') {
        if (periodM < 10) {
            timeNewCon = '0' + periodM;
        } else {
            timeNewCon = periodM;
        }
    }
    return timeNewCon;
}

module.exports = router