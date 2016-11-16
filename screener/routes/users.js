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

<<<<<<< HEAD
router.post('/firstpost',function (req,res) {
    console.log(req.body["username"])
    get_users(req,res)
})
=======
router.post('/PostURL', function(req, res) {
    var id = req.body.id;
    var name = req.body.name;
    res.json({"status": "SUCCESS","ResponseId": id, "ResponseName": name});
});
>>>>>>> master

var env = process.env.NODE_ENV || 'development';
var config = require('../config')[env];

var pool = mysql.createPool(config.poolConfig);

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