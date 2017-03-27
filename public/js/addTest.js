function addTestScore (score) {
  $.ajax({
    method: 'POST',
    url: '/addTestScore',
    data: JSON.stringify(score),
    async: true,
    success: function (data) {
      displayMessage('Added test scored ')
    },
    dataType: 'json',
    contentType: 'application/json'
  })
  return false
}

function displayMessage (msg) {
  bootbox.confirm({
    message: msg,
    buttons: {
      confirm: {
        label: 'Add Next Test Scores',
        className: 'btn-success'
      },
      cancel: {
        label: 'Back to Test Stat',
        className: 'btn-primary'
      }
    },
    callback: function (result) {
      if (result === false) {
        window.location.href = '/testStat'
      } else {
        window.location.reload(true)
      }
    }
  })
}



function addTestScoreDB () {
  var testScores = []
  var table = document.getElementById('studentList')
  var testNumber = $(document.getElementById('testNumber')).attr('data-id')
  for (var r = 1, n = table.rows.length; r < n; r++) {
    element = table.rows[r].cells[1].innerHTML
    testScores.push([$(table.rows[r].cells[1].childNodes[0]).attr('data-id'), table.rows[r].querySelectorAll('.newScore')[0].value])
  }
  testScores.push(['testNumber', testNumber])
  addTestScore(testScores)
}

function handleAddTestScore () {
  $('#addScores').submit(function (e) {
    e.preventDefault()
    e.stopImmediatePropagation()
    addTestScoreDB()
  })
}

function validateAddScoreForm () {
  $('#addScores').bootstrapValidator({
    container: '#messagesAddScore',
    fields: {
      score: {
        validators: {
          notEmpty: {
            message: 'It cannot be empty'
          },
          numeric: {
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
  }).on('success.field.fv', function (e, data) {
    if (data.fv.getInvalidFields().length > 0) {
      data.fv.disableSubmitButtons(true)
    }
  })
}
$(function () {
  handleAddTestScore()
  validateAddScoreForm()
  $('#menu-toggle').click(function (e) {
    e.preventDefault()
    $('#wrapper').toggleClass('toggled')
  })
})
