
// =========================================
// Require modules
// -----------------------------------------
const path = require('path');
const express = require('express');
const history = require('connect-history-api-fallback-exclusions');
const cors = require('cors');

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
app.use(cors()); // for file uploading

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
        ImagePk: /*         */ JoiCustom.Text.allow(null),
        ImageURL: /*        */ JoiCustom.Text.allow(null)
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
    NOPE_FILE: 422, // Unprocessable entity
    SRV_ERROR: 500, // Internal server error
}

function sendStatus(res, code, message) {
    return res.status(code).send(message);
}

// -------------------------------------------
// Validation Helper Functions

function validateObject(obj, schema) {
    return Joi.validate(obj, schema);
}

function validateArtist(artist) {
    return validateObject(artist, ArtistTable.schema);
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

    console.log(`Attempting to GET artist with Pk ${pk}...`);
    console.log();

    if (validatePk(pk).error) {
        console.log('Invalid GET param.');
        console.log();
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid syntax!');
    }

    const queries = [];

    queries.push(dbHelper.newQuery(`
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
            LEFT JOIN caps.a_image i
                ON a.ImagePk = i.ImagePk
            WHERE a.ArtistPk = @pk;
        `, { pk: pk }));

    console.log('Queries:');
    console.log(queries);
    console.log();

    dbHelper.queryDatabase(queries, false,
        (result) => {
            console.log('Results:');
            console.log(result);
            console.log();

            const rows = result ? result[0] : [];

            if (rows.length == 0) {
                console.log(`Could not find a maker with Pk ${pk}`);
                console.log();
                return sendStatus(res, ApiCode.NOT_FOUND, `Could not find artist record!`);
            }

            res.send(rows);
        },
        (err) => {
            console.log(err.message);
            console.log();
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        });
});

app.post('/api/artist/', (req, res) => {

    const artist = req.body;

    console.log("Attempting to POST artist...");
    console.log(artist);
    console.log();

    if (validateArtist(artist).error) {
        console.log('Artist object is invalid.');
        console.log();
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object schema!');
    }

    const queries = [];

    queries.push(dbHelper.newQuery(`
        INSERT INTO caps.a_artist (
            ArtistId, ArtistName, ArtistWebsite,
            ArtistInstagram, ArtistReddit,
            ArtistGeekhack)
        VALUES (
            @id, @name, @website,
            @insta, @reddit,
            @geekhack
        );
    `, {
            id: artist.ArtistId,
            name: artist.ArtistName,
            website: artist.ArtistWebsite,
            insta: artist.ArtistInstagram,
            reddit: artist.ArtistReddit,
            geekhack: artist.ArtistGeekhack
        }
    ));

    if (artist.ImageUrl) {

        queries.push(dbHelper.newQuery(`
            INSERT INTO caps.a_image (ImageURL)
            VALUES (@url);
        `, { url: artist.ImageURL }));
    }

    console.log('Queries:');
    console.log(queries);
    console.log();

    dbHelper.queryDatabase(queries, true,
        (result) => {
            console.log('Results:');
            console.log(result);
            console.log();

            res.send(!result ? result : { postPk: result[0].insertId });
        },
        (err) => {
            console.log(err.message);
            console.log();
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        });
});

app.put('/api/artist/', (req, res) => {

    const artist = req.body;

    console.log(`Attempting to PUT artist with Pk ${artist.ArtistPk}...`);
    console.log(artist);
    console.log();

    if (validateArtist(artist).error) {
        console.log('Artist object is invalid.');
        console.log();
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object schema!');
    }

    const findQuery = dbHelper.newQuery(`
        SELECT * FROM caps.a_artist
        WHERE ArtistPk = @pk;
    `, { pk: artist.ArtistPk });

    const updateQuery = dbHelper.newQuery(`
        UPDATE caps.a_artist
        SET ArtistId = @id,
            ArtistName = @name,
            ArtistWebsite = @website,
            ArtistInstagram = @insta,
            ArtistReddit = @reddit,
            ArtistGeekhack = @geekhack
        WHERE ArtistPk = @pk;
    `, {
            pk: artist.ArtistPk,
            id: artist.ArtistId,
            name: artist.ArtistName,
            website: artist.ArtistWebsite,
            insta: artist.ArtistInstagram,
            reddit: artist.ArtistReddit,
            geekhack: artist.ArtistGeekhack
        }
    );

    dbHelper.queryDatabase(findQuery, false,
        (result) => {

            console.log(`Search Results: `);
            console.log(result);
            console.log();

            if (result[0].length > 0)
                dbHelper.queryDatabase(updateQuery, false,
                    (results) => {

                        console.log(`Update Results: `);
                        console.log(results);
                        console.log();

                        res.send('Successfully updated artist record!');

                    }, (err) => {
                        console.log(err.message);
                        return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
                    }
                );
            else {
                console.log(`Could not locate artist with Pk ${artist.ArtistPk} for update...`);
                console.log();

                return sendStatus(res, ApiCode.NOT_FOUND, 'Could not find artist record!');
            }
        },
        (err) => {
            console.log(err.message);
            console.log();
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        });
});

app.delete('/api/artist/:pk', (req, res) => {

    const pk = getParam(req, 'pk');

    if (validatePk(pk).error)
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid syntax!');

    console.log(`Attempting to DELETE artist with Pk ${pk}...`);
    console.log();

    const findQuery = dbHelper.newQuery(`
        SELECT * FROM caps.a_artist
        WHERE ArtistPk = @pk;
    `, { pk: pk });

    const updateQuery = dbHelper.newQuery(`
        DELETE FROM caps.a_artist
        WHERE ArtistPk = @pk;
    `, { pk: pk });

    dbHelper.queryDatabase(findQuery, false,
        (result) => {

            console.log(`Search Results: `);
            console.log(result);
            console.log();

            if (result[0].length > 0)
                dbHelper.queryDatabase(updateQuery, false,
                    (results) => {

                        console.log(`Delete Results: `);
                        console.log(results);
                        console.log();

                        res.send('Successfully updated artist record!');

                    }, (err) => {
                        console.log(err.message);
                        console.log();
                        return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
                    }
                );
            else {
                console.log(`Could not locate artist with Pk ${artist.ArtistPk} for delete...`);
                console.log();

                return sendStatus(res, ApiCode.NOT_FOUND, 'Could not find artist record!');
            }
        },
        (err) => {
            console.log(err.message);
            console.log();
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        });
});

// -------------------------------------------
// File upload

// See https://blog.bitsrc.io/uploading-files-and-images-with-vue-and-express-2018ca0eecd0

const multer = require('multer');

app.use((err,req,res,next)=>{
    if (err.code === "INCORRECT_FILETYPE") {
        return sendStatus(res, ApiCode.NOPE_FILE,'Invalid file type');
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return sendStatus(res, ApiCode.NOPE_FILE,'Invalid file size');
    }
});

const fileFilter = (req,file,cb) => {
    const allowedTypes = ['image/jpeg','image/jpg','image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error('Incorrect file');
        error.code = "INCORRECT_FILETYPE";
        return cb(error, false);
    }
    cb(null,true);
};

const upload = multer({
    dest: path.join(__dirname, '../client/public/upload'),
    fileFilter,
    limits: {
        fileSize: 500000 // 500KB
    }
});

app.post('/upload', upload.single('file'), (req,res)=>{
    res.json({file: req.file});
});