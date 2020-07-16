const mysql = require('mysql');

var pool = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ejvh.251127',
    port: 3306,
    database: 'villatrackingdb',
    multipleStatements: true
});

pool.connect();
handleDisconnect(pool);


function handleDisconnect(client) {
    client.on('error', function(error){
        if (!error.fatal) return;
        if (error.code !== 'PROTOCOL_CONNECTION_LOST') throw error;

        console.log('> Reconnecting MySQL: ' + error.stack);

        let mysqlClient = mysql.createConnection(pool.config);
        handleDisconnect(mysqlClient);
        mysqlClient.connect();
    })
}

module.exports = function () {
    return pool;
}