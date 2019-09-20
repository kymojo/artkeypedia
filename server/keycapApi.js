const connection = require('./dbConnection.js');
const Joi = require('joi');
const schema = require('../client/src/schema/keycap.js');

// ---------------------------------------------------

const ApiCode = {
    BAD_PARAM: 400, // Invalid request syntax
    NOT_LOGIN: 401, // Unauthorized: not logged in
    FORBIDDEN: 403, // Forbidden resource
    NOT_FOUND: 404, // Resource not found
    NOT_ALLOW: 405, // API call not allowed
    CONFLICTS: 409, // Conflicted resource state (e.g. already exists)
    NOPE_FILE: 422, // Unprocessable entity
    SRV_ERROR: 500, // Internal server error
};

function sendStatus(res, code, message) {
    quickLog([`HTTP STATUS ${code}`, message]);
    return res.status(code).send(message);
}

function quickLog(messages) {

    if (!Array.isArray(messages))
        messages = messages.split('\n');

    for (key in messages) {
        const submsg = messages[key];
        console.log(submsg);
    }

    console.log();
}

function getQueryLogString(queries, params) {

    let queryStrings = [];
    for (index in queries) {
        let query = queries[index];
        for (param in params)
            query = query.replace('@' + param, params[param]);
        queryStrings.push(query.split('\n'));
    }
    return queryStrings;
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

function getPassedValues(req) {
    let obj = {};
    Object.assign(obj, req.body);
    Object.assign(obj, req.params);
}

// ---------------------------------------------------

const keycapApi = {
    // -----------------------------------------------
    GET_all: function (req, res) {

        quickLog(`Server received ${req.method} request...`);

        quickLog('Preparing queries...');

        const select_caps = `
            SELECT
                k.KeycapPk,
                k.KeycapId,
                k.KeycapName,
                m.MakerPk,
                m.MakerName,
                i.ImagePk 
            FROM caps.a_keycap k
            LEFT JOIN caps.a_maker m ON k.MakerPk = m.MakerPk
            LEFT JOIN caps.a_image i ON k.ImagePk = i.ImagePk;
        `;

        quickLog(['Queries:', getQueryLogString([select_caps])]);

        connection.query(select_caps, {}, (err, result) => {
            if (err) {
                quickLog(['Database error:', err.message]);
                return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
            }

            quickLog(['Results:', result]);

            if (!result || !result[0] || result[0].length == 0)
                return sendStatus(res, ApiCode.NOT_FOUND, 'No records found!');

            res.send(result[0]);
            quickLog([`HTTP STATUS ${res.statusCode}`, "'Success'"]);
        });
    },
    // -----------------------------------------------
    GET: function (req, res) {

        const object = getPassedValues(req);

        quickLog([`Server received ${req.method} request...`, `Posted object: ${JSON.stringify(object)}`]);

        if (validateValues(schema[req.method], object).error) {
            quickLog('Object failed schema validation!');
            return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object structure!');
        }

        quickLog('Object successfully validated.');

        quickLog('Preparing queries...');

        const select_caps = `
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
        `;

        quickLog(['Queries:', getQueryLogString([select_caps])]);

        connection.query(select_caps, object, (err, result) => {
            if (err) {
                quickLog(['Database error:', err.message]);
                return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
            }

            quickLog(['Results:', result]);

            if (!result || !result[0] || result[0].length == 0)
                return sendStatus(res, ApiCode.NOT_FOUND, 'No records found!');

            res.send(result[0]);
            quickLog([`HTTP STATUS ${res.statusCode}`, "'Success'"]);
        });
    },
    // -----------------------------------------------
    POST: function (req, res) {

        const object = getPassedValues(req);

        quickLog([`Server received ${req.method} request...`, `Posted object: ${JSON.stringify(object)}`]);

        if (validateValues(schema[req.method], object).error) {
            quickLog('Object failed schema validation!');
            return sendStatus(res, ApiCode.BAD_PARAM, 'Invalid object structure!');
        }

        quickLog('Object successfully validated.');

        quickLog('Preparing queries...');

        const query_insert_image = `
            INSERT INTO caps.a_image (ImageURL)
            VALUES (@ImageURL);
        `;

        const query_get_image_pk = `
            SELECT MAX(ImagePk) ImagePk
            FROM caps.a_image;
        `;

        const query_insert_caps = `
            INSERT INTO caps.a_maker (
                MakerId, MakerName, MakerWebsite,
                MakerInstagram, MakerReddit,
                MakerGeekhack, ImagePk)
            VALUES (
                @MakerId, @MakerName, @MakerWebsite,
                @MakerInstagram, @MakerReddit,
                @MakerGeekhack, @imgPk
            );
        `;

        const queries = [];
        if (object['ImageURL'])
            queries.push(query_insert_image, query_get_image_pk);
        queries.push(query_insert_caps);

        if (object['ImageUrl']) {

            connection.beginTransaction((err) => {
                if (err) {
                    quickLog(['Database error:', err.message]);
                    return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
                }

                connection.query(query_insert_image, object, (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            quickLog(['Database error:', err.message]);
                            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
                        });
                    }

                    connection.query(query_get_image_pk, object, (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                quickLog(['Database error:', err.message]);
                                return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
                            });
                        }

                        const imagePk = result[0]['ImagePk'];
                        object['ImagePk'] = imagePk;

                        connection.query(query_insert_caps, object, (err, result) => {
                            if (err) {
                                return connection.rollback(() => {
                                    quickLog(['Database error:', err.message]);
                                    return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
                                });
                            }

                            connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        quickLog(['Database error:', err.message]);
                                        return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
                                    });
                                }

                                quickLog('Transaction Complete.');

                                quickLog(['Results:', result]);

                                res.send({ result: result, postPk: result[0].insertId });

                                quickLog([`HTTP STATUS ${res.statusCode}`, "'Success"]);
                            });
                        });
                    });
                });
            });

        } else {

            connection.query(query_insert_caps, object, (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        quickLog(['Database error:', err.message]);
                        return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
                    });
                }

                quickLog(['Results:', result]);

                res.send({ result: result, postPk: result[0].insertId });

                quickLog([`HTTP STATUS ${res.statusCode}`, "'Success"]);
            });
        }
    },
    // -----------------------------------------------
    PUT: function (req, res) {

        

    },
    // -----------------------------------------------
    DELETE: function (req, res) {

    },
};
module.exports = keycapApi;