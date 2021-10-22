const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = function(express, app){
    const db = require('../database.js');

    app.post('/register', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        const role = req.body.role;
        
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.log(err);
            }
            
            // Database query om de gegevens van de gebruiker in de database te zetten
            db.query(
                "INSERT INTO users (username, password, role) VALUES (?,?,?)",
                [username, hash, role],
                (err, result) => {
                    console.log(err);
            });  
        });
    });
};