$('#menu-toggle').click(function (e) {
  e.preventDefault()
  $('#wrapper').toggleClass('toggled')
})

function deleteStudent (id) {
  $.ajax({
    url: 'student/' + id,
    method: 'DELETE',
    success: function (data) {
      bootbox.alert({
    message: "Deleted Student",
    callback: function () {
        window.location.reload(true)
        }
      })
    }
  })
}

function handleStudentDelete () {
  $('.studentTable').on('click', '.js-student-delete', function (e) {
    e.preventDefault()
    deleteStudent($(e.currentTarget).closest('.js-student-delete').attr('data-id'))
  })
}

function editStudent (id, lastname, firstname) {
  $('#editFirstName').val(firstname)
  $('#editLastName').val(lastname)
  $('#editInput').modal()
  $('#editInput').submit(function (e) {
    e.preventDefault()
    $('#editInput').modal('hide')
    updateStudent({
      id: id,
      firstname: $(e.currentTarget).find('#editFirstName').val().trim(),
      lastname: $(e.currentTarget).find('#editLastName').val().trim()
    })
  })
}

function updateStudent (student) {
  $.ajax({
    url: 'student/' + student.id,
    method: 'PUT',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(student),
    success: function (data) {
      bootbox.alert({
    message: "Updated student information!",
    callback: function () {
        window.location.reload(true)
        }
      })
    }
  })
}

function handleStudentEdit () {
  $('.studentTable').on('click', '.js-student-edit', function (e) {
    e.preventDefault()
    editStudent($(e.currentTarget).closest('.js-student-edit').attr('data-id'), $(e.currentTarget).closest('.js-student-edit').attr('data-lastName'), $(e.currentTarget).closest('.js-student-edit').attr('data-firstName'))
  })
}

function addStudent (student) {
  $.ajax({
    method: 'POST',
    url: '/addStudent',
    data: JSON.stringify(student),
      success: function (data) {
        bootbox.alert({
      message: "Added New Student",
      callback: function () {
          window.location.reload(true)
          }
        })
    },
    dataType: 'json',
    contentType: 'application/json'
  })
}

function handleAddStudent () {
  $('#addStudentForm').submit(function (e) {
    e.preventDefault()
    e.stopImmediatePropagation()
    $('#addStudent').modal('hide')
    addStudent({
      firstname: $(e.currentTarget).find('#firstname').val().trim(),
      lastname: $(e.currentTarget).find('#lastname').val().trim()
    })
  })
}

function handleStudentProgress () {
  $('.studentTable').on('click', '.js-student-progress', function (e) {
    e.preventDefault()
    progressChart($(e.currentTarget).closest('.js-student-progress').attr('data-id'))
    $('#progessChart').modal('show')
  })
}

function progressChart (id) {
  $.ajax({
    url: 'getGrade/' + id,
    method: 'GET',
    success: function (data) {
      document.getElementById('studentProgressLabel').innerHTML = 'Progress Information for ' + data.user.firstname + ' ' + data.user.lastname
      drawGradeChart(data.user.grades)
    }
  })
}

function drawGradeChart (studentGrade) {
  google.charts.load('current', {
    'packages': ['corechart']
  })

  studentGrade.sort(function(a, b) {
    return parseInt(a.testNumber) - parseInt(b.testNumber);
  });
  google.charts.setOnLoadCallback(drawChart)

  function drawChart () {
    var data = new google.visualization.DataTable()
    data.addColumn('string', 'Test')
    data.addColumn('number', 'Score')
    data.addRows(studentGrade.length)
    for (i = 0; i < studentGrade.length; i++) {
      data.setCell(i, 0, 'Test' + Number(studentGrade[i].testNumber))
      data.setCell(i, 1, Number(studentGrade[i].testScore))
    }

    var screenSize = $(window).width()
    var chartWidth
    if (screenSize > 800) {
      chartWidth = 530
    } else {
      chartWidth = 350
    }

    var options = {
      title: 'Test Score',
      curveType: 'function',
      legend: {
        position: 'bottom'
      },
      'width': chartWidth,
      'height': 400
    }
    var chart = new google.visualization.ColumnChart(document.getElementById('curve_chart'))
    chart.draw(data, options)
  }
}

function validateEditStudentForm () {
  $('#editPost').bootstrapValidator({
    container: '#messagesEdit',
    fields: {
      editFirstName: {
        validators: {
          notEmpty: {
            message: 'The  name is required and cannot be empty'
          }
        }
      },
      editLastName: {
        validators: {
          notEmpty: {
            message: 'The  name is required and cannot be empty'
          }
        }
      }
    }
  }).on('success.field.fv', function (e, data) {
    if (data.fv.getInvalidFields().length > 0) {
      data.fv.disableSubmitButtons(true)
    }
  })
}

function validateAddStudentForm () {
  $('#addStudentForm').bootstrapValidator({
    container: '#messagesAddStudent',
    fields: {
      firstname: {
        validators: {
          notEmpty: {
            message: 'The  name is required and cannot be empty'
          }
        }
      },
      lastname: {
        validators: {
          notEmpty: {
            message: 'The  name is required and cannot be empty'
          }
        }
      }
    }
  }).on('success.field.fv', function (e, data) {
    if (data.fv.getInvalidFields().length > 0) {
      data.fv.disableSubmitButtons(true)
    }
  })
}
$(function () {
  $('#studentListDT').dataTable({
    'columnDefs': [{
      'orderable': false,
      'targets': 1
    }, {
      'orderable': false,
      'targets': 2
    }, {
      'orderable': false,
      'targets': 3
    }]
  })
  handleAddStudent()
  handleStudentDelete()
  handleStudentEdit()
  handleStudentProgress()
  validateEditStudentForm()
  validateAddStudentForm()
})
