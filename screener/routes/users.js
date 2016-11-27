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

router.get('/commonfrees', function(req, res, next) {
    console.log("kalyan")
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
                updateFlag(meeting)
                checkUsersTapped(meeting)
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

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query("select * from users", function (err, rows) {
            connection.release();
            if (!err) {
                res.json({status: true, users: rows});
            }
        });

        connection.on('error', function (err) {
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        });
    });

}



function getcommonfreetime(meetingId) {


    var query = "insert into meetingsuggestions (meetingid, starttime, endtime) select "+meetingId+", f.startDate, f.endDate from (select s.* from (SELECT startDate, endDate, count(endDate) as 'counts' FROM autoscheduler.availabletime where meetingid = 1 " +
        "group by startDate, endDate) s where s.counts = (select participantsCount from meetingRequest where meeting_id = " + meetingId + ")) as f"
    console.log(query)
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query(query, function (err, rows) {
            connection.release();
            if (!err) {
                res.json({status: true, users: rows});
            }
        });

        connection.on('error', function (err) {
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        });
    });
}


function updateFlag(meetingId)
{
    var query = "update meetingRequest set approvedCount = approvedCount+1 where meeting_id ="+meetingId+";"
    console.log(query)
    pool.getConnection(function (err, connection) {
        if (err) {
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query(query, function (err, rows) {
            connection.release();

        });

        connection.on('error', function (err) {
            return;
        });
    });
}


function clearFlag(meetingId)
{
    var query = "update meetingRequest set approvedCount = 0 where meeting_id ="+meetingId+";"
    console.log(query)
    pool.getConnection(function (err, connection) {
        if (err) {
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query(query, function (err, rows) {
            connection.release();

        });

        connection.on('error', function (err) {
            return;
        });
    });
}

function checkUsersTapped(meetingid)
{
    var query = "SELECT approvedCount,participantsCount FROM autoscheduler.meetingRequest where meeting_id = "+meetingid+"; "
    console.log(query)
    pool.getConnection(function (err, connection) {
        if (err) {
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query(query, function (err, rows) {
            connection.release();
            if (!err) {
                if(rows[0]["approvedCount"] == rows[0]["participantsCount"]) {
                    getcommonfreetime(meetingid)
                    clearFlag(meetingid)
                }
            }
        });

        connection.on('error', function (err) {
            return;
        });
    });
}


function setPriorities(req, res)
{
    console.log(req.body["username"])
    var user = req.body["username"]
    var meeting = parseInt(req.body["meetingid"])
    var starts = req.body["strtdates"]
    var ends = req.body["enddates"]
    var ranks = req.body["ranks"]
    console.log(ends)
    var query = "insert into meetingrankings values"
    for (i = 0; i < starts.length-1; i++) {
        console.log(starts[i])
        var startTime = new Date(starts[i]).toISOString().slice(0, 19).replace('T', ' ');
        var endTime = new Date(ends[i]).toISOString().slice(0, 19).replace('T', ' ');
        query = query + "(" + meeting + ",'" + user + "','" + startTime + "','" + endTime + "', " + ranks[i] +"),"
    }
    var startTime = new Date(starts[starts.length-1]).toISOString().slice(0, 19).replace('T', ' ');
    var endTime = new Date(ends[starts.length-1]).toISOString().slice(0, 19).replace('T', ' ');
    query = query + "(" + meeting + ",'" + user + "','" + startTime + "','" + endTime + "', " + ranks[i] +");"
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
                updateFlag(meeting)
                checkUsersRanked(meeting)
                res.json({status: true});
            }
        });

        connection.on('error', function (err) {
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        });
    });
}

function finalEvent(meetingd, start, end) {
    var query = "update meetingRequest set meetingRequest.status = 'Done',  meetingRequest.finalstarttime = '"+start+"' where meeting_Id = "+meetingd+";";
    console.log(query)
    pool.getConnection(function (err, connection) {
        if (err) {
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query(query, function (err, rows) {
            connection.release();
            if (!err) {
                //push all participants to update their callenders
            }
        });

        connection.on('error', function (err) {
            return;
        });
    });


}

function FinilizeSchedule(meetingid)
{
    var query = "select starttime, endtime, sum(rank) from meetingrankings where meetingid = "+meetingid+" group by starttime, endtime having sum(rank) > 0 order by sum(rank), starttime limit 1";
    console.log(query)
    pool.getConnection(function (err, connection) {
        if (err) {
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query(query, function (err, rows) {
            connection.release();
            if (!err) {
                console.log(rows)
                finalEvent(meetingid, rows[0]["starttime"], rows[0]["endtime"])
            }
        });

        connection.on('error', function (err) {
            return;
        });
    });
}

function checkUsersRanked(meetingid)
{
    var query = "SELECT approvedCount,participantsCount FROM autoscheduler.meetingRequest where meeting_id = "+meetingid+"; "
    console.log(query)
    pool.getConnection(function (err, connection) {
        if (err) {
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query(query, function (err, rows) {
            connection.release();
            if (!err) {
                if(rows[0]["approvedCount"] == rows[0]["participantsCount"]) {
                    FinilizeSchedule(meetingid)
                }
            }
        });

        connection.on('error', function (err) {
            return;
        });
    });
}

module.exports = router;