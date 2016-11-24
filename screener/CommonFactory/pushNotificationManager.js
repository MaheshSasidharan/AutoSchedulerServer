var apn = require('apn');

var oAPN = {
	SendNotification: function(sToken, sMessage){
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
            alert:  sMessage
        });
        note.badge = 1;
        note.topic = "autosched.team12.com";

        service.send(note, sToken).then(function(){
            res.json({ "code": 100, "status": "SUCCESS" });
        }).catch(function(){
        	res.json({ "code": 500, "status": "FAILED" });
        });
        service.shutdown();
	}
}

module.exports = oAPN;