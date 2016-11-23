var express = require('express');
var mysql = require('mysql');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/test', function(req, res, next) {
	handle_database(req,res);
	//res.send('This is from test');
});

router.post('/signup', function (req, res, next) {
   sign_up(req, res);
});

router.post('/updatefreetime',function (req,res) {
    updateFreeTime(req, res)
});

router.post('/firstpost',function (req,res) {
    console.log(req.body["username"]);
    get_users(req,res);
});

router.post('/initiatemeeting', function(req,res) {
    console.log(req.body);
    var startTime = new Date(req.body["starttime"]).toISOString().slice(0, 19).replace('T', ' ');
    var endTime = new Date(req.body["endtime"]).toISOString().slice(0, 19).replace('T', ' ');
    var duration = req.body["duration"];
    var participantsList = req.body["participants"];
    console.log(startTime);
    var owner = req.body["owner"];
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        }

        console.log('connected as id ' + connection.threadId);
        console.log("insert into meetingRequest(meetingowner,participantsCount,approvedCount,rangeStart, rangeEnd, meetingduration,status)" +
            " values(" +owner +","+ participantsList.length+",0,'"+ startTime+"','"+ endTime+"',1,'pending'"+ ")")

        connection.query("insert into meetingRequest(meetingowner,participantsCount,approvedCount,rangeStart, rangeEnd, meetingduration,status)" +
            " values(" +owner +","+ participantsList.length+",0,'"+ startTime+"','"+ endTime+"',1,'pending'"+ ")",function(err,rows){
            connection.release();
            if(!err) {
                res.json({status: true, users: rows});
            }
        });

        connection.on('error', function(err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        });
    });

})

var env = process.env.NODE_ENV || 'development';
var config = require('../config')[env];

var pool = mysql.createPool(config.poolConfig);


function freetimes(req, res) {
    console.log(req.body)
}


function updateFreeTime(req, res)
{

    console.log(req.body["username"])
    var user = req.body["username"]
    var meeting = parseInt(req.body["meetingid"])
    var starts = req.body["strtdates"]
    var ends = req.body["enddates"]
    console.log(ends)
    var query = "insert into availabletime values"
    for (i = 0; i < starts.length-1; i++) {
        console.log(starts[i])
        var startTime = new Date(starts[i]).toISOString().slice(0, 19).replace('T', ' ');
        var endTime = new Date(ends[i]).toISOString().slice(0, 19).replace('T', ' ');
        query = query + "(" + meeting + ",'" + user + "','" + startTime + "','" + endTime + "'),"
    }
    var startTime = new Date(starts[starts.length-1]).toISOString().slice(0, 19).replace('T', ' ');
    var endTime = new Date(ends[starts.length-1]).toISOString().slice(0, 19).replace('T', ' ');
    query = query + "(" + meeting + ",'" + user + "','" + startTime + "','" + endTime + "');"
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        }

        //console.log('connected as id ' + connection.threadId);
        console.log(query);
        connection.query(query, function (err, rows) {
            connection.release();
            if(!err) {
                res.json({status: true});
            }
        });

        connection.on('error', function (err) {
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        });
    });

}

function sign_up(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        }

        console.log('connected as id ' + connection.threadId);
        console.log("insert into users values(" + req.body["username"] + "," + req.body["identification"] +");");
        connection.query("insert into users values(" + req.body["username"] + "," + req.body["identification"] +");",function(err,rows){
            connection.release();
            if(!err) {
                res.json({status: true});
            }
        });

        connection.on('error', function(err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        });
    });
}

function get_users(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        }

        console.log('connected as id ' + connection.threadId);
        console.log("select users_number from users where users_number in (" + req.body["username"] +")")

        connection.query("select users_number from users where users_number in (" + req.body["username"] +")",function(err,rows){
            connection.release();
            if(!err) {
                res.json({status: true, users: rows});
            }
        });

        connection.on('error', function(err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        });
    });
}

function handle_database(req,res) {
    
    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   

        console.log('connected as id ' + connection.threadId);
        
        connection.query("select * from users",function(err,rows){
            connection.release();
            if(!err) {
                res.json({status: true, users: rows});
            }           
        });

        connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;     
        });
  });





}


module.exports = router;