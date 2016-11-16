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

router.post('/PostURL', function(req, res) {
    var id = req.body.id;
    var name = req.body.name;
    res.json({"status": "SUCCESS","ResponseId": id, "ResponseName": name});
});

var env = process.env.NODE_ENV || 'development';
var config = require('../config')[env];

var pool = mysql.createPool(config.poolConfig);

function handle_database(req,res) {
    
    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   

        console.log('connected as id ' + connection.threadId);
        
        connection.query("select * from Users",function(err,rows){
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