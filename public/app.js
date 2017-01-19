var testScoreMockData=
{"testRecord": [{
    "id": 1,
    "testNumber": 1,
    "score": 33,
    "description": "Math",
    "userId": "u1",
},
{
    "id": 2,
    "testNumber": 2,
    "score": 70,
    "description": "Math",
    "userId": "u1",
},
{
    "id": 3,
    "testNumber": 3,
    "score": 90,
    "description": "Math",
    "userId": "u1",
}]};




function getScores(callbackFn) {
	setTimeout(function(){ callbackFn(testScoreMockData)}, 1);
}


function scoreList(data) {
    for (index in data.testRecord) {
	   $('body').append(
        '<p>' + data.testRecord[index].score + '</p>');
    }
}

function displayScore() {
	getScore(scoreList);
}

$(function() {
	displayScore();
})

