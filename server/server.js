
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

const MakerTable = {

    schema: {
        MakerPk: /*        */ JoiCustom.PK,
        MakerId: /*        */ JoiCustom.ID,
        MakerName: /*      */ JoiCustom.Text,
        MakerWebsite: /*   */ JoiCustom.Text.allow(null),
        MakerInstagram: /* */ JoiCustom.Text.allow(null),
        MakerReddit: /*    */ JoiCustom.Text.allow(null),
        MakerGeekhack: /*  */ JoiCustom.Text.allow(null),
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

function validateMaker(maker) {
    return validateObject(maker, MakerTable.schema);
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

app.get('/api/maker/:pk', (req, res) => {

    const pk = getParam(req, 'pk');

    console.log(`Attempting to GET maker with Pk ${pk}...`);
    console.log();

    if (validatePk(pk).error) {
        console.log('Invalid GET param.');
        console.log();
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid syntax!');
    }

    const queries = [];

    queries.push(dbHelper.newQuery(`
            SELECT
                a.MakerPk,
                a.MakerId,
                a.MakerName, 
                a.MakerWebsite,
                a.MakerInstagram,
                a.MakerReddit,
                a.MakerGeekhack,
                i.ImagePk,
                i.ImageURL
            FROM caps.a_maker a
            LEFT JOIN caps.a_image i
                ON a.ImagePk = i.ImagePk
            WHERE a.MakerPk = @pk;
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
                return sendStatus(res, ApiCode.NOT_FOUND, `Could not find maker record!`);
            }

            res.send(rows);
        },
        (err) => {
            console.log(err.message);
            console.log();
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        });
});

app.post('/api/maker/', (req, res) => {

    const maker = req.body;

    console.log("Attempting to POST maker...");
    console.log(maker);
    console.log();

    if (validateMaker(maker).error) {
        console.log('Maker object is invalid.');
        console.log();
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object schema!');
    }

    const queries = [];

    queries.push(dbHelper.newQuery(`
        INSERT INTO caps.a_maker (
            MakerId, MakerName, MakerWebsite,
            MakerInstagram, MakerReddit,
            MakerGeekhack)
        VALUES (
            @id, @name, @website,
            @insta, @reddit,
            @geekhack
        );
    `, {
            id: maker.MakerId,
            name: maker.MakerName,
            website: maker.MakerWebsite,
            insta: maker.MakerInstagram,
            reddit: maker.MakerReddit,
            geekhack: maker.MakerGeekhack
        }
    ));

    if (maker.ImageUrl) {

        queries.push(dbHelper.newQuery(`
            INSERT INTO caps.a_image (ImageURL)
            VALUES (@url);
        `, { url: maker.ImageURL }));
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

app.put('/api/maker/', (req, res) => {

    const maker = req.body;

    console.log(`Attempting to PUT maker with Pk ${maker.MakerPk}...`);
    console.log(maker);
    console.log();

    if (validateMaker(maker).error) {
        console.log('Maker object is invalid.');
        console.log();
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object schema!');
    }

    const findQuery = dbHelper.newQuery(`
        SELECT * FROM caps.a_maker
        WHERE MakerPk = @pk;
    `, { pk: maker.MakerPk });

    const updateQuery = dbHelper.newQuery(`
        UPDATE caps.a_maker
        SET MakerId = @id,
            MakerName = @name,
            MakerWebsite = @website,
            MakerInstagram = @insta,
            MakerReddit = @reddit,
            MakerGeekhack = @geekhack
        WHERE MakerPk = @pk;
    `, {
            pk: maker.MakerPk,
            id: maker.MakerId,
            name: maker.MakerName,
            website: maker.MakerWebsite,
            insta: maker.MakerInstagram,
            reddit: maker.MakerReddit,
            geekhack: maker.MakerGeekhack
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

                        res.send('Successfully updated maker record!');

                    }, (err) => {
                        console.log(err.message);
                        return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
                    }
                );
            else {
                console.log(`Could not locate maker with Pk ${maker.MakerPk} for update...`);
                console.log();

                return sendStatus(res, ApiCode.NOT_FOUND, 'Could not find maker record!');
            }
        },
        (err) => {
            console.log(err.message);
            console.log();
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        });
});

app.delete('/api/maker/:pk', (req, res) => {

    const pk = getParam(req, 'pk');

    if (validatePk(pk).error)
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid syntax!');

    console.log(`Attempting to DELETE maker with Pk ${pk}...`);
    console.log();

    const findQuery = dbHelper.newQuery(`
        SELECT * FROM caps.a_maker
        WHERE MakerPk = @pk;
    `, { pk: pk });

    const updateQuery = dbHelper.newQuery(`
        DELETE FROM caps.a_maker
        WHERE MakerPk = @pk;
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

                        res.send('Successfully updated maker record!');

                    }, (err) => {
                        console.log(err.message);
                        console.log();
                        return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
                    }
                );
            else {
                console.log(`Could not locate maker with Pk ${maker.MakerPk} for delete...`);
                console.log();

                return sendStatus(res, ApiCode.NOT_FOUND, 'Could not find maker record!');
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