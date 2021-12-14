const bcrypt = require("bcrypt");
const session = require("express-session");
const requestIp = require("request-ip");

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
            res.send({ 
                loggedIn: true, 
                user: req.session.user
            });
        } else {
            res.send({ 
                loggedIn: false 
            });
        }
    });

    // Login functie
    app.post('/login', (req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        const ipaddress = requestIp.getClientIp(req);

        const getDate = new Date();
        const date = getDate.toISOString().slice(0,10);
        const hours = getDate.getHours();
        const minutes = getDate.getMinutes();
        const fullDate = date + " - " + hours + ":" + minutes;

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

                            // Gebruiker status
                            db.query(
                                "UPDATE users SET ipaddress = ?, loggedin = 'yes', date = ?, loginamount = loginamount + 1 WHERE username = ?",
                                [ipaddress, fullDate, username],
                                (err, result) => {
                                    console.log('ingelogd');
                                }
                            );

                            // Login succesvol
                            res.send({
                                loggedIn: true
                            });

                        } else {
                            // Wachtwoord incorrect
                            res.send({
                                loggedIn: false,
                                message: "Het opgegeven wachtwoord is incorrect."
                            });
                        }
                    });
                } else {
                    res.send({
                        loggedIn: false,
                        message: "Het opgegeven emailadres bestaat niet."
                    });
                }
            }
        );
    });

    // Uitlog functie
    app.post('/logout', (req, res) => {
        const username = req.session.user[0].username;
        console.log(username);
        
        if (req.session.user) {
            db.query(
                "UPDATE users SET loggedin = 'no' WHERE username = ?",
                [username],
                (err, result) => {
                    console.log('uitgelogd');
                }
            );

            req.session.destroy();
            res.send({
                loggedIn: false
            });
        } else {
            console.log("Uitlog van " + username + " ging verkeerd")
        }
    });
};