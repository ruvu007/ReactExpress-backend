const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = function(express, app){
    const db = require('../database.js');

    app.post('/register', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.log(err);
            }

            db.query(
                "INSERT INTO users (username, password) VALUES (?,?)",
                [username, hash],
                (err, result) => {
                    console.log(err);
            });  
        });

        
    });
};