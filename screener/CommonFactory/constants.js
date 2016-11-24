var Constants = {
    Queries: {
        Scheduler: {
            CheckUserExist: {
                query: "SELECT * FROM Users where users_number = ?",
            },
            UpdateUser:{
            	query: "UPDATE Users SET ? WHERE users_number = ?"
            },
            InsertUser:{
            	query: "INSERT INTO Users SET ?"
            }
        }
    },
    Errors: {
        _101: { "code": 100, "status": "Error in connection database" },
        SomethingWentWrong: "Sorry, something went wrong... :("
    }
};

module.exports = Constants;
