const mysql = require('mysql');


function Query(conn, query, parameters) {

    this.conn = conn;
    this.query = query;
    this.parameters = parameters || {};

    this.run = async function (params) {
        if (params) this.parameters = params;
        let results;
        await conn.query(this.query, this.parameters, (err, result) => {
            if (err) { throw err; }
            results = new QueryResult(result);
        });
        return results;
    };

    this.params = function(parameters) {
        this.parameters = parameters
    }
}

function QueryResult(result) {
    this.affectedRows = result.affectedRows;
    this.warningCount = result.warningCount;
    this.message = result.message;
    this.insertId = result.insertId;

    this.rows = [];
    for(row in result)
        this.rows.push(result[row]);
}

const dbHelper = {

    getDbConnection: function () {
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'caps'
        });

        connection.config.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/@(\w+)/g, function (txt, key) {
                if (values.hasOwnProperty(key)) {
                    return this.escape(values[key]);
                }
                return txt;
            }.bind(this));
        };

        return connection;
    },

    setConnection: function () {
        const connection = this.getDbConnection();
        connection.connect((err) => {
            if (err) {
                console.error('Failed to connect to database');
                return;
            }
            console.log('Db connection id:' + connection.threadId + ' successfully established!');
            console.log();
        });
        return connection;
    },

    runQueries: async function (conn, useTransaction, fn, onError) {

        // conn = conn || this.setConnection();
        // if (!conn) return;

        // try {

        //     if (useTransaction) {
        //         await conn.beginTransaction((err) => {
        //             if (err) { throw err; }
        //             await fn(conn);
        //         });
        //         await conn.commit((err) => {
        //             if (err) { conn.rollback(() => { throw err; }); }
        //             console.log('Transaction Complete.');
        //             conn.end();
        //         });

        //     } else { await fn(conn); }

        // } catch (err) {
        //     onError(err);
        // }
    },

    newQuery: function (conn, query, params) {
        return new Query(conn, query, params);
    }
};
module.exports = dbHelper;