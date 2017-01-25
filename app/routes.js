let User = require('../app/models/user');
let TestScore = require('../app/models/testscore');
const queryable = require('query-objects');
module.exports = function(app) {

	// Home page
	app.get('/', function(req, res) {
		res.render('index.ejs', {
			message: req.flash('loginMessage')
		});
	});

	// StudentList page
	app.get('/studentList', function(req, res) {
		User.find().where('local.usergroup').equals('student').exec().then(user => {
			res.json(user.map(user => user.apiRepr()));
		}).catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'Internal server error'
			});
		});
	});


	//List of tests with avg score
	app.get('/testList', (req, res) => {
		let maxTstNumber = 0;
		let sum = {};
		User.find().where('local.usergroup').equals('student').exec().then(user => {
			for (i = 0; i < user.length; i++) {
				if (maxTstNumber < user[i].local.grades.length) {
					maxTstNumber = user[i].local.grades.length;
				}
			}
			let stat = [];
			let examObj;
			for (j = 1; j <= maxTstNumber; j++) {
				examObj = {};
				sum = 0;
				cnt = 0;
				for (i = 0; i < user.length; i++) {
					if (user[i].local.grades.length != 0) {
						cnt += 1;
						for (k = 0; k < user[i].local.grades.length; k++) {
							if (user[i].local.grades[k].testNumber == j) {
								sum += user[i].local.grades[k].testScore;
							}
						}
					}
				}
				examObj['testId'] = j;
				examObj['avg'] = sum / cnt;
				stat.push(examObj);
			}
			res.json({
				user: user.map(user => user.apiRepr()),
				stat: stat
			});
		}).catch(err => {
			console.error(err);
			res.status(500).json({
				message: err
			});
		});
	});

	//Get a student's grade
	app.get('/getGrade/:id', (req, res) => {
		User.findById(req.params.id).exec().then(user => res.json(user.apiRepr())).catch(err => {
			console.error(err);
			res.status(500).json({
				error: 'something went horribly awry-get id'
			});
		});
	});

	//Get test statistic for a test
	app.get('/testList/:id', (req, res) => {
		User.find().where('local.usergroup').equals('student').exec().then(user => {
			let testId = req.params.id;
			let testScores = [];
				for (i = 0; i < user.length; i++) {
					if (user[i].local.grades.length != 0) {
						cnt += 1;
						for (k = 0; k < user[i].local.grades.length; k++) {
							if (user[i].local.grades[k].testNumber == testId) {
								testScores.push (user[i].local.grades[k].testScore);
							}
						}
					}
			}
			res.json({
				user: user.map(user => user.apiRepr()),
				testScores: testScores
			});
		}).catch(err => {
			console.error(err);
			res.status(500).json({
				message: err
			});
		});
	});

	app.get('/addTest', (req, res) => {
		User.find().where('local.usergroup').equals('student').exec().then(user => {
			res.render('testScore.ejs', {
				user: user
			});
		}).catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'Internal server error'
			});
		});
	});


	//Add student
	app.post('/addStudent', (req, res) => {
		const requiredFields = ['firstname', 'lastname'];
		requiredFields.forEach(field => {
			if (!(field in req.body)) {
				res.status(400).json({
					error: `Missing "${field}" in request body`
				});
			}
		});
		User.create({
			local: {
				firstname: req.body.firstname,
				lastname: req.body.lastname,
				usergroup: "student"
			}
		}).then(user => {
			res.json(user.apiRepr());
		}).catch(err => {
			console.error(err);
			res.status(500).json({
				error: 'Something went wrong'
			});
		});

	});

	// Add new test scores in User and create new scores in TestScore collection
	app.post('/addTestScore', (req, res) => {
		console.log(req.body);
		var testNumber = req.body[req.body.length - 1][1];
		let toUpdate2 = {};
		for (i = 0; i < req.body.length - 1; i++) {
			toUpdate2 = {};
			toUpdate2['local.grades'] = {
				"testNumber": testNumber,
				"testScore": req.body[i][1]
			};

			User.findByIdAndUpdate(req.body[i][0], {
				$push: toUpdate2
			},{
				new: true
			}
		).exec().then(user => {
				res.json(user.apiRepr()).end();
			}).catch(err => {
				console.error(err);
				res.status(500).json({
					error: 'something went horribly awry-get id'
				});
			});

		}
	});

	//Delete a student
	app.delete('/student/:id', (req, res) => {
		User.findByIdAndRemove(req.params.id).exec().then(user => res.status(204).end()).catch(err => res.status(500).json({
			message: 'Internal server error'
		}));
	});


	// Update a student info
	app.put('/student/:id', (req, res) => {
		// ensure that the id in the request path and the one in request body match
		if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
			const message = (`Request path id (${req.params.id}) and request body id ` + `(${req.body.id}) must match`);
			console.error(message);
			res.status(400).json({
				message: message
			});
		}
		const toUpdate = {};
		toUpdate['local.firstname'] = req.body.firstname;
		toUpdate['local.lastname'] = req.body.lastname;
		User.findByIdAndUpdate(req.params.id, {
			$set: toUpdate
		}, {
			new: true
		}).exec().then(user => {
			res.json(user.apiRepr()).end();
		}).catch(err => res.status(500).json({
			message: 'Internal server error'
		}));
	});

	//Update test score
	app.put('/testList/:id', (req, res) => {
		const toUpdate = {};
		toUpdate['local.grades'] = {
			"testNumber": req.body.testNumber,
			"testScore": req.body.testScore
		};

		User.findByIdAndUpdate(req.params.id, {
			$set: toUpdate
		}, {
			new: true
		}).exec().then(user => {
			res.json(user.apiRepr()).end();
		}).catch(err => res.status(500).json({
			message: 'Internal server error'
		}));
	});


	//Get a student info
	app.get('/student/:id', (req, res) => {
		User.findById(req.params.id).exec().then(user => res.json(user.apiRepr())).catch(err => {
			console.error(err);
			res.status(500).json({
				error: 'something went horribly awry-get id'
			});
		});
	});

};
