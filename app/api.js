require('es6-promise').polyfill()
require('isomorphic-fetch')
const express = require('express')
const app = express()
const User = require('../app/models/user')
const mongoose = require('mongoose')
module.exports = function (app) {
	// Display errors
  function errMsg (err, res) {
    console.log(err)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
	// Get a list of students
  app.get('/api/studentList', (req, res) => {
    User.find().where('local.usergroup').equals('student').exec().then(user => {
      res.json(user.map(user => user.apiRepr()))
    }).catch(err => errMsg(err, res))
  })
	// Get a student's grade
  app.get('/api/getGrade/:id', (req, res) => {
    let id = mongoose.Types.ObjectId(req.params.id)
    User.findById(id).exec().then(user => {
      res.json({
        user: user.apiRepr()
      })
    }).catch(err => errMsg(err, res))
  })
	// Get a test list with avg scores
  app.get('/api/testStat', (req, res) => {
    let maxTstNumber = 0
    let sum = {}
    User.find().where('local.usergroup').equals('student').exec().then(user => {
      for (i = 0; i < user.length; i++) {
        if (maxTstNumber < user[i].local.grades.length) {
          maxTstNumber = user[i].local.grades.length
        }
      }
      res.json({
        user: user,
        stat: calculateAvg(maxTstNumber, user)
      })
    }).catch(err => errMsg(err, res))
  })
	// Get a test distribution
  app.get('/api/testList/:id', (req, res) => {
    let testId = req.params.id
    let testScores = []
    let studentScores = []
    let testExist = false
    User.find().where('local.usergroup').equals('student').exec().then(user => {
      for (i = 0; i < user.length; i++) {
        obj = {}
        testExist = false
        obj['name'] = user[i].local.firstname + ' ' + user[i].local.lastname
        obj['studentId'] = mongoose.Types.ObjectId(user[i].id)

        if (user[i].local.grades.length != 0) {
          cnt += 1
          for (k = 0; k < user[i].local.grades.length; k++) {
            if (user[i].local.grades[k].testNumber == testId) {
              testExist=true
              testScores.push(user[i].local.grades[k].testScore)
              obj['score'] = user[i].local.grades[k].testScore
            }
          }
          if(testExist===false){
            obj['score'] = 'No Test Score'
          }
        }
        // A student with no test score
        else{
          obj['score'] = 'No Test Score'
        }
        studentScores.push(obj)

      }
      res.json({
        studentScores: studentScores,
        testScores: testScores
      })
    }).catch(err => errMsg(err, res))
  })
	// Prepare a page for adding test score
  app.get('/api/addTest', (req, res) => {
    User.find().where('local.usergroup').equals('student').exec().then(user => {
      let nextTestNumber = 0
      let currMax = 0
      for (i = 0; i < user.length; i++) {
        if (typeof user[i].local.grades[user[i].local.grades.length - 1] !== 'undefined') {
          currMax = user[i].local.grades[user[i].local.grades.length - 1].testNumber
          if (nextTestNumber <= currMax) {
            nextTestNumber = currMax
          }
        }
      }
      res.status(200).json({
        user: user,
        nextTestNumber: nextTestNumber + 1
      })
    }).catch(err => errMsg(err, res))
  })
	//* ******POST ENDPOINT*******************//
	// Add student
  app.post('/api/addStudent', (req, res) => {
    const requiredFields = ['firstname', 'lastname']
    requiredFields.forEach(field => {
      if (!(field in req.body)) {
        res.status(400).json({
          error: `Missing '${field}' in request body`
        })
      }
    })
    User.create({
      local: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        usergroup: 'student'
      }
    }).then(user => {
      res.json(user.apiRepr())
    }).catch(err => errMsg(err, res))
  })
	// Add new test scores of to users (API for testing purpose)
  app.post('/api/addTestScore2', (req, res) => {
    var testNumber = req.body[req.body.length - 1][1]
    let toUpdate2 = {}
    for (i = 0; i < req.body.length - 1; i++) {
      toUpdate2 = {}
      toUpdate2['local.grades'] = {
        'testNumber': testNumber,
        'testScore': req.body[i][1]
      }
      User.findByIdAndUpdate(req.body[i][0], {
        $push: toUpdate2
      }, {
        new: true
      }).exec().then(user => {
        res.json(user.apiRepr()).end()
      }).catch(err => errMsg(err, res))
    }
  })

	// Add new test scores of to users
  app.post('/api/addTestScore', (req, res) => {
    let testNumber = req.body[req.body.length - 1][1]
    let toUpdate2 = {}
    let id = null
    for (i = 0; i < req.body.length - 1; i++) {
      id = mongoose.Types.ObjectId(req.body[i][0])
      toUpdate2 = {}
      toUpdate2['local.grades'] = {
        'testNumber': testNumber,
        'testScore': req.body[i][1]
      }
      User.findByIdAndUpdate(id, {
        $push: toUpdate2
      }, {
        new: true
      }).exec().then(user => {
        console.log(user)
      }).catch(err => errMsg(err, res))
    }
  })
	//* ******PUT ENDPOINT*******************//
	// Update a student info
  app.put('/api/student/:id', (req, res) => {
    let id = mongoose.Types.ObjectId(req.params.id)
    const toUpdate = {}
    const updateableFields = ['local.firstname', 'local.lastname']
    toUpdate['local.firstname'] = req.body['firstname']
    toUpdate['local.lastname'] = req.body['lastname']
    User.findByIdAndUpdate(id, {
      $set: toUpdate
    }, {
      new: true
    }).exec().then(user => res.json(user.apiRepr()).end()).catch(err => errMsg(err, res))
  })
	// Update test score
  app.put('/api/testList/:id', (req, res) => {
    console.log(req.body)
    const toUpdate = {}
    let origScore = []
    let index = null
    let testNum = parseInt(req.body.testNumber)
    let testScore = parseInt(req.body.testScore)
    User
		.findById(req.params.id)
		.exec()
		.then(user => {
      console.log(req.body)
  origScore = user.local.grades
  //new student
  if(origScore.length===0){
    console.log("new User")
    origScore=[{'testNumber':testNum,'testScore':testScore}]
  }
  //updating an existing student score
  else{
    for (i = 0; i < origScore.length; i++) {
      if (origScore[i].testNumber == testNum) {
        index = i
        origScore[i].testScore = testScore
      }
    }
    //exisitng student with no test score
    if(index===null){
      origScore=[{'testNumber':testNum,'testScore':testScore}]
    }
  }
  //no test number
  console.log(origScore)
  toUpdate['local.grades'] = origScore
  User.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), {
    $set: toUpdate
  }, {
    new: true,
    upsert: true
  }).exec().then(user => {
    console.log('after========')
    console.log(user)
    res.json({
      user: user
    })
  }).catch(err => errMsg(err, res))
}).catch(err => errMsg(err, res))
  })
	//* ******DELETE ENDPOINT*******************//
	// Delete a student
  app.delete('/api/student/:id', (req, res) => {
    let id = mongoose.Types.ObjectId(req.params.id)
    User.findByIdAndRemove(id).exec().then(user => res.status(204).end()).catch(err => errMsg(err, res))
  })
	// Delete a score of the test
  app.delete('/api/testList/:id', (req, res) => {
    const toUpdate = {}
    let origScore = []
    let testNum = parseInt(req.body.testNumber)
    let testScore = parseInt(req.body.testScore)
    User
		.findById(req.params.id)
		.exec()
		.then(user => {
  origScore = user.local.grades
  for (i = 0; i < origScore.length; i++) {
    if (origScore[i].testNumber == testNum) {
      origScore.splice(i, 1)
    }
  }
  toUpdate['local.grades'] = origScore
  User.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), {
    $set: toUpdate
  }, {
    new: true
  }).exec().catch(err => res.status(500).json({
    message: 'Internal server error'
  }))
  res.status(204).json({
    user: user.apiRepr()
  })
}).catch(err => errMsg(err, res))
  })
	// Calculate Avg score for each Test
  function calculateAvg (maxTstNumber, user) {
    let stat = []
    let examObj
    for (j = 1; j <= maxTstNumber; j++) {
      examObj = {}
      sum = 0
      cnt = 0
      for (i = 0; i < user.length; i++) {
        if (user[i].local.grades.length != 0) {
          cnt += 1
          for (k = 0; k < user[i].local.grades.length; k++) {
            if (user[i].local.grades[k].testNumber == j) {
              sum += user[i].local.grades[k].testScore
            }
          }
        }
      }
      examObj['testId'] = j
      examObj['avg'] = sum / cnt
      stat.push(examObj)
    }
    return stat
  }
}
