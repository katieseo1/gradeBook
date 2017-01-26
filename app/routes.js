require('es6-promise').polyfill();
require('isomorphic-fetch');
const User = require('../app/models/user');
const apiURL = 'http://localhost:8080/api/';

module.exports = function(app, passport) {
	//Display error message
	function errMsg(res) {
		if (res.status >= 400) {
			throw new Error("Bad response from server");
		}
	}

	// Home page
	app.get('/', function(req, res) {
		res.render('index.ejs', {
			message: req.flash('loginMessage')
		});
	});

	//Get a list of students
	app.get('/studentList', isLoggedIn, function(req, res) {
		fetch(apiURL + 'studentList').then(function(res) {
			errMsg(res);
			return res.json();
		}).then(function(user) {
			res.render('studentList.ejs', {
				user: user
			});
		});
	});

	//Get a student's grades
	app.get('/getGrade/:id', isLoggedIn, (req, res) => {
		fetch(apiURL + 'getGrade/' + req.params.id).then(function(res) {
			errMsg(res);
			return res.json();
		}).then(function(user) {
			res.json(user);
		});
	});

	//Add student
	app.post('/addStudent', isLoggedIn, (req, res) => {
		fetch(apiURL + 'addStudent/', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req.body)
		}).then(function(res) {
			errMsg(res);
			return res.json();
		})
	});

	// Update a student info
	app.put('/student/:id', isLoggedIn, (req, res) => {
		fetch(apiURL + 'student/' + req.params.id, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req.body)
		}).then(function(res) {
			errMsg(res);
			return res.json();
		}).then(function(user) {
			res.json(user);
		});
	});

	//Delete a student
	app.delete('/student/:id', isLoggedIn, (req, res) => {
		fetch(apiURL + 'student/' + req.params.id, {
			method: 'DELETE'
		}).then(function(res) {
			errMsg(res);
			return res.json();
		}).then(function(user) {
			res.json(user);
		});
	});
	// ??????????? Get a student info
	/*
	app.get('/student/:id', isLoggedIn, (req, res) => {
		User.findById(req.params.id).exec().then(user => res.json(user.apiRepr())).catch(err => {
			console.error(err);
			res.status(500).json({
				error: 'something went horribly awry-get id'
			});
		});
	});
*/
	//Get test distribution for a test
	app.get('/testList/:id', isLoggedIn, (req, res) => {
		fetch(apiURL + 'testList/' + req.params.id).then(function(res) {
			errMsg(res);
			return res.json();
		}).then(function(data) {
			res.json({
				testScores: data.testScores,
				studentScores: data.studentScores,
			})
		});
	});

	//Update test score
	app.put('/testList/:id', isLoggedIn, (req, res) => {
		fetch(apiURL + 'testList/' + req.params.id, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req.body)
		}).then(function(res) {
			errMsg(res);
			return res.json();
		}).then(function(user) {
			res.json(user);
		});
	});

	//Delete a score of the teset
	app.delete('/testList/:id', isLoggedIn, (req, res) => {
		fetch(apiURL + 'testList/' + req.params.id, {
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req.body)
		}).then(function(res) {
			errMsg(res);
			return res.json();
		}).then(function(user) {
			res.json(user);
		});
	});

	//List of tests with avg score
	app.get('/testStat', isLoggedIn, (req, res) => {
		fetch(apiURL + 'testStat').then(function(res) {
			errMsg(res);
			return res.json();
		}).then(function(data) {
			console.log(data);
			res.render('testStat.ejs', {
				user: data.user,
				stat: data.stat
			});
		});
	});

	//Prepare the page for adding test scores
	app.get('/addTest', isLoggedIn, (req, res) => {
		fetch(apiURL + 'addTest').then(function(res) {
			errMsg(res);
			return res.json();
		}).then(function(data) {
			res.render('addTestScores.ejs', {
				user: data.user,
				nextTestNumber: data.nextTestNumber + 1
			});
		});
	});

	// Add new scores for a test
	app.post('/addTestScore', isLoggedIn, (req, res) => {
		console.log(req.body);
		fetch(apiURL + 'addTestScore/', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req.body)
		}).then(function(res) {
			errMsg(res);
			return res.json();
		}).then(function(user) {
			res.json(user);
		});
	});

	//=============authentication===========//
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
	app.get('/signup', (req, res) => {
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
