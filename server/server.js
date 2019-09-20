
// =========================================
// Require modules
// -----------------------------------------
const path = require('path');
const express = require('express');
const history = require('connect-history-api-fallback-exclusions');
const cors = require('cors');

// =========================================
// Set up express app
// -----------------------------------------
const app = express();
app.use(express.json()); // allow JSON parsing
app.use(history({
    exclusions: [
        '/api/*',
        '/image/*'
    ]
}));
app.use(cors()); // for file uploading

// =========================================
// Launch Server
// -----------------------------------------

// Set port using PORT environment variable
// (eg. using command: set PORT=1337)
// if not set, default to port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log();
    console.log('Server successfully launched!');
    console.log(`Listening on port ${port}...`);
    console.log();
});

// =========================================
// Establish MySQL db connection
// -----------------------------------------

require('./dbConnection');

// =========================================
// Use public folder
// -----------------------------------------

app.use(express.static(path.join(__dirname, '../client/public')));

// =========================================
// API
// -----------------------------------------

// Check this: http://stayregular.net/blog/make-a-nodejs-api-with-mysql
// And this: https://stackoverflow.com/a/37385963

const Joi = require('joi');
const dbHelper = require('./dbHelper.js');

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
    console.log('HTTP STATUS ' + code);
    console.log("'" + message + "'");
    console.log();
    return res.status(code).send(message);
}

function validateValues(schema, values) {
    let valid;
    for (index in schema) {
        const obj = schema[index];
        valid = Joi.validate(values[obj.name], obj.joiType);
        if (valid.error)
            break;
    }
    return valid;
}

function processGetRequest(req, res, schema, queries) {

    console.log("Server received GET request...");
    console.log('Parameters: ' + JSON.stringify(req.params));
    console.log();

    if (validateValues(schema, req.params).error) {
        console.log('Invalid GET param(s)!');
        console.log();
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid syntax!');
    }

    console.log('Parameters successfully validated.');
    console.log();

    console.log('Preparing queries...');
    console.log();

    const queriesArray = [];
    for (index in queries)
        queriesArray.push(dbHelper.newQuery(queries[index], req.params));

    console.log('Queries:');
    console.log(dbHelper.getQueryLogString(queriesArray));
    console.log();

    dbHelper.queryDatabase(queriesArray, false,
        (result) => {
            console.log('Results:');
            console.log(result);
            console.log();

            const rows = result ? result[0] : [];

            if (rows.length == 0) {
                return sendStatus(res, ApiCode.NOT_FOUND, `No records found!`);
            }

            res.send(rows);
            console.log('HTTP STATUS ' + res.statusCode);
            console.log("'Success'");
            console.log();
        },
        (err) => {
            console.log(err.message);
            console.log();
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        }
    );
}

function processPostRequest(req, res, schema, queries) {

    console.log("Server received POST request...");
    console.log('Posted object: ' + JSON.stringify(req.body));
    console.log();

    if (validateValues(schema, req.body).error) {
        console.log('Object failed schema validation!');
        console.log();
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object structure!');
    }

    console.log('Object successfully validated.');
    console.log();

    console.log('Preparing queries...');
    console.log();

    const queriesArray = [];
    for (index in queries)
        queriesArray.push(dbHelper.newQuery(queries[index], req.params));

    console.log('Queries:');
    console.log(dbHelper.getQueryLogString(queriesArray));
    console.log();

    dbHelper.queryDatabase(queriesArray, true,
        (result) => {
            console.log('Results:');
            console.log(result);
            console.log();

            res.send(!result ? result : { postPk: result[0].insertId });

            console.log('HTTP STATUS ' + res.statusCode);
            console.log("'Success'");
            console.log();
        },
        (err) => {
            console.log(err.message);
            console.log();
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        }
    );
}

function processPutRequest(req, res, schema, findQuery, updateQueries) {

    console.log("Server received PUT request...");
    console.log('Received object: ' + JSON.stringify(req.body));
    console.log();

    if (validateValues(schema, req.body).error) {
        console.log('Object failed schema validation!');
        console.log();
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object structure!');
    }

    console.log('Object successfully validated.');
    console.log();

    console.log('Preparing queries...');
    console.log();

    const findQueryObj = dbHelper.newQuery(findQuery, req.params);

    const queries = [];
    for (index in updateQueries)
        queries.push(dbHelper.newQuery(updateQueries[index], req.params));

    console.log('Search Query:');
    console.log(dbHelper.getQueryLogString(findQueryObj));
    console.log();

    console.log('Update Queries:');
    console.log(dbHelper.getQueryLogString(updateQueries));
    console.log();

    dbHelper.queryDatabase(findQueryObj, false,
        (result) => {

            console.log(`Search Results: `);
            console.log(result);
            console.log();

            if (result[0].length > 0)
                dbHelper.queryDatabase(queries, true,
                    (results) => {

                        console.log(`Update Results: `);
                        console.log(results);
                        console.log();

                        let successMsg = 'Successfully updated the record!';
                        res.send(successMsg);
                        console.log(successMsg);
                        console.log();

                        console.log('HTTP STATUS ' + res.statusCode);
                        console.log("'Success'");
                        console.log();
                    }, (err) => {
                        console.log(err.message);
                        return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
                    }
                );
            else {
                console.log(`Could not locate record for updating.`);
                console.log();

                return sendStatus(res, ApiCode.NOT_FOUND, 'Record could not be found!');
            }
        },
        (err) => {
            console.log(err.message);
            console.log();
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        });
}

function processDeleteRequest(req, res, schema, findQuery, deleteQueries) {

    console.log("Server received DELETE request...");
    console.log('Parameters: ' + JSON.stringify(req.params));
    console.log();

    if (validateValues(schema, req.params).error) {
        console.log('Object failed schema validation!');
        console.log();
        return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object structure!');
    }

    console.log('Object successfully validated.');
    console.log();

    console.log('Preparing queries...');
    console.log();

    const findQueryObj = dbHelper.newQuery(findQuery, req.params);

    const queries = [];
    for (index in deleteQueries)
        queries.push(dbHelper.newQuery(queries[index], req.params));

    console.log('Search Query:');
    console.log(dbHelper.getQueryLogString(findQueryObj));
    console.log();

    console.log('Delete Queries:');
    console.log(dbHelper.getQueryLogString(queries));
    console.log();

    dbHelper.queryDatabase(findQueryObj, false,
        (result) => {

            console.log(`Search Results: `);
            console.log(result);
            console.log();

            if (result[0].length > 0)
                dbHelper.queryDatabase(queriesArray, true,
                    (results) => {

                        console.log(`Delete Results: `);
                        console.log(results);
                        console.log();

                        let successMsg = 'Successfully deleted the record!';
                        res.send(successMsg);
                        console.log(successMsg);
                        console.log();

                        console.log('HTTP STATUS ' + res.statusCode);
                        console.log("'Success'");
                        console.log();
                    }, (err) => {
                        console.log(err.message);
                        return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
                    }
                );
            else {
                console.log(`Could not locate record for deleting.`);
                console.log();

                return sendStatus(res, ApiCode.NOT_FOUND, 'Record could not be found!');
            }
        },
        (err) => {
            console.log(err.message);
            console.log();
            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
        });
}

// -------------------------------------------
// GET

const keycapApi = require('./keycapApi.js');
app.get('/api/dooky', keycapApi.get);

const KeycapSchema = require('../client/src/schema/keycap.js');

app.get('/api/keycap/:KeycapPk', (req, res) => {

    const queries = [];
    queries.push(`
        SELECT
            k.KeycapPk,
            k.KeycapId,
            k.KeycapName,
            m.MakerPk,
            m.MakerName,
            i.ImagePk 
        FROM caps.a_keycap k
        LEFT JOIN caps.a_maker m ON k.MakerPk = m.MakerPk
        LEFT JOIN caps.a_image i ON k.ImagePk = i.ImagePk
        WHERE k.KeycapPk = @KeycapPk;
    `);
    processGetRequest(req, res, KeycapSchema.GET, queries);
});

function validateParams(req, schema) {

    let obj = {};
    Object.assign(obj, req.body);
    Object.assign(obj, req.params);

    console.log('Server received HTTP ' + req.method + ' request...');
    console.log('Posted value(s): ' + JSON.stringify(obj));
    console.log();

    if (validateValues(schema, obj).error) {
        console.log('Value(s) failed schema validation!');
        console.log();
        return { error: sendStatus(res, ApiCode.BAD_PARAM, 'Invalid request syntax!') };
    }

    console.log('Value(s) successfully validated.');
    console.log();
    return { params: obj };
}

function returnResultRows(res, result) {
    console.log('Results:');
    console.log(result.rows);
    console.log();

    res.send(result.rows);

    console.log('HTTP STATUS ' + res.statusCode);
    console.log("'Success'");
    console.log();
}

function returnErrorStatus(res, err) {
    console.log(err.message);
    console.log();
    return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred.');
}

const Helper = require('./dbHelper_new.js');
app.get('/api/keycap/:KeycapPk/:Foo', (req, res) => {

    const valid = validateParams(req, KeycapSchema.GET);
    if (valid.error) return valid.error;

    Helper.runQueries(null, true, (conn) => {

        let result = Helper.newQuery(conn, `
            SELECT
                k.KeycapPk,
                k.KeycapId,
                k.KeycapName,
                m.MakerPk,
                m.MakerName,
                i.ImagePk 
            FROM caps.a_keycap k
            LEFT JOIN caps.a_maker m ON k.MakerPk = m.MakerPk
            LEFT JOIN caps.a_image i ON k.ImagePk = i.ImagePk
            WHERE k.KeycapPk = @KeycapPk;
        `).run(valid.params);

        return returnResultRows(res, result);

    }, (err) => {
        return returnErrorStatus(res, err);
    });

    // queries.push(`
    //     SELECT
    //         k.KeycapPk,
    //         k.KeycapId,
    //         k.KeycapName,
    //         m.MakerPk,
    //         m.MakerName,
    //         i.ImagePk 
    //     FROM caps.a_keycap k
    //     LEFT JOIN caps.a_maker m ON k.MakerPk = m.MakerPk
    //     LEFT JOIN caps.a_image i ON k.ImagePk = i.ImagePk
    //     WHERE k.KeycapPk = @KeycapPk;
    // `);
    // processGetRequest(req, res, KeycapSchema.GET, queries);
});



const MakerSchema = require('../client/src/schema/maker.js');

app.get('/api/maker/:MakerPk', (req, res) => {

    const queries = [];
    queries.push(`
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
        WHERE a.MakerPk = @MakerPk;
    `);
    processGetRequest(req, res, MakerSchema.GET, queries);
});

app.post('/api/maker/', (req, res) => {

    let queries = [];
    queries.push(`
        SET @imgPk = NULL;

        IF (@ImageURL IS NOT NULL)
        BEGIN
            INSERT INTO caps.a_image (ImageURL)
            VALUES (@ImageURL);

            SET @imgPk = (SELECT MAX(ImagePk) FROM caps.a_image);
        END

        INSERT INTO caps.a_maker (
            MakerId, MakerName, MakerWebsite,
            MakerInstagram, MakerReddit,
            MakerGeekhack, ImagePk)
        VALUES (
            @MakerId, @MakerName, @MakerWebsite,
            @MakerInstagram, @MakerReddit,
            @MakerGeekhack, @imgPk
        );
    `);
    processPostRequest(req, res, MakerSchema.POST, queries);
});

app.put('/api/maker/', (req, res) => {

    const findQuery = `
        SELECT * FROM caps.a_maker
        WHERE MakerPk = @MakerPk;
    `;
    const updateQuery = `
        UPDATE caps.a_maker
        SET MakerId = @MakerId,
            MakerName = @MakerName,
            MakerWebsite = @MakerWebsite,
            MakerInstagram = @MakerInstagram,
            MakerReddit = @MakerReddit,
            MakerGeekhack = @MakerGeekhack
        WHERE MakerPk = @MakerPk;
    `;
    processPutRequest(req, res, MakerSchema.PUT, findQuery, updateQuery);
});

app.delete('/api/maker/:MakerPk', (req, res) => {

    const findQuery = `
        SELECT * FROM caps.a_maker
        WHERE MakerPk = @MakerPk;
    `;

    const updateQuery = `
        DELETE FROM caps.a_maker
        WHERE MakerPk = @MakerPk;
    `;
    processDeleteRequest(req, res, MakerSchema.DELETE, findQuery, deleteQuery);
});

// -------------------------------------------
// File upload

// See https://blog.bitsrc.io/uploading-files-and-images-with-vue-and-express-2018ca0eecd0

const multer = require('multer');

app.use((err, req, res, next) => {
    if (err.code === "INCORRECT_FILETYPE") {
        return sendStatus(res, ApiCode.NOPE_FILE, 'Invalid file type');
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return sendStatus(res, ApiCode.NOPE_FILE, 'Invalid file size');
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error('Incorrect file');
        error.code = "INCORRECT_FILETYPE";
        return cb(error, false);
    }
    cb(null, true);
};

const upload = multer({
    dest: path.join(__dirname, '../client/public/upload'),
    fileFilter,
    limits: {
        fileSize: 500000 // 500KB
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ file: req.file });
});