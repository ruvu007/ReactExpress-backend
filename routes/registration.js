const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = function(express, app){
    const db = require('../database.js');

    app.post('/register', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        const name = req.body.name;
        const country = req.body.country;
        const zip = req.body.zip;
        const housenumber = req.body.housenumber;
        const phone = req.body.phone;
        const kvk = req.body.kvk;
        const btw = req.body.btw;
        const bankaccount = req.body.bankaccount;
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
                            "INSERT INTO users (username, password, role, name, country, zip, housenumber, phone, kvk, btw, bankaccount) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                            [username, hash, role, name, country, zip, housenumber, phone, kvk, btw, bankaccount],
                            (err, result) => {
                                console.log(err);
                        });  
                    };
                }
            );
        });
    });
};