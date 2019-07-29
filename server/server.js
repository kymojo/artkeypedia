
// =========================================
// Require modules
// -----------------------------------------
const path = require('path');
const express = require('express');
const history = require('connect-history-api-fallback-exclusions');

// =========================================
// Set up express app
// -----------------------------------------

// Set express app
const app = express();
app.use(express.json()); // allow JSON parsing
app.use(history({
    exclusions: [
        '/api/*',
        '/image/*'
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
// API
// -----------------------------------------
const Joi = require('joi');
const mysql = require('mysql');

// -----------------------------------------
// Define MySQL and custom Joi types (for convenience)

const JoiMySQL = {
    INT: Joi.number().integer().max(2147483647).min(-2147483648),
    INT_UNSIGNED: Joi.number().integer().max(4294967295).min(0),
}

const JoiCustom = {
    PK: JoiMySQL.INT,
    ID: Joi.string().max(20),
    Text: Joi.string().max(45)
};

// ------------------------------------------
// Define Tables

const ArtistTable = {

    schema: {
        ArtistId: /*        */ JoiCustom.ID,
        ArtistName: /*      */ JoiCustom.Text,
        ArtistWebsite: /*   */ JoiCustom.Text,
        ArtistInstagram: /* */ JoiCustom.Text,
        ArtistReddit: /*    */ JoiCustom.Text,
        ArtistGeekhack: /*  */ JoiCustom.Text,
        ImagePk: /*         */ JoiCustom.Text,
        ImageURL: /*        */ JoiCustom.Text
    }

};

// -------------------------------------------
// API Helpers

const ApiCode = {
    BAD_PARAM: 400, // Invalid request syntax
    NOT_LOGIN: 401, // Unauthorized: not logged in
    FORBIDDEN: 403, // Forbidden resource
    NOT_FOUND: 404, // Resource not found
    NOT_ALLOW: 405, // API call not allowed
    CONFLICTS: 409, // Conflicted resource state (e.g. already exists)
    SRV_ERROR: 500, // Internal server error
}

function sendStatus(res, code, message) {
    return res.status(code).send(message);
}

// -------------------------------------------
// MySQL Helper Functions

function getDbConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'caps'
    });
}

// -------------------------------------------
// Validation Helper Functions

function validateArtist(artist) {
    return Joi.validate(artist, ArtistTable.schema);
}

function validatePk(pk) {
    const schema = JoiCustom.PK.required();
    return Joi.validate(pk, schema);
}

// -------------------------------------------
// GET

app.get('/api/artist/:pk', (req, res) => {

    const pk = req.params.pk;

    if (validatePk(pk).error)
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid syntax!');

    const con = getDbConnection();
    const sql = `
        SELECT
            a.ArtistId,
            a.ArtistName, 
            a.ArtistWebsite,
            a.ArtistInstagram,
            a.ArtistReddit,
            a.ArtistGeekhack,
            i.ImagePk,
            i.ImageURL
        FROM caps.a_artist a
        JOIN caps.a_image i
            ON a.ImagePk = i.ImagePk
        WHERE a.ArtistPk = ${pk}
    `;
    con.query(sql, (err, rows, fields) => {

        if (err) {
            console.log(err.message);
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        }

        if (rows.length == 0)
            return sendStatus(res, ApiCode.NOT_FOUND, `Could not find a maker with PK = ${pk}`);

        res.send(rows);
    });
});

app.post('/api/artist/', (req, res) => {

    const artist = req.body;
    if (validateArtist(artist).error) return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object schema!');

    // TODO: actually INSERT
});

app.put('/api/artist/', (req, res) => {

    const artist = req.body;
    if (validateArtist(artist).error) return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object schema!');

    // TODO: actually UPDATE
});

app.delete('/api/artist/', (req, res) => {

    const artist = req.body;
    if (validateArtist(artist).error) return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object schema!');

    // TODO: actually DELETE
});
