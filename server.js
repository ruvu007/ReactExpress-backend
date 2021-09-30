const express = require("express");
const app = express();
const cors = require("cors");

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,
    optionSuccessStatus:200
}

app.use(express.json());
app.use(cors(corsOptions));

// Database informatie
const db = require('./database');

app.get('/', (req, res) => res.send('Test'));

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.query(
        "INSERT INTO users (username, password) VALUES (?,?)",
        [username, password],
        (err, result) => {
            console.log(err);
    });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.query(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, result) => {
            if (err) {
                res.send({err: err});
            }  
            if (result.length > 0) {
                res.send(result);
            } else {
                res.send({message: "Het opgegeven emailadres bestaat niet of het wachtwoord is incorrect."});
            }
        }
    );
})

app.listen(3001, function() {
    console.log("Express server running on port 3001")
});