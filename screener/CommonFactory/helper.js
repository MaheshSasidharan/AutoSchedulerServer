var fs = require("fs");

var Helper = {
    GUID: function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + '-' + s4() + '-' + s4() + '-' + s4();
    },
    FindItemInArray: function(array, keyName, keyVal, returnType) {
        var found = false;
        if (undefined === keyVal || null === keyVal) {
            return null;
        }
        for (var i in array) {
            if (array[i][keyName] == keyVal) {
                found = true;
                break;
            }
        }
        if (!found) {
            return null;
        }
        if (returnType === "index") {
            return i;
        } else {
            return array[i];
        }
    },
    CreateUserDirectories: function(userRoot) {
        var root = userRoot.toString();
        if (!fs.existsSync(root)) {
            fs.mkdirSync(root);
            fs.mkdirSync(root + "/audio");
            fs.mkdirSync(root + "/audio" + "/audioAssessment");
            fs.mkdirSync(root + "/audio" + "/voiceAssessment");            
            fs.mkdirSync(root + "/video");
            fs.mkdirSync(root + "/image");
        }
    },
    SaveFileToDisk: function(arrPath, fileBuffer, res) {
        var sPath = "";
        arrPath.forEach(function(sIndiPath){
            sPath += sIndiPath + "/";
        });
        sPath = sPath.slice(0, -1);

        fs.writeFile(sPath, fileBuffer, function(err) {
            if (err) {
                console.log("err", err);
            } else {
                return res.json({ status: true });
            }
        })
    }
};

module.exports = Helper;
