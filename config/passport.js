var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');

//Session setup
module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// Deserialize the user
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, (req, email, password, callback) =>{
		if (email) {
      email = email.toLowerCase();
    }
		process.nextTick(function() {
			User.findOne({
				'local.email': email
			}, (err, user) =>{
				if (err){
           return callback(err);
        }
				if (!user){
           return callback(null, false, req.flash('loginMessage', 'No user found.'));
        }
				if (!user.validPassword(password)) {
          return callback(null, false, req.flash('loginMessage', ' Wrong password.'));
        }
				else {
          return callback(null, user);
        }
			});
		});
	}));
	//signup
	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, (req, email, password, callback) =>{

		if (email){
     email = email.toLowerCase();
   }
		process.nextTick(function() {
			//check for existing user
			if (!req.user) {
				User.findOne({
					'local.email': email
				}, (err, user) =>{
					// check for existing user
					if (user) {
						return callback(null, false, req.flash('signupMessage', 'That email is already taken.'));
					} else {
						// create new user
						var newUser = new User();
						newUser.local.email = email;
						newUser.local.firstname = req.body.firstname;
						newUser.local.lastname = req.body.lastname;
						newUser.local.password = newUser.generateHash(password);
						newUser.save(function(err) {
							if (err) {
								console.log('Error in Saving user: ' + err);
								throw err;
							}
							console.log('User Registration succesful');
							return callback(null, newUser);
						});
					}
				});
			}
		});
	}));
};
