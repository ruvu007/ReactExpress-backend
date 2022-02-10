const bcrypt = require("bcrypt");
const saltRounds = 10;

const session = require("express-session");
const requestIp = require("request-ip");
var MySQLStore = require('express-mysql-session')(session);

module.exports = function(express, app){
    const db = require('../database.js');

    // Werknemer toevoegen aan bedrijf
    app.post('/addemployee', (req, res) => {
        const companyid = req.session.user[0].id;
        const fullname = req.body.fullname;
        const email = req.body.email;
        const password = req.body.password;
        console.log(companyid, fullname, email, password);

        // Het wachtwoord encrypten
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.log(err);
            }

            db.query(
                "SELECT COUNT(*) AS total FROM employees WHERE email = ?",
                [email],
                (err, result) => {
                    if (result[0].total > 0) {
                        res.send({message: "Het opgegeven emailadres is al in gebruik"});
                    } else {
                        // Database query om de gegevens van de werknemer in de database te zetten
                        db.query(
                            "INSERT INTO employees (companyid, fullname, email, password) VALUES (?,?,?,?)",
                            [companyid, fullname, email, hash],
                            (err, result) => {
                                console.log(err);
                            }
                        );
                        res.send({message: "De gebruiker is toegevoegd"});
                    };
                }
            );
        });
    });

    // Login & sessies

    var options2 = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'Database1!',
        database: 'linkedvest_ruben',
        schema: {
            tableName: 'employeesessions',
            columnNames: {
                session_id: 'session_id',
                expires: 'expires',
                data: 'data'
            }
        }
    };

    var sessionStore2 = new MySQLStore(options2);

    // Sessie instellingen
    app.use(
        session ({
            key: "userId",
            secret: "IqFic484907I0T552hiMQ1UCJimRGL55",
            resave: false,
            saveUninitialized: false,
            store: sessionStore2,
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
    app.get('/employeelogin', (req, res) => {
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
    app.post('/employeelogin', (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        const ipaddress = requestIp.getClientIp(req);

        const getDate = new Date();
        const date = getDate.toISOString().slice(0,10);
        const hours = getDate.getHours();
        const minutes = getDate.getMinutes();
        const fullDate = date + " - " + hours + ":" + minutes;

        db.query(
            "SELECT * FROM employees WHERE email = ?",
            email,
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
                                "UPDATE employees SET ipaddress = ?, loggedin = 'yes', date = ?, loginamount = loginamount + 1 WHERE email = ?",
                                [ipaddress, fullDate, email],
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
    app.post('/employeelogout', (req, res) => {
        const email = req.session.user[0].email;
        console.log(email);
        
        if (req.session.user) {
            db.query(
                "UPDATE users SET loggedin = 'no' WHERE email = ?",
                [email],
                (err, result) => {
                    console.log('uitgelogd');
                }
            );

            req.session.destroy();
            res.send({
                loggedIn: false
            });
        } else {
            console.log("Uitlog van " + email + " ging verkeerd")
        }
    });

};