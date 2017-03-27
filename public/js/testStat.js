$('#menu-toggle').click(function (e) {
  e.preventDefault()
  $('#wrapper').toggleClass('toggled')
})

function handleTestChart () {
  $('.testTable').on('click', '.js-test-stat', function (e) {
    e.preventDefault()
    statChart($(e.currentTarget).closest('.js-test-stat').attr('data-id'))
  })
}

function handleTestEdit (dataTable) {
  $('.testTable').on('click', '.js-test-edit', function (e) {
    e.preventDefault()
    testEdit($(e.currentTarget).closest('.js-test-edit').attr('data-id'),dataTable)
  })
}
var testTemplate = ('<div class=\'well\'>' +
'<span><p class=\'studentName floating-box\'></p>' +
 '<input class=\'testScore formfloating-box\' type=\'number\'></input></span>' +
 '<button class=\'btn floating-box btn-default  js-score-edit\'><span><i class=\'glyphicon glyphicon-save\'></i> Save</span></button>' +
 '<button class=\'btn btn-default floating-box js-score-delete\'><span><i class=\'glyphicon glyphicon-trash \'></i> Delete</span></button>' +
 '</div>' + '</div>')

function displayTestTable (data, testId) {
  var testTableElement = data.map(function (data) {
    var element = $(testTemplate)
    element.attr('id', data.studentId)
    element.attr('scoreInfo', data.score)
    element.attr('testId', testId)
    element.find('.studentName').text(data.name)
    element.find('.testScore').val(data.score)
    return element
  })
  $('.well').html(testTableElement)
}

function handleScoreEdit () {
  $('.testEdit-table').on('click', '.js-score-edit', function (e) {
    e.preventDefault()
     var studentId = $(e.currentTarget).data('id')
    var testId = $(e.currentTarget).data('testid')
    var inputId= `#input${studentId}`
    var scoreInfo = $(inputId).val().trim()



    updateScore({
      id: studentId,
      testNumber: testId,
      testScore: Number(scoreInfo)
    })
  })
}

function handleScoreDelete () {
  $('.testEdit-table').on('click', '.js-score-delete', function (e) {
    e.preventDefault()


    var studentId = $(e.currentTarget).data('id')
   var testId = $(e.currentTarget).data('testid')
   var inputId= `#input${studentId}`
   var scoreInfo = $(inputId).val().trim()
    deleteScore({
      id: studentId,
      testNumber: testId,
      testScore: scoreInfo
    })
  })
}

function updateScore (test) {
  console.log(test)
  $.ajax({
    url: 'testList/' + test.id,
    method: 'PUT',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(test),
    success: function () {
      window.location.reload(true)
      $('#editTest').modal('hide')
    }
  })
}

function deleteScore (test) {
  $.ajax({
    url: 'testList/' + test.id,
    method: 'DELETE',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(test),
    success: function () {
      window.location.reload(true)
      $('#editTest').modal('hide')
    }
  })
}

function testEdit (id,dataTable) {
  $.ajax({
    url: 'testList/' + id,
    method: 'GET',
    success: function (data) {
      console.log("===============")
      console.log(data)
      document.getElementById('testLabel').innerHTML = ' Edit scores for Test # ' + id

      $('#testEditModal').modal('show')

     var  editTestTable=dataTable
     console.log(editTestTable)
     editTestTable.clear().draw()


      for (var i = 0; i < data.studentScores.length; i++) {
        editTestTable.row.add([data.studentScores[i].name, `<input type ="number"
        class="testScore" id="input${data.studentScores[i].studentId}" placeholder="${data.studentScores[i].score}">`,
          `<a class="btn btn-default btn-sm js-score-edit" data-testId="${id}"
          data-id="${data.studentScores[i].studentId}" > Edit/Add </a>`,
          `<a class="btn btn-default btn-sm js-score-delete" data-testId="${id}"
            data-id="${data.studentScores[i].studentId}" > Delete </a>`]
        ).draw()
      }
      //displayTestTable(data.studentScores, id)
      //$('#testEditModal').modal('show')
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log('Status: ' + textStatus)
      console.log('Error: ' + errorThrown)
    }
  })
}

function statChart (id) {
  $.ajax({
    url: 'testList/' + id,
    method: 'GET',
    success: function (data) {
      document.getElementById('testStatLabel').innerHTML = ' Grade distribution for Test ' + id
      drawTestChart(data.testScores)
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log('Error: ' + errorThrown)
    }
  })
}

function drawTestChart (exam) {
  $('#statChart').modal('show')
  google.charts.load('current', {
    'packages': ['corechart']
  })
  google.charts.setOnLoadCallback(drawChart)

  function drawChart () {
    var grade = {}
    grade['A'] = 0
    grade['B'] = 0
    grade['C'] = 0
    grade['D'] = 0
    for (i = 0; i < exam.length; i++) {
      if (exam[i] < 70) {
        grade['D'] = grade['D'] + 1
      } else if (exam[i] < 80) {
        grade['C'] = grade['C'] + 1
      } else if (exam[i] < 90) {
        grade['B'] = grade['B'] + 1
      } else {
        grade['A'] = grade['A'] + 1
      }
    }
    var data = google.visualization.arrayToDataTable([
			['Grades', 'Number of students'],
			['Grade A', grade['A']],
			['Grade B', grade['B']],
			['Grade C', grade['C']],
			['Grade D', grade['D']]
    ])
    var screenSize = $(window).width()
    var chartWidth
    if (screenSize > 800) {
      chartWidth = 500
    } else {
      chartWidth = 300
    }

    var options = {
      pieSliceText:'none',
      title: 'Grades',
      'width': chartWidth,
      'height': 300,
      'is3D': true,
    }
    var chart = new google.visualization.PieChart(document.getElementById('curve_chart'))
    chart.draw(data, options)
  }
}

$(function () {
  $('#testDT').dataTable({
    'columnDefs': [{
      'orderable': false,
      'targets': 1
    },
    {
      'orderable': false,
      'targets': 2
    }]
  })

  var editTestTable = $('#testEditTable').DataTable({
    'paging': false,
    'class': 'display'
  })


  handleScoreDelete()
  handleScoreEdit()
  handleTestChart()
  handleTestEdit(editTestTable)
})
