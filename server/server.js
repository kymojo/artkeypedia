
// =========================================
// Require modules
// -----------------------------------------
const path = require('path');
const express = require('express');
const Joi = require('joi');
const mysql = require('mysql');
const history = require('connect-history-api-fallback-exclusions');

// =========================================
// Set up express app
// -----------------------------------------

// Set express app
const app = express();
app.use(express.json()); // allow JSON parsing
app.use(history({
    exclusions: [
        '/api/*'
    ]
}));

// Set port using PORT environment variable
// (eg. using command: set PORT=1337)
// if not set, default to port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

// =========================================
// Use public folder
// -----------------------------------------

app.use(express.static(path.join(__dirname, '../client/public')));

// =========================================

app.get('/api/test',(req,res) => {

    const con = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'caps'
    });

    con.query("SELECT 'Beef' AS Beefy", (err,rows,fields) => {
        res.send(rows);
    });
});




  
//   con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//   });

