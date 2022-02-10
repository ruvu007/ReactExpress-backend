const express = require("express");
const app = express();
const cors = require("cors");

const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ["GET", "POST"],
    credentials: true
}));

// Parser
app.use(cookieParser());

app.get('/', (req, res) => res.send('React & Express project'));

// Routes importeren
require('./routes/auth')(express, app);
require('./routes/registration')(express, app);
require('./routes/employeeAuth')(express, app);

app.listen(3001, function() {
    console.log("Express server running on port 3001")
});