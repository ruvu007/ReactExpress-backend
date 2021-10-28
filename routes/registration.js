const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = function(express, app){
    const db = require('../database.js');

    app.post('/register', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        const role = req.body.role;
        
        // Het wachtwoord encrypten
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.log(err);
            }

            // Database query om te checken of er al een gebruiker is met het opgegeven email
            db.query(
                "SELECT COUNT(*) AS total FROM users WHERE username = ?",
                [username],
                (err, result) => {
                    if (result[0].total > 0) {
                        res.send({message: "Het opgegeven emailadres is al in gebruik"});
                    } else {
                        // Database query om de gegevens van de gebruiker in de database te zetten
                        db.query(
                            "INSERT INTO users (username, password, role) VALUES (?,?,?)",
                            [username, hash, role],
                            (err, result) => {
                                console.log(err);
                        });  
                    };
                }
            );
        });
    });
};