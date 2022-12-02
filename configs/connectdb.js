const mysql = require("serverless-mysql")
require('dotenv').config()

const db = mysql({
    config: {
        host: process.env.NODE_ENV === 'production' ? process.env.MYSQL_HOST : "localhost",
        database: process.env.NODE_ENV === 'production' ? process.env.MYSQL_DATABASE : "shcsut",
        port: process.env.NODE_ENV === 'production' ? process.env.MYSQL_PORT : "3366",
        user: process.env.NODE_ENV === 'production' ? process.env.MYSQL_USER : "root",
        password: process.env.NODE_ENV === 'production' ? process.env.MYSQL_PASSWORD : "",
    },
});

 function sql_query(query_string, values = []) {
    try {
        const results = db.query(query_string, values)
        db.end()
        return results
    } catch (e) {
        throw Error(e.message)
    }
}
  
module.exports = {
    db,
    sql_query,
}