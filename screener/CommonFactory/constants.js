var Constants = {
    Queries: {
        Scheduler: {
            CheckUserExist: {
                query: "SELECT * FROM users where users_number = ?",
            },
            Test: {
                query: "SELECT * FROM users",
            },
            UpdateUser:{
            	query: "UPDATE users SET ? WHERE users_number = ?"
            },
            InsertUser:{
            	query: "INSERT INTO users SET ?"
            },
			InitiateMeeting: 
			{
				query: "INSERT INTO meetingRequest (meetingowner,participantsCount,approvedCount,rangeStart, rangeEnd, meetingduration,status,location) VALUES ?"
			},
			InsertMeetingParticipants: 
			{
				query: "INSERT INTO meetingparticipants (meetingid, user) VALUES ?"
			},
			GetMeetingParticipantsDeviceId: 
			{
				query: "Select user_device_id from users where users_number = ?"
			},
        }
    },
    Errors: {
        _101: { "code": 100, "status": "Error in connection database" },
        SomethingWentWrong: "Sorry, something went wrong... :("
    }
};

module.exports = Constants;
