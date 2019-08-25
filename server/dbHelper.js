const mysql = require('mysql');

const dbHelper = {

    /** Create a new MySQL connection using credentials.
     * @access private
     * @returns {Object} connection object
    */
    getDbConnection: function () {
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'caps'
        });

        this.addCustomQueryFormatConfig(connection);

        return connection;
    },

    /**
     * Add a custom query format to the connection so that ":arg" params will be replaced.
     * @param {Object} connection - current database connection object 
     */
    addCustomQueryFormatConfig: function(connection) {
        connection.config.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
                if (values.hasOwnProperty(key)) {
                    return this.escape(values[key]);
                }
                return txt;
            }.bind(this));
        };
    },

    /** Create a new query object
     * @param {string} queryString - query string with :arg style parameters
     * @param {Object} queryParams - query parameters object, each field corresponding with a :arg tag in the query string
    */
    newQuery: function (queryString, queryParams) {
        return { query: queryString, params: queryParams };
    },

    /** Query the database
     * @param {Object[]} queries - array of queries
     * @param {boolean} useTransaction - true: use transactions
     * @param {function} onSuccess - function to use if query succeeds : (Object[] results)
     * @param {function} onFailure - function to use if query fails : (Object err)
    */
    queryDatabase: function (queries, useTransaction, onSuccess, onFailure) {

        console.log('--------------------------------------------');
        console.log('queryDatabase, queries: ' + queries);

        const connection = this.setConnection();
        try {
            if (useTransaction)
                this.dbTransactionBegin(connection, queries, onSuccess);
            else
                this.dbQueries(connection, queries, false, onSuccess);
        } catch (err) {
            onFailure(err);
        }
    },

    /**
     * Attempt to connect to the database
     * @returns {Object} - connection object; null if failed to connect
     */
    setConnection: function () {
        const connection = this.getDbConnection();
        connection.connect((err) => {
            if (err) {
                console.error('Failed to connect to database');
                return;
            }
            console.log('Connected as id: ' + connection.threadId);
        });
        return connection;
    },

    /** Begin a transaction and call the passed queries
     * @param {Object} connection - current database connection object 
     * @param {Object[]} queries - array of queries to use : {query: String, params: {args}}
     * @param {function} onSuccess - function to use if query succeeds : (Object[] results)
     */
    dbTransactionBegin: function (connection, queries, onSuccess) {

        console.log('--------------------------------------------');
        console.log('dbTransactionBegin, queries: ' + queries);

        connection.beginTransaction((err) => {
            if (err) { throw err; }
            this.dbQueries(connection, queries, true, onSuccess);
        });
    },

    /** Run one or more queries recursively
     * @param {Object} connection - current database connection object 
     * @param {Object[]} queries - array of queries to use : {query: String, params: {args}}
     * @param {boolean} useTransaction - true: use transactions
     * @param {function} onSuccess - function to use if query succeeds : (Object[] results)
     * @param {Object[]} queryResults - results of previous queries in this recursive query run
     */
    dbQueries: function (connection, queries, useTransaction, onSuccess, queryResults) {

        console.log('--------------------------------------------');
        console.log('dbQueries, queries: ' + queries);

        if (!queryResults) queryResults = [];

        // Get query (as string or array of strings)
        const isArray = Array.isArray(queries);
        const query = (isArray ? queries[0] : queries);
        const nextQueries = (isArray ? queries.slice(1) : null);

        connection.query(query['query'], query['params'], (err, result) => {
            // On error, rollback and/or throw error
            if (err) {
                if (useTransaction) connection.rollback(() => { throw err; });
                else throw err;
            }

            // If no error, add results to array
            queryResults.push(result);

            // Recurse if more queries to execute
            if (nextQueries && nextQueries.length > 0)
                this.dbQueries(connection, nextQueries, useTransaction, onSuccess, queryResults);
            else { // If last query, commit and succeed
                if (useTransaction) this.dbTransactionCommit(connection);
                onSuccess(queryResults);
            }
        });
    },

    /** Commit the current transaction
     * @param {Object} connection - current database connection object 
    */
    dbTransactionCommit: function (connection) {
        connection.commit((err) => {
            if (err) { connection.rollback(() => { throw err; }); }
            console.log('Transaction Complete.');
            connection.end();
        });
    },

}
module.exports = dbHelper;