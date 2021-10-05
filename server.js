const express = require("express");
const app = express();
const cors = require("cors");

// Cors instellingen
const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,
    optionSuccessStatus:200
}

app.use(express.json());
app.use(cors(corsOptions));

app.get('/', (req, res) => res.send('React & Express project'));

// Routes importeren
require('./routes/login')(express, app);
require('./routes/registration')(express, app);

app.listen(3001, function() {
    console.log("Express server running on port 3001")
});