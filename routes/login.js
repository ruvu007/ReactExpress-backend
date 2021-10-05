const bcrypt = require("bcrypt");

module.exports = function(express, app){
    const db = require('../database.js');

    app.post('/login', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        db.query(
            "SELECT * FROM users WHERE username = ?",
            username,
            (err, result) => {
                if (err) {
                    res.send({err: err});
                }  
                if (result.length > 0) {
                    bcrypt.compare(password, result[0].password, (error, response) => {
                        if (response) {
                            res.send({message: "Ingelogd"});
                        } else {
                            res.send({message: "Het opgegeven wachtwoord is incorrect."});
                        }
                    });
                } else {
                    res.send({message: "Het opgegeven emailadres bestaat niet."});
                }
            }
        );
    });
};