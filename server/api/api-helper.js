const Joi = require('joi');
const connection = require('../dbConnection.js');

function isEmptyObject(obj) {
    return (Object.keys(obj).length === 0 && obj.constructor === Object);
}

const apiHelper = {

    ApiCode: {
        BAD_PARAM: 400, // Invalid request syntax
        NOT_LOGIN: 401, // Unauthorized: not logged in
        FORBIDDEN: 403, // Forbidden resource
        NOT_FOUND: 404, // Resource not found
        NOT_ALLOW: 405, // API call not allowed
        CONFLICTS: 409, // Conflicted resource state (e.g. already exists)
        NOPE_FILE: 422, // Unprocessable entity
        SRV_ERROR: 500, // Internal server error
    },

    /**
     * Print HTTP status message to console.
     * Returns result of res.status(code).send(message)
     * @param {*} res resource
     * @param {*} code status code
     * @param {*} message status message
     */
    sendStatus: function (res, code, message) {
        this.quickLog([`HTTP STATUS ${code}`, message]);
        return res.status(code).send(message);
    },

    /**
     * Print a message or array of messages to the console.
     * This splits a single string on '\n' characters, or prints each string in a passed array.
     * Finally, a blank line is also printed to the console to keep log entries spaced out.
     * @param {*} messages string or array
     */
    quickLog: function (messages) {

        if (!Array.isArray(messages))
            messages = messages.split('\n');

        for (key in messages) {
            const submsg = messages[key];
            console.log(submsg);
        }

        console.log();
    },

    /**
     * Formats an array of queries into an array of strings for prettier logging.
     * This also takes into consideration parameters and does string substitution
     * on each @variable that matches a property in params, replacing it with the
     * appropriate value. Note: the param object can have more properties than are
     * used by the queries.
     * @param {*} queries array of query strings 
     * @param {*} params object with param properties
     */
    getQueryLogString: function (queries, params) {

        let queryStrings = [];
        for (index in queries) {
            let query = queries[index];
            for (param in params)
                query = query.replace('@' + param, params[param]);
            queryStrings.push(query.split('\n'));
        }
        return queryStrings;
    },

    /**
     * 
     * @param {*} schema 
     * @param {*} values 
     */
    validateValues: function (schema, values) {
        let valid = true;
        for (index in schema) {
            const obj = schema[index];
            valid = Joi.validate(values[obj.name], obj.joiType);
            if (valid.error)
                break;
        }
        return valid;
    },

    getPassedValues: function (req) {
        let obj = {};
        Object.assign(obj, req.body);
        Object.assign(obj, req.params);
        return obj;
    },

    //##########################################################

    runApiWrapper: function (req, res, schema, next) {

        const params = this.getPassedValues(req);

        const msgAra = [`Server received ${req.method} request...`];
        if (!isEmptyObject(params)) msgAra.push(`Posted object: ${JSON.stringify(params)}`);
        this.quickLog(msgAra);

        if (this.validateValues(schema, params).error) {
            this.quickLog('Object failed schema validation!');
            return this.sendStatus(res, this.ApiCode.BAD_PARAM, 'Invalid object structure!');
        }

        this.quickLog('Object successfully validated.');

        this.quickLog('Preparing queries...');

        const api = {
            req: req,
            res: res,
            schema: schema,
            params: params,
            transaction: null
        };

        next(api);
    },

    runApiQuery: function (query, api, next) {

        this.quickLog(['Query:', this.getQueryLogString([query], api.params)]);

        connection.query(query, api.params, (err, result) => {

            if (err) return this.runApiDbError(api, err);

            next(api, result);
        });

    },

    runApiTransaction: function (api, next) {

        api.transaction = true;

        connection.beginTransaction((err) => {

            if (err) return this.runApiDbError(api, err);

            next(api);
        });
    },

    runApiDbError: function (api, err) {

        if (api.transaction)
            return this.runApiDbErrorTransaction(api, err);

        this.quickLog(['Database error:', err.message]);

        return this.sendStatus(api.res, this.ApiCode.SRV_ERROR, 'An error occurred!');
    },

    runApiDbErrorTransaction: function () {

        return connection.rollback(() => {

            api.transaction = null;
            return this.runApiDbError(api, err);
        });
    },

    runApiReturn: function (api, result, toClient) {

        if (api.transaction) {

            return connection.commit((err) => {

                if (err) return this.runApiDbError(api, err);
                
                console.log('Transaction Complete.');
                api.transaction = null;
                this.runApiReturn(api,result,toClient);
            });
        }

        this.quickLog(['Results:', result]);

        api.res.send(toClient);
        this.quickLog(['Returned:',toClient]);

        this.quickLog([`HTTP STATUS ${api.res.statusCode}`, 'Success']);
    },

    runApiReturnResult: function (api, result) {

        this.runApiReturn(api, result, result);
    },

    runApiReturnRows: function (api, result) {

        this.runApiReturn(api, result, result[0]);
    },
};
module.exports = apiHelper;