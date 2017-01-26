$("#menu-toggle").click(function(e) {
	e.preventDefault();
	$("#wrapper").toggleClass("toggled");
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
var testTemplate = ('<div class="well">'
+ '<span><p class="studentName"></p>'
+ '<input class="testScore"></input></span>' +
'<button class="btn btn-default pull-right js-score-edit"><span><i class="glyphicon glyphicon-edit "></i> Edit</span></button>' +
'<button class="btn btn-default pull-right js-score-delete"><span><i class="glyphicon glyphicon-trash "></i> Delete</span></button>'


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

function displayTestTable2(data) {
	console.log(data);
	var testTableElement = data.map(function(data) {
		var element = $(editTemplate);
		element.attr('id', data.studentId);
		element.attr('scoreInfo', data.score);
		element.find('.studentName').text(data.name);
		element.find('.testScore').value(data.score);
		return element;
	});
	$('.testEditWell').html(testTableElement);
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
	alert("HI");
	$.ajax({
		url: 'testList/' + test.id,
		method: 'DELETE',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify(test),
		success: function() {
		alert("ROYA");
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
		console.log(data);
			document.getElementById('testEditLabel').innerHTML = " Test Edit" + id;
			displayTestTable(data.studentScores, id);
			$('#editTest').modal('show');
			//drawTestChart(data.testScores);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert("Status: " + textStatus);
			alert("Error: " + errorThrown);
		}
	});
}

function statChart(id) {
	$.ajax({
		url: 'testList/' + id,
		method: 'GET',
		success: function(data) {
		alert("HIHIHI");
		console.log(data);
			document.getElementById('testStatLabel').innerHTML = " Stat for Test " + id;
			drawTestChart(data.testScores);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			//alert("Status: " + textStatus);
			console.log("Error: " + errorThrown);
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
		var data = new google.visualization.DataTable();
		data.addColumn('number', 'Test');
		data.addColumn('number', 'Score');
		data.addRows(exam.length);
		for (i = 0; i < exam.length; i++) {
			data.setCell(i, 0, Number(exam[i]));
			data.setCell(i, 1, Number(exam[i]));
		}
		var options = {
			title: 'Test Score',
			curveType: 'function',
			legend: {
				position: 'bottom'
			},
			'width': 400,
			'height': 400
		};
		var chart = new google.visualization.ScatterChart(document.getElementById('curve_chart'));
		chart.draw(data, options);
	}
}
$(function() {
	$('#testDT').DataTable();
	//$('#editTestTable').DataTable();
	handleScoreDelete();
	handleScoreEdit();
	handleTestChart();
	handleTestEdit();
});
