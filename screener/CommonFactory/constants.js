var Constants = {
	Queries: {
		Assessments: {
			GetAssessmentQuestions: 
			{
				//Get assessments and responses if any
				query: "SELECT questionId, question, assessmentId, nickName, name, description FROM vw_AssessmentQuestions",
			},
			GetAssessmentResponse: 
			{
				//Get assessments and responses if any
				query: "SELECT responseTextId, questionId, response, userId FROM ResponseTexts where userId = ?",
			},
			InsertResponse: 
			{
				//Insert new Response texts
				query: "INSERT INTO ResponseTexts (userId, questionId, response) VALUES ?"
			},
			UpdateResponse:
			{
				//Update Response texts
				query: "UPDATE ResponseTexts SET ? WHERE responseTextId = ?"
			}
		}
	},
	Errors: {
		_101: {"code" : 100, "status" : "Error in connection database"},
		Assessments: {
			GetAssessmentQuestionFailed: "Could not get assessments. :(",
			GetAssessmentResponseFailed: "Could not get assessments. :(",
			SaveAssessmentFailed: "Something went wrong. Could not save your response."
		}
	}
};

module.exports = Constants;