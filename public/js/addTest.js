function addTestScore(score) {
	$.ajax({
		method: 'POST',
		url: '/addTestScore',
		data: JSON.stringify(score),
		success: function(data) {
			alert("success");
      $("#addScores").bootstrapValidator('resetForm', true);
			$("#addScores").find('.has-error').removeClass("has-error");
			$("#addScores").find('.has-success').removeClass("has-success");
			$('#addScores').find('.form-control-feedback').remove();
		},
		dataType: 'json',
		contentType: 'application/json'
	});


  return false;
}

function addTestScoreDB() {
	let testScores = [];
	var table = document.getElementById('studentList');
	var description = document.getElementById('description').value;
	var testNumber = $(document.getElementById('testNumber')).attr("data-id");
	for (var r = 1, n = table.rows.length; r < n; r++) {
		element = table.rows[r].cells[1].innerHTML;
		testScores.push([$(table.rows[r].cells[1].childNodes[0]).attr("data-id"), table.rows[r].querySelectorAll('.newScore')[0].value]);
	}
	testScores.push(["testNumber", testNumber]);
	testScores.push(["description", description]);
	addTestScore(testScores);
}

function handleAddTestScore() {
	$('#addScores').submit(function(e) {
		e.preventDefault();
    e.stopImmediatePropagation();
		addTestScoreDB();
	});
}

function validateAddScoreForm() {
	$('#addScores').bootstrapValidator({
		container: '#messagesAddScore',
		fields: {
			score: {
				validators: {
					notEmpty: {
						message: 'It cannot be empty'
					},
          numeric :{
            message: 'Please enter numeric score'
          }
        }
			},
			description: {
				validators: {
					notEmpty: {
						message: 'The  name is required and cannot be empty'
					}
				}
			}
		}
	}).on('success.field.fv', function(e, data) {
		if (data.fv.getInvalidFields().length > 0) {
			data.fv.disableSubmitButtons(true);
		}
	});
}

$(function() {
	handleAddTestScore();
  validateAddScoreForm();

	$("#menu-toggle").click(function(e) {
		e.preventDefault();
		$("#wrapper").toggleClass("toggled");
	});
});
