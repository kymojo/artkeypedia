
// =========================================
// Require modules
// -----------------------------------------
const path = require('path');
const express = require('express');
const history = require('connect-history-api-fallback-exclusions');

const dbHelper = require('./dbHelper.js');

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

// -----------------------------------------
// Define MySQL and custom Joi types (for convenience)

const JoiMySQL = {
    INT: Joi.number().integer().max(2147483647).min(-2147483648),
    INT_UNSIGNED: Joi.number().integer().max(4294967295).min(0),
};

const JoiCustom = {
    PK: JoiMySQL.INT,
    ID: Joi.string().max(20),
    Text: Joi.string().max(45)
};

// ------------------------------------------
// Define Tables

const ArtistTable = {

    schema: {
        ArtistPk: /*        */ JoiCustom.PK,
        ArtistId: /*        */ JoiCustom.ID,
        ArtistName: /*      */ JoiCustom.Text,
        ArtistWebsite: /*   */ JoiCustom.Text.allow(null),
        ArtistInstagram: /* */ JoiCustom.Text.allow(null),
        ArtistReddit: /*    */ JoiCustom.Text.allow(null),
        ArtistGeekhack: /*  */ JoiCustom.Text.allow(null),
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
// Validation Helper Functions

function validateArtist(artist) {
    return Joi.validate(artist, ArtistTable.schema);
}

function validatePk(pk) {
    const schema = JoiCustom.PK.required();
    return Joi.validate(pk, schema);
}

// -------------------------------------------

function getParam(req, paramString) {
    return req.params[paramString];
}

// -------------------------------------------
// GET

app.get('/api/artist/:pk', (req, res) => {

    const pk = getParam(req, 'pk');

    if (validatePk(pk).error)
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid syntax!');

    const con = dbHelper.getDbConnection();
    const sql = `
        SELECT
            a.ArtistPk,
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

    console.log(artist);

    const queries = [];

    queries.push(dbHelper.newQuery(`
        INSERT INTO caps.a_artist (
            ArtistId, ArtistName, ArtistWebsite,
            ArtistInstagram, ArtistReddit,
            ArtistGeekhack)
        VALUES (
            :id, :name, :website,
            :insta, :reddit,
            :geekhack
        );
    `, {
        id: artist.ArtistId,
        name: artist.ArtistName,
        website: artist.ArtistWebsite,
        insta: artist.ArtistInstagram,
        reddit: artist.ArtistReddit,
        geekhack: artist.ArtistGeekhack
    }));

    if (artist.ImageUrl) {

        queries.push(dbHelper.newQuery(`
            INSERT INTO caps.a_image (ImageURL)
            VALUES (:url);
        `,{ url: artist.ImageURL }));
    }

    console.log(queries);

    dbHelper.queryDatabase(queries, true, (result) => {
        res.send(result);
    },
        (err) => {
            console.log(err.message);
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        });
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
