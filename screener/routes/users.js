var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var apn = require('apn');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/test', function(req, res, next) {
    handle_database(req, res);
    //res.send('This is from test');
});

router.post('/signup', function(req, res, next) {
    sign_up(req, res);
});

router.post('/firstpost', function(req, res) {
    console.log(req.body["username"]);
    get_users(req, res);
});


router.get('/testpn', function(req, res) {
    {
        /*
                var apn = require('apn');

                var options = {
          token: {
            key: "path/to/key.p8",
            keyId: "T0K3NK3Y1D",
            teamId: "T34M1D",
          },
          production: false,
        };

        var apnProvider = new apn.Provider(options);
        */


        var apns = require("apn"),
            options, connection, notification;

        //console.log(join(__dirname, '../conf/key.pem'));
        options = {
            keyFile: __dirname + "/conf/key.pem",
            certFile: __dirname + "/conf/cert.pem",
            debug: true
        };

        connection = new apns.Provider(options);

        notification = new apns.Notification();
        notification.device = new apns.Device("f8e9e1792f32062f7afc378e5994da8ee592483d01acdbd2c5ed7d16d3432799");
        notification.alert = "Hello World !";

        connection.sendNotification(notification);

    }
});

router.get('/testpn2', function(req, res) {
    {
        var apn = require('apn');

        var token = "f8e9e1792f32062f7afc378e5994da8ee592483d01acdbd2c5ed7d16d3432799"; // iPad

        var service = new apn.Provider({
            cert: __dirname + "/conf/cert.pem",
            key: __dirname + "/conf/key.pem",
        });

        service.on("completed", function() { console.log("Completed!") });
        service.on("connected", function() { console.log("Connected"); });
        service.on('disconnected', function() { console.log("Disconnected", arguments); });
        service.on('error', function(err) { console.log("Standard error", err); });
        service.on('socketError', function(err) { console.log("Socket error", err.message); });
        service.on('timeout', function() { console.log("Timeout"); });
        service.on('transmissionError', function(err) { console.log("Transmission Error", err); });

        service.on("transmitted", function(notification) {
            console.log("Transmitted");
        });

        var note = new apn.Notification({
            alert:  "Breaking News: I just sent my first Push Notification"
        });
        note.badge = 1;
        note.topic = "autosched.team12.com";

        service.send(note, token).then(function(){
            res.json({ "code": 100, "status": "SUCCESS" });
        });
        service.shutdown();
    }
});

router.post('/initiatemeeting', function(req, res) {
    console.log(req.body);
    var startTime = new Date(req.body["starttime"]).toISOString().slice(0, 19).replace('T', ' ');
    var endTime = new Date(req.body["endtime"]).toISOString().slice(0, 19).replace('T', ' ');
    var duration = req.body["duration"];
    var participantsList = req.body["participants"];
    console.log(startTime);
    var owner = req.body["owner"];
    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        console.log('connected as id ' + connection.threadId);
        console.log("insert into meetingRequest(meetingowner,participantsCount,approvedCount,rangeStart, rangeEnd, meetingduration,status)" +
            " values(" + owner + "," + participantsList.length + ",0,'" + startTime + "','" + endTime + "',1,'pending'" + ")")

        connection.query("insert into meetingRequest(meetingowner,participantsCount,approvedCount,rangeStart, rangeEnd, meetingduration,status)" +
            " values(" + owner + "," + participantsList.length + ",0,'" + startTime + "','" + endTime + "',1,'pending'" + ")",
            function(err, rows) {
                connection.release();
                if (!err) {
                    res.json({ status: true, users: rows });
                }
            });

        connection.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

})

var env = process.env.NODE_ENV || 'development';
var config = require('../config')[env];

var pool = mysql.createPool(config.poolConfig);

function sign_up(req, res) {
    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        console.log('connected as id ' + connection.threadId);
        console.log("insert into users values(" + req.body["username"] + "," + req.body["identification"] + ");");
        connection.query("insert into users values(" + req.body["username"] + "," + req.body["identification"] + ");", function(err, rows) {
            connection.release();
            if (!err) {
                res.json({ status: true });
            }
        });

        connection.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
}

function get_users(req, res) {
    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        console.log('connected as id ' + connection.threadId);
        console.log("select users_number from users where users_number in (" + req.body["username"] + ")")

        connection.query("select users_number from users where users_number in (" + req.body["username"] + ")", function(err, rows) {
            connection.release();
            if (!err) {
                res.json({ status: true, users: rows });
            }
        });

        connection.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
}

function handle_database(req, res) {

    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query("select * from users", function(err, rows) {
            connection.release();
            if (!err) {
                res.json({ status: true, users: rows });
            }
        });

        connection.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });





}


module.exports = router;
