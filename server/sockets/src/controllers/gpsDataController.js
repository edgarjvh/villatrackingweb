const connection = require('./connection');
const conn = connection();
const moment = require('moment');
var devices = [];

module.exports = (io) => {
    io.on('connection', socket => {
        console.log('NUEVO SOCKET CONECTADO');
    });

    require('./tk103abController')(io, devices);
} 