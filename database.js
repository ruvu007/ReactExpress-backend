const mysql = require('mysql2');

module.exports = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Fay2002BHR',
    database: 'linkedvest_ruben'
})