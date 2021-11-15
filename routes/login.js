const bcrypt = require("bcrypt");
const session = require("express-session");

module.exports = function(express, app){
    const db = require('../database.js');

    // Sessie instellingen
    app.use(
        session ({
            key: "userId",
            secret: "IqFic484907I0T552hiMQ1UCJimRGL55",
            resave: false,
            saveUninitialized: false,
            cookie: {
                // De tijd tot de cookie vervalt (staat nu op 1 uur)
                maxAge: 1000 * 60 * 60,
                sameSite: true,
                // Nodig indien de site online op https staat
                // secure: true
            },
        })
    );

    // Checkt of de gebruiker nog een geldige cookie heeft
    app.get('/login', (req, res) => {
        if (req.session.user) {
            res.send({ loggedIn: true, user: req.session.user });
        } else {
            res.send({ loggedIn: false });
        }
    });

    // Login functie
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
                            req.session.user = result;
                            console.log(req.session.user);
                            res.send({
                                auth: true,
                                message: username
                            });
                        } else {
                            res.send({
                                auth: false,
                                message: "Het opgegeven wachtwoord is incorrect."
                            });
                        }
                    });
                } else {
                    res.send({
                        auth: false,
                        message: "Het opgegeven emailadres bestaat niet."
                    });
                }
            }
        );
    });
};