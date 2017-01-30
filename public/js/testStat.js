$('#menu-toggle').click(function(e) {
	e.preventDefault();
	$('#wrapper').toggleClass('toggled');
});

function handleTestChart() {
	$('.testTable').on('click', '.js-test-stat', function(e) {
		e.preventDefault();
		statChart($(e.currentTarget).closest('.js-test-stat').attr('data-id'));
	});
}

function handleTestEdit() {
	$('.testTable').on('click', '.js-test-edit', function(e) {
		e.preventDefault();
		testEdit($(e.currentTarget).closest('.js-test-edit').attr('data-id'));
	});
}
var testTemplate = ('<div class=\'well\'>' +
'<span><p class=\'studentName floating-box\'></p>' +
 '<input class=\'testScore formfloating-box\' type=\'number\'></input></span>' +
 '<button class=\'btn floating-box btn-default  js-score-edit\'><span><i class=\'glyphicon glyphicon-save\'></i> Save</span></button>'
 + '<button class=\'btn btn-default floating-box js-score-delete\'><span><i class=\'glyphicon glyphicon-trash \'></i> Delete</span></button>'
 + '</div>' + '</div>');

function displayTestTable(data, testId) {
	var testTableElement = data.map(function(data) {
		var element = $(testTemplate);
		element.attr('id', data.studentId);
		element.attr('scoreInfo', data.score);
		element.attr('testId', testId);
		element.find('.studentName').text(data.name);
		element.find('.testScore').val(data.score);
		return element;
	});
	$('.well').html(testTableElement)
}


function handleScoreEdit() {
	$('.well').on('click', '.js-score-edit', function(e) {
		e.preventDefault();
		var studentId = $(e.currentTarget).closest('.well').attr('id');
		//var scoreInfo=$(e.currentTarget).closest('.well').attr('scoreInfo');
		var scoreInfo = $('.testScore').val().trim();
		var testId = $(e.currentTarget).closest('.well').attr('testId');
		updateScore({
			id: studentId,
			testNumber: testId,
			testScore: scoreInfo
		});
	});
}

function handleScoreDelete() {
	$('.well').on('click', '.js-score-delete', function(e) {
		e.preventDefault();
		var studentId = $(e.currentTarget).closest('.well').attr('id');
		//var scoreInfo=$(e.currentTarget).closest('.well').attr('scoreInfo');
		var scoreInfo = $('.testScore').val().trim();
		var testId = $(e.currentTarget).closest('.well').attr('testId');
		deleteScore({
			id: studentId,
			testNumber: testId,
			testScore: scoreInfo
		});
	});
}

function updateScore(test) {
	$.ajax({
		url: 'testList/' + test.id,
		method: 'PUT',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify(test),
		success: function() {
			window.location.reload(true);
			$('#editTest').modal('hide');
		}
	});
}

function deleteScore(test) {
	$.ajax({
		url: 'testList/' + test.id,
		method: 'DELETE',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify(test),
		success: function() {

			window.location.reload(true);
			$('#editTest').modal('hide');
		}
	});
}

function testEdit(id) {
	$.ajax({
		url: 'testList/' + id,
		method: 'GET',
		success: function(data) {
			document.getElementById('testEditLabel').innerHTML = ' Edit scores for Test # ' + id;
			displayTestTable(data.studentScores, id);
			$('#editTest').modal('show');
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log('Status: ' + textStatus);
			console.log('Error: ' + errorThrown);
		}
	});
}

function statChart(id) {
	$.ajax({
		url: 'testList/' + id,
		method: 'GET',
		success: function(data) {
			document.getElementById('testStatLabel').innerHTML = ' Stat for Test ' + id;
			drawTestChart(data.testScores);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log('Error: ' + errorThrown);
		}
	});
}

function drawTestChart(exam) {
	$('#statChart').modal('show');
	google.charts.load('current', {
		'packages': ['corechart']
	});
	google.charts.setOnLoadCallback(drawChart);

	function drawChart() {
		var grade = {};
		grade['A'] = 0;
		grade['B'] = 0;
		grade['C'] = 0;
		grade['D'] = 0;
		for (i = 0; i < exam.length; i++) {
			if (exam[i] < 70) {
				grade['D'] = grade['D'] + 1;
			} else if (exam[i] < 80) {
				grade['C'] = grade['C'] + 1;
			} else if (exam[i] < 90) {
				grade['B'] = grade['B'] + 1;
			} else {
				grade['A'] = grade['A'] + 1;
			}
		}
		var data = google.visualization.arrayToDataTable([
			['Grades', 'Number of students'],
			['A', grade['A']],
			['B', grade['B']],
			['C', grade['C']],
			['D', grade['D']]
		]);
		var options = {
			title: 'Grades',
			'width': 500,
			'height': 500
		};
		var chart = new google.visualization.PieChart(document.getElementById('curve_chart'));
		chart.draw(data, options);
	}
}



$(function() {
	$('#testDT').dataTable({
		"columnDefs": [{
			"orderable": false,
			"targets": 1
		},
		{
			"orderable": false,
			"targets": 2
		}]
	});

	handleScoreDelete();
	handleScoreEdit();
	handleTestChart();
	handleTestEdit();
});
