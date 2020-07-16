const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);
const dgram = require('dgram');
const udpserver = dgram.createSocket('udp4');

require('./controllers/gpsDataController')(io);

// settings
app.set('port', process.env.PORT || 4500);

server.listen(app.get('port'), () => {    
    console.log('[Web Server] listening on port ' + app.get('port'));
});