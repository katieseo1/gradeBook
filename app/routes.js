let User = require('../app/models/user');
let TestScore = require('../app/models/testscore');

module.exports = function(app, passport) {

	// Home page
	app.get('/', function(req, res) {
		res.render('index.ejs', {
			message: req.flash('loginMessage')
		});
	});

	// StudentList page
	app.get('/studentList', isLoggedIn, function(req, res) {
		//User.find().exec().then(user => {
    User.find().where('local.usergroup').equals('student').exec().then(user => {

			res.render('studentList.ejs', {
				user: user
			});
		}).catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'Internal server error'
			});
		});
	});

  //List of tests????
	app.get('/testList', isLoggedIn, (req, res) =>{
		User.find().exec().then(user => {
			res.render('testList.ejs', {
				user: user
			});
		}).catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'Internal server error'
			});
		});
	});

  //Get a student's grade
	app.get('/getGrade/:id', isLoggedIn, (req, res) => {
		User.findById(req.params.id).exec().then(user => res.json(user.apiRepr())).catch(err => {
			console.error(err);
			res.status(500).json({
				error: 'something went horribly awry-get id'
			});
		});
	});


	//Get test statistic for a test
	app.get('/testStat/:id', isLoggedIn, (req, res) => {
		TestScore.find({
			'testNumber': req.params.id
		}, {
			score: req.params.id
		}).exec().then(tests => {
			console.log(tests);
			res.json(tests)
		}).catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'Internal server error'
			});
		});
	});


	//Test statistics
	app.get('/testStat', isLoggedIn, (req, res) => {
		TestScore.aggregate(
			[{
				$group: {
					_id: "$testNumber",
					avgScore: {
						$avg: "$score"
					}
				}
			}]).exec().then(tests => {
			res.render('testStat.ejs', {
				tests: tests
			});
		}).catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'Internal server error'
			});
		});
	});


	//Add Test
	app.get('/addTest', isLoggedIn, (req, res) =>{
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
	app.post('/addStudent', isLoggedIn, (req, res) => {
		const requiredFields = ['firstname', 'lastname'];
		requiredFields.forEach(field => {
			if (!(field in req.body)) {
				res.status(400).json({
					error: `Missing "${field}" in request body`
				});
			}
		});
		var newUser = new User();
		newUser.local.firstname = req.body.firstname;
		newUser.local.lastname = req.body.lastname;
    newUser.local.usergroup = "student";

		newUser.save(function(err) {});
	});

  // Add new test scores in User and create new scores in TestScore collection
	app.post('/addTestScore', isLoggedIn, (req, res) => {
		console.log(req.body);
		var testNumber = req.body[req.body.length - 2][1];
		let toUpdate2 = {};
		for (i = 0; i < req.body.length - 2; i++) {
			toUpdate2 = {};
			toUpdate2['local.grades'] = {
				"testNumber": testNumber,
				"testScore": req.body[i][1]
			};
			//Add to user table
			User.findByIdAndUpdate(req.body[i][0], {
				$push: toUpdate2
			}).exec().then(user => {
				res.status(204).end();
			}).catch(err => {
				console.error(err);
				res.status(500).json({
					error: 'something went horribly awry-get id'
				});
			});
			//Add to test table
			TestScore.create({
				testNumber: testNumber,
				date: new Date(),
				description: req.body[req.body.length - 1][1],
				userId: req.body[i][0],
				score: req.body[i][1]
			}).then().catch(err => {
				console.error(err);
				res.status(500).json({
					message: 'Internal server error'
				});
			});
		}
	});

	//Delete a student
	app.delete('/student/:id', isLoggedIn, (req, res) => {
		User.findByIdAndRemove(req.params.id).exec().then(user => res.status(204).end()).catch(err => res.status(500).json({
			message: 'Internal server error'
		}));
	});

	// Update a student info
	app.put('/student/:id', isLoggedIn, (req, res) => {
		// ensure that the id in the request path and the one in request body match
		if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
			const message = (`Request path id (${req.params.id}) and request body id ` + `(${req.body.id}) must match`);
			console.error(message);
			res.status(400).json({
				message: message
			});
		}
		const toUpdate = {};
		const updateableFields = ['local.firstname', 'local.lastname'];
		toUpdate['local.firstname'] = req.body['firstname'];
		toUpdate['local.lastname'] = req.body['lastname'];

		 User.findByIdAndUpdate(req.params.id, {$set: toUpdate})
       .exec()
       .then(user => res.status(204).end())
       .catch(err => res.status(500).json({message: 'Internal server error'}));
	});


	//Get a student info
	app.get('/student/:id', isLoggedIn, (req, res) => {
		User.findById(req.params.id).exec().then(user => res.json(user.apiRepr())).catch(err => {
			console.error(err);
			res.status(500).json({
				error: 'something went horribly awry-get id'
			});
		});
	});

	// logout
	app.get('/logout', (req, res) => {
		req.logout();
		res.redirect('/');
	});

  //Login
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/studentList', // redirect to the secure profile section
		failureRedirect: '/', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}));


	//signup page
	app.get('/signup', (req, res) =>{
		res.render('signup.ejs', {
			message: req.flash('signupMessage')
		});
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/studentList', // redirect to the secure profile section
		failureRedirect: '/signup', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}));

};
// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/');
}
