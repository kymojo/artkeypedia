const mysql = require('mysql');

var dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'caps'
};

let connection = null;
establishDbConnection();

// Source: https://stackoverflow.com/questions/37385833/node-js-mysql-database-disconnect/37385963#37385963
function establishDbConnection() {

    connection = mysql.createConnection(dbConfig);  // Recreate the connection, since the old one cannot be reused.
    connection.connect(function onConnect(err) {    // The server is either down
        if (err) {                                  // or restarting (takes a while sometimes).
            console.log('Failed to connect to the database!');
            console.log(err);
            console.log();
            setTimeout(establishDbConnection, 10000);   // We introduce a delay before attempting to reconnect,
        }                                               // to avoid a hot loop, and to allow our node script to
        console.log('Db connection id '                 // process asynchronous requests in the meantime.
            + connection.threadId
            + ' successfully established!');
        console.log();
    });

    // TODO: If you're also serving http, display a 503 error.
    connection.on('error', function onError(err) {
        console.log('A database error occurred');
        console.log(err);
        console.log();
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {       // Connection to the MySQL server is usually
            console.log('Connection to database ended.');   // lost due to either server restart, or a
            establishDbConnection();                        // connnection idle timeout (the wait_timeout     
        } else {                                            // server variable configures this)
            throw err;                                  
        }
    });
}

module.exports = connection;