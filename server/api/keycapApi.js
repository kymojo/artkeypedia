const connection = require('../dbConnection.js');
const schema = require('../../client/src/schema/keycap.js');
const ApiHelper = require('./api-helper.js');

// ---------------------------------------------------

ApiCode = {
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
    let valid = true;
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
            quickLog([`HTTP STATUS ${res.statusCode}`, 'Success']);
        });
    },
    // -----------------------------------------------
    GET_all_helper: function (req, res) {

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

        ApiHelper.runApiWrapper(req, res, {}, (api) => {

            ApiHelper.runApiQuery(select_caps, api, (api, result) => {

                ApiHelper.runApiReturnRows(api, result);
            });
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

        quickLog(['Queries:', getQueryLogString([select_caps], object)]);

        connection.query(select_caps, object, (err, result) => {
            if (err) {
                quickLog(['Database error:', err.message]);
                return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
            }

            quickLog(['Results:', result]);

            if (!result || !result[0] || result[0].length == 0)
                return sendStatus(res, ApiCode.NOT_FOUND, 'No records found!');

            res.send(result[0]);
            quickLog([`HTTP STATUS ${res.statusCode}`, 'Success']);
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
            INSERT INTO caps.a_image (ImageUrl)
            VALUES (@ImageUrl);
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

        if (object['ImageUrl']) {

            connection.beginTransaction((err) => {
                if (err) {
                    quickLog(['Database error:', err.message]);
                    return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
                }

                quickLog(['Query:', getQueryLogString([query_insert_image], object)]);

                connection.query(query_insert_image, object, (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            quickLog(['Database error:', err.message]);
                            return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
                        });
                    }

                    quickLog(['Query:', getQueryLogString([query_get_image_pk], object)]);

                    connection.query(query_get_image_pk, object, (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                quickLog(['Database error:', err.message]);
                                return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
                            });
                        }

                        const imagePk = result[0]['ImagePk'];
                        object['ImagePk'] = imagePk;

                        quickLog(['Query:', getQueryLogString([query_insert_caps], object)]);

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

                                quickLog([`HTTP STATUS ${res.statusCode}`, 'Success']);
                            });
                        });
                    });
                });
            });

        } else {

            quickLog(['Query:', getQueryLogString([query_insert_caps], object)]);

            connection.query(query_insert_caps, object, (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        quickLog(['Database error:', err.message]);
                        return sendStatus(res, ApiCode.SRV_ERROR, 'An error occurred!');
                    });
                }

                quickLog(['Results:', result]);

                res.send({ result: result, postPk: result[0].insertId });

                quickLog([`HTTP STATUS ${res.statusCode}`, 'Success']);
            });
        }
    },
    // -----------------------------------------------
    POST_helper: function (req, res) {

        const INSERT_IMAGE = `
            INSERT INTO caps.a_image (ImageUrl)
            VALUES (@ImageUrl);
        `;

        const GET_IMAGE_PK = `
            SELECT MAX(ImagePk) ImagePk
            FROM caps.a_image;
        `;

        const INSERT_KEYCAP = `
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

        ApiHelper.runApiWrapper(req, res, schema.POST, (api) => {

            if (api.params['ImageUrl']) {

                ApiHelper.runApiTransaction(api, (api) => {

                    ApiHelper.runApiQuery(INSERT_IMAGE, api, (api, result) => {

                        ApiHelper.runApiQuery(GET_IMAGE_PK, api, (api, result) => {

                            api.params['ImagePk'] = result[0]['ImagePk'];

                            ApiHelper.runApiQuery(INSERT_KEYCAP, api, (api, result) => {

                                ApiHelper.runApiReturnNewPk(api, result);
                            });
                        });
                    });
                });

            } else {
                ApiHelper.runApiQuery(INSERT_KEYCAP, api, (api, result) => {

                    ApiHelper.runApiReturnNewPk(api, result);
                });
            }
        });
    },
    // -----------------------------------------------
    PUT: function (req, res) {

        // By the way, look into joi-browser: https://github.com/jeffbski/joi-browser
        // Or some other solution for client joi: https://github.com/hapijs/joi/issues/154
        
    },
    // -----------------------------------------------
    DELETE: function (req, res) {

    },
};
module.exports = keycapApi;