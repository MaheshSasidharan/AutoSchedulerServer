var apn = require('apn');

var oAPN = {
    SendNotification: function(sToken, oMessage, bSendResponse) {
        //var environment = process.env.NODE_ENV || 'development';
        var environment = 'development';
        var service = new apn.Provider({
            cert: __dirname + "/conf/" + environment + "/cert.pem",
            key: __dirname + "/conf/" + environment + "/key.pem",
            production: false
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
        console.log("Token: " + sToken);
        // var sMsg = null;
        // var oPayload = {
        //     oData: "Empty Payload",
        //     sType: "NoAction"
        // };
        // if (typeof oMessage === "object") {
        //     sMsg = oMessage.message;
        //     oPayload.oData = oMessage.meetingId;
        //     oPayload.sType = "ActionRequired"
        // } else {
        //     sMsg = oMessage
        // }

        var note = new apn.Notification({
            alert: oMessage.message,
            payload: oMessage
        });
        note.badge = 1;
        note.topic = "autosched.team12.com";
        console.log("NOTIFICATION SENT TO:" + JSON.stringify(oMessage));
        service.send(note, sToken).then(function() {
            if (bSendResponse) {
                res.json({ "code": 100, "status": "SUCCESS" });
            }
        }).catch(function() {
            if (bSendResponse) {
                res.json({ "code": 500, "status": "FAILED" });
            }
        });
        service.shutdown();
    }
}

module.exports = oAPN;
