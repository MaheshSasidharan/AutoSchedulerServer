// Database manager
var mysql = require('mysql');
var Constants = require('../CommonFactory/constants');

var GetPool = function() {
    var env = process.env.NODE_ENV || 'development';
    var config = require('../config')[env];
    return mysql.createPool(config.poolConfig);
}

var AddUser = function(user, res, callback) {
    DB.pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ code: 100, status: false, msg: "Error in connection database" });
            return;
        }
        //if(res && res.locals){}
        var insertVals = user;
        connection.query('INSERT INTO Users SET ?', insertVals, function(err, result) {
            if (err) throw err;
            console.log(result.insertId);
            callback(err, result.insertId);
        });

        connection.on('error', function(err) {
            res.json({ code: 100, status: false, msg: "Error in connection database" });
            return;
        });
    });
}

var FindUser = function(id, res, callback) {
    DB.pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ code: 100, status: false, msg: "Error in connection database" });
            return;
        }
        var whereVals = [id];
        connection.query('SELECT * FROM Users where userId = ? LIMIT 1', whereVals, function(err, result) {
            if (err) throw err;
            console.log(result);
            callback(err, result);
        });

        connection.on('error', function(err) {
            res.json({ code: 100, status: false, msg: "Error in connection database" });
            return;
        });
    });
}

var DB = {
    pool: GetPool(),
    AddUser: AddUser,
    FindUser: FindUser
}

module.exports = DB;
