var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var apn = require('apn');

var env = process.env.NODE_ENV || 'development';
var config = require('../config')[env];

var Constants = require('../CommonFactory/constants');
var PushNM = require('../CommonFactory/pushNotificationManager');
var DateFormatter = require('../CommonFactory/dateFormatter');

var pool = mysql.createPool(config.poolConfig);

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});



router.get('/test', function(req, res, next) {
    var query = "SELECT * FROM users";
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ rows: err });
            //console.log(err)
        }
        connection.query(query, function(err, rows) {
            connection.release();
            res.json({ rows: rows })
            //console.log(rows)
        });
        connection.on('error', function(err) {
            res.json({ rows: err });
            //console.log(err)
        });
    });
    //console.log("dskbhgbkljgfklbjlgfkbl")
});

router.post('/signup', function(req, res, next) {
    sign_up(req, res);
});

router.post('/updatefreetime', function(req, res) {
    updateFreeTime(req, res)
});

router.post('/firstpost', function(req, res) {
    get_users(req, res);
});

router.post('/setpriorities', function(req, res) {
    setPriorities(req, res);
});

router.post('/initiatemeeting', function(req, res) {
    initiateMeeting(req, res);
});


router.post('/getrequests', function (req, res, next) {
    getRequests(req, res);
});


router.post('/getSuggestions', function (req, res, next) {
    getSuggestions(req, res);
});

router.post('/rejectMeeting', function (req, res, next) {
    rejectMeeting(req, res);
});



function updateFreeTime(req, res) {
    //console.log(req.body["username"])
    var user = req.body["username"]
    var meeting = parseInt(req.body["meetingid"])
    var starts = req.body["strtdates"]
    var ends = req.body["enddates"]
    //console.log(ends)
    var query = "insert into availabletime values"
    for (i = 0; i < starts.length - 1; i++) {
        //console.log(starts[i])
        var startTime = new Date(starts[i]).toISOString().slice(0, 19).replace('T', ' ');
        var endTime = new Date(ends[i]).toISOString().slice(0, 19).replace('T', ' ');
        query = query + "(" + meeting + ",'" + user + "','" + startTime + "','" + endTime + "'),"
    }
    var startTime = new Date(starts[starts.length - 1]).toISOString().slice(0, 19).replace('T', ' ');
    var endTime = new Date(ends[starts.length - 1]).toISOString().slice(0, 19).replace('T', ' ');
    query = query + "(" + meeting + ",'" + user + "','" + startTime + "','" + endTime + "');"
    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        ////console.log('connected as id ' + connection.threadId);
        //console.log(query);
        connection.query(query, function(err, rows) {
            connection.release();

            if (!err) {
                updateFlag(meeting)

                res.json({ status: true });
            }
        });

        connection.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });

}

function sign_up(req, res) {
    var params = {
        sType: "checkUserExist",
        errors: {
            errors_101: Constants.Errors._101,
            queryFailed: Constants.Errors.SomethingWentWrong
        },
        query: Constants.Queries.Scheduler.CheckUserExist.query,
        whereVals: [req.body["username"]],
        callback: function(rowsInner) {
            if (rowsInner && rowsInner.length) {
                // Found user, so update token
                var params = {
                    sType: "updateUser",
                    errors: {
                        errors_101: Constants.Errors._101,
                        queryFailed: Constants.Errors.SomethingWentWrong
                    },
                    query: Constants.Queries.Scheduler.UpdateUser.query,
                    whereVals: [{ user_device_id: req.body["identification"] }, req.body["username"]],
                    callback: function(rowsInner) {
                        res.json({ status: true });
                        PushNM.SendNotification(req.body["identification"], { message: "Hi This is your number: " + req.body["username"], sType: "CheckUserExist", bActionRequired: "false" }, true);
                    }
                };
                handle_database(req, res, params);
            } else { // Add new one
                var where = { users_number: req.body["username"], user_device_id: req.body["identification"] };
                var params = {
                    sType: "insertUser",
                    errors: {
                        errors_101: Constants.Errors._101,
                        queryFailed: Constants.Errors.SomethingWentWrong
                    },
                    query: Constants.Queries.Scheduler.InsertUser.query,
                    whereVals: where,
                    callback: function(rowsInner) {
                        res.json({ status: true });
                        PushNM.SendNotification(req.body["identification"], { message: "Hi This is your number: " + req.body["username"], sType: "CheckUserExist", bActionRequired: "false" }, true);

                    }
                };
                handle_database(req, res, params);
            }
        }
    };
    handle_database(req, res, params);
}

function initiateMeeting(req, res) {
    var startTime = new Date(req.body["starttime"]).toISOString().slice(0, 19).replace('T', ' ');
    startTime = startTime.substring(0, startTime.length - 3);
    var endTime = new Date(req.body["endtime"]).toISOString().slice(0, 19).replace('T', ' ');
    endTime = endTime.substring(0, endTime.length - 3);
    var duration = req.body["duration"];
    var participantsList = req.body["participants"];
    var owner = req.body["owner"];
    var status = 'pending';
    var location = req.body["location"];
    var whereVals = [];

    whereVals.push([owner, participantsList.length+1, 0, startTime, endTime, duration, status, location]);

    var params = {
        sType: "BulkInsert",
        errors: {
            errors_101: Constants.Errors._101,
            queryFailed: Constants.Errors.SomethingWentWrong
        },
        query: Constants.Queries.Scheduler.InitiateMeeting.query,
        whereVals: whereVals,
        callback: function(rows) {
            //console.log(rows);
            var otherParams = {
                rows: rows,
                participantsList: participantsList,
                startTime: startTime,
                endTime: endTime,
                duraTion: duration
            }
            InsertMeetingParticipants(req, res, otherParams);
        }
    };
    handle_database(req, res, params);
}

function InsertMeetingParticipants(req, res, otherParams) {
    var whereVals = [];
    otherParams.participantsList.forEach(function(oItem) {
        whereVals.push([otherParams.rows.insertId, oItem]);
    });
    var params = {
        sType: "BulkInsert",
        errors: {
            errors_101: Constants.Errors._101,
            queryFailed: Constants.Errors.SomethingWentWrong
        },
        query: Constants.Queries.Scheduler.InsertMeetingParticipants.query,
        whereVals: whereVals,
        callback: function(rowsInner) {
            //console.log("InsertMeetingParticipants -- " + JSON.stringify(rowsInner));
            SendNotificationToParticipants(req, res, otherParams);
        }
    };
    handle_database(req, res, params);
}

function SendNotificationToParticipants(req, res, otherParams) {
    var whereVals = [];
    var totalSent = 0;
    otherParams.participantsList.forEach(function(oItem) {
        whereVals = [oItem];
        var params = {
            sType: "GetParticpants",
            errors: {
                errors_101: Constants.Errors._101,
                queryFailed: Constants.Errors.SomethingWentWrong
            },
            query: Constants.Queries.Scheduler.GetMeetingParticipantsDeviceId.query,
            whereVals: whereVals,
            callback: function(rowsInner) {
                ////console.log(rowsInner);
                var deviceId = rowsInner[0].user_device_id;
                PushNM.SendNotification(deviceId, { message: "You have a new meeting request", sType: "NewMeetingReq", bActionRequired: "true", meetingId: otherParams.rows.insertId.toString(), dStartDate: otherParams.startTime, dEndDate: otherParams.endTime, dDuration: otherParams.duraTion }, false);
                // Send response after notification is sent
                if (++totalSent === otherParams.participantsList.length) {
                    res.json({ status: true, insertedId: otherParams.rows.insertId, message: "Inserted" });
                }
            }
        };
        handle_database(req, res, params);
    });
}

function get_users(req, res) {
    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        ////console.log("select users_number from users where users_number in (" + req.body["username"] + ")")
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

function getcommonfreetime(meetingId) {
    var query = "insert into meetingsuggestions (meetingid, starttime, endtime) select " + meetingId + ", f.startDate, f.endDate from (select s.* from (SELECT startDate, endDate, count(endDate) as 'counts' FROM availabletime where meetingid = "+ meetingId+" " +
        "group by startDate, endDate) s where s.counts = (select participantsCount from meetingRequest where meeting_id = " + meetingId + ")) as f"
    ////console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                clearFlag(meetingId)

                return
            }
        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function sugestedTime(meetingid) {
    var query = "SELECT starttime, endtime FROM meetingsuggestions where meetingid = " + meetingid + ";";
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            var arrSuggestedTimes = rows;
            connection.release();
            if (!err) {
                function SendNotification(meetingRecipients) {
                    meetingRecipients.forEach(function(oItem) {
                        //PushNM.SendNotification(oItem.user_device_id, { message: "Suggested times have been updated", sType: "UpdatedSuggestedTimes", bActionRequired: "true", meetingId: meetingid.toString(), arrSuggestedTimes: JSON.stringify(arrSuggestedTimes) }, false);
                        PushNM.SendNotification(oItem.user_device_id, { message: "Suggested times have been updated", sType: "UpdatedSuggestedTimes", bActionRequired: "true", meetingId: meetingid.toString(), arrSuggestedTimes:  JSON.stringify(arrSuggestedTimes)}, false);
                    });
                    SendNotificationToOwner(meetingid, arrSuggestedTimes);
                    return;
                }
                GetUsersByMeetingId(meetingid, SendNotification);
                return;
            }
        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function SendNotificationToOwner(meetingid, arrSuggestedTimes) {
    var query = "SELECT u.user_device_id FROM users u JOIN meetingRequest m on m.meetingowner = u.users_number where m.meeting_id = " + meetingid + ";";
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                PushNM.SendNotification(rows[0].user_device_id, { message: "Suggested times have been updated", sType: "UpdatedSuggestedTimes", bActionRequired: "true", meetingId: meetingid.toString(), arrSuggestedTimes: JSON.stringify(arrSuggestedTimes) }, false);
                return;
            }
        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function GetUsersByMeetingId(meetingId, Callback) {
    var query = "select u.users_number, u.user_device_id from users u join meetingparticipants m on u.users_number = m.user where m.meetingid =" + meetingId + ";"
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            Callback(rows);
        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function updateFlag(meetingId) {
    var query = "update meetingRequest set approvedCount = approvedCount+1 where meeting_id =" + meetingId + ";"
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                checkUsersTapped(meetingId)
            }

        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function clearFlag(meetingId) {
    var query = "update meetingRequest set approvedCount = 0,status = 'suggested'  where meeting_id =" + meetingId + ";"
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                sugestedTime(meetingId)
            }

        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function checkUsersTapped(meetingid) {
    var query = "SELECT approvedCount,participantsCount FROM meetingRequest where meeting_id = " + meetingid + "; "
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                //console.log("checkUsersTapped" + JSON.stringify(rows[0]));
                if (rows[0]["approvedCount"] == rows[0]["participantsCount"]) {
                    getcommonfreetime(meetingid)

                }
            }
        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function setPriorities(req, res) {
    //console.log(req.body["username"])
    var user = req.body["username"]
    var meeting = parseInt(req.body["meetingid"])
    var starts = req.body["strtdates"]
    var ends = req.body["enddates"]
    var ranks = req.body["ranks"]

    starts = starts.replace("[","").replace(" +0000]","").split(" +0000,");
    ends = ends.replace("[","").replace(" +0000]","").split(" +0000,");
    ranks = ranks.replace("[","").replace("]","").split(",");

    //console.log(ends)
    var query = "insert into meetingrankings values"
    for (i = 0; i < starts.length - 1; i++) {
        //console.log(starts[i])
        var startTime = starts[i];
        var endTime = ends[i];
        query = query + "(" + meeting + ",'" + user + "','" + startTime + "','" + endTime + "', " + ranks[i] + "),"
    }
    var startTime = starts[starts.length - 1];
    var endTime = ends[starts.length - 1];
    query = query + "(" + meeting + ",'" + user + "','" + startTime + "','" + endTime + "', " + ranks[i] + ");"
    console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        //console.log(query);
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                //updateFlag(meeting)
                updateFlagAfterSettingPriorities(meeting);
                res.json({ status: true });
            }
        });

        connection.on('error', function(err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
}

function updateFlagAfterSettingPriorities(meetingId) {
    var query = "update meetingRequest set approvedCount = approvedCount+1 where meeting_id =" + meetingId + ";"
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                checkUsersRanked(meetingId);
            }

        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function checkUsersRanked(meetingid) {
    var query = "SELECT approvedCount,participantsCount FROM meetingRequest where meeting_id = " + meetingid + "; "
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                if (rows[0]["approvedCount"] == rows[0]["participantsCount"]) {
                    FinilizeSchedule(meetingid);
                }
            }
        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function FinilizeSchedule(meetingid) {
    var query = "select DATE_FORMAT(starttime, '%Y-%m-%d %T') as starttime, DATE_FORMAT(endtime, '%Y-%m-%d %T') as endtime, sum(rank) from meetingrankings where meetingid = " + meetingid + " group by starttime, endtime having sum(rank) > 0 order by sum(rank), starttime limit 1";
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                var start = rows[0]["starttime"];
                var end = rows[0]["endtime"];
                finalEvent(meetingid, start, end);
            }
        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function finalEvent(meetingId, start, end) {
    var query = "update meetingRequest set meetingRequest.status = 'Done',  meetingRequest.finalstarttime = '" + start + "' where meeting_Id = " + meetingId + ";";
    //console.log(query)
    var location = '';
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                if (!err) {
                    function SendNotification(meetingRecipients) {

                        var query1 = "SELECT location FROM autoscheduler.meetingRequest where meeting_id = '" + meetingId + "';";
                        connection.query(query1, function(err, rows) {
                            connection.release();
                            if (!err) {
                                location = rows[0]["location"];
                            }
                        });
                        console.log("finalEvent" + "START - " + start + "***** END -- " + end);
                        meetingRecipients.forEach(function(oItem) {
                            PushNM.SendNotification(oItem.user_device_id, { message: "A new meeting has been scheduled", sType: "FinalizedSuggestedTimes", bActionRequired: "true", meetingId: meetingId.toString(), dStartTime: start.toString(), dEndTime: end.toString() }, false);
                        });
                        SendNotificationToOwnerFinal(meetingId, start, end, location);
                        return;
                    }
                    GetUsersByMeetingId(meetingId, SendNotification);
                    //push notification for sending the suggestions rows
                    return;
                }
            }
        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function SendNotificationToOwnerFinal(meetingId, start, end, location) {
    var query = "SELECT u.user_device_id FROM users u JOIN meetingRequest m on m.meetingowner = u.users_number where m.meeting_id = " + meetingId + ";";
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                PushNM.SendNotification(rows[0].user_device_id, { message: "Your meeting has been finalized", sType: "FinalizedSuggestedTimes", bActionRequired: "true", meetingId: meetingId.toString(),  dStartTime: start.toString(), dEndTime: end.toString(), mlocation: location }, false);
                return;
            }
        });
        connection.on('error', function(err) {
            return;
        });
    });
}

function handle_database(req, res, params) {
    pool.getConnection(function(err, connection) {
        if (err) {
            res.json(params.errors.errors_101);
            return;
        }
        switch (params.sType) {
            case "BulkInsert":
                connection.query(params.query, [params.whereVals], function(err, rows) {
                    connection.release();
                    if (!err) {
                        params.callback(rows);
                    } else {
                        res.json({ status: false, msg: params.errors.queryFailed });
                    }
                });
                break;
            default:
                connection.query(params.query, params.whereVals, function(err, rows) {
                    connection.release();
                    if (!err) {
                        params.callback(rows);
                    } else {
                        res.json({ status: false, msg: params.errors.queryFailed });
                    }
                });
        }
    });
}

function getRequests(req, res) {
    //console.log(req.body["username"])
    var user = req.body["username"]
    //var user = '3199309832'

    var query = "SELECT * FROM meetingRequest where status = 'suggested' and meeting_id in " +
        "(SELECT distinct(meetingid) FROM meetingsuggestions) and (meetingowner = '" + user + "' or meeting_id in " +
        "(select meetingid from meetingparticipants where user = '" + user + "')) and status = 'suggested' and " +
        "meeting_id not in (select distinct(meetingid) from meetingrankings where user = '" + user + "');"
    //console.log(ends)
    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ rows: err });
            //console.log(err)
        }
        connection.query(query, function(err, rows) {
            connection.release();
            res.json({ rows: rows })
            console.log(rows)
        });
        connection.on('error', function(err) {
            res.json({ rows: err });
            //console.log(err)
        });
    });
}

function getSuggestions(req, res) {
    //console.log(req.body["username"])
    var meetingid = req.body["meetingid"]

    //var meetingid = '77'

    var query = "SELECT DATE_FORMAT(starttime, '%Y-%m-%d %T') as starttime, DATE_FORMAT(endtime, '%Y-%m-%d %T') as endtime FROM meetingsuggestions where meetingid = '" + meetingid + "';"
    //console.log(ends)
    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ rows: err });
            //console.log(err)
        }
        connection.query(query, function(err, rows) {
            connection.release();
            res.json({ rows: rows })
            console.log(rows)
            
        });
        connection.on('error', function(err) {
            connection.release();
            res.json({ rows: err });
            //console.log(err)
        });
    });
}
function rejectMeeting(req, res) {
    //console.log(req.body["username"])
    var meetingid = req.body["meetingid"]
    var userid = req.body["userid"]

    //var meetingid = '2'

    var query = "delete from meetingparticipants where meetingid = '"+meetingid+"' and user ='"+userid+"';"
    //console.log(ends)
    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({ rows: err });
            //console.log(err)
        }
        connection.query(query, function(err, rows) {
            connection.release();
            reduceParticipantsCount(meetingid);
            res.json({ rows: rows })
            console.log(rows)
        });
        connection.on('error', function(err) {
            res.json({ rows: err });
            //console.log(err)
        });
    });

}

function reduceParticipantsCount(meetingId) {
    var query = "update meetingRequest set participantsCount = participantsCount-1  where meeting_id =" + meetingId + ";"
    //console.log(query)
    pool.getConnection(function(err, connection) {
        if (err) {
            return;
        }
        connection.query(query, function(err, rows) {
            connection.release();
            if (!err) {
                return;
            }

        });
        connection.on('error', function(err) {
            return;
        });
    });
}


module.exports = router;
