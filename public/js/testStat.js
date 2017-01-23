$("#menu-toggle").click(function(e) {
	e.preventDefault();
	$("#wrapper").toggleClass("toggled");
});

function handleTestStat() {
	$('.testTable').on('click', '.js-test-stat', function(e) {
		e.preventDefault();
		statChart($(e.currentTarget).closest('.js-test-stat').attr('data-id'));
	});
}

function statChart(id) {
	console.log(id);
	$.ajax({
		url: '/testStat/' + id,
		method: 'GET',
		success: function(data) {
			document.getElementById('testStatLabel').innerHTML = " Stat for Test " + id;
			drawTestChart(data);
			console.log(data);
		}
	});
}

function drawTestChart(exam) {
	$('#statChart').modal('show');
	console.log(exam);
	//console.log(exam);
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
			data.setCell(i, 0, Number(exam[i].score));
			data.setCell(i, 1, Number(exam[i].score));
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
	handleTestStat();
});