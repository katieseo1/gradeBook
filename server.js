const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const dotenv = require('dotenv').load();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const DATABASE_URL = process.env.dev;
require('./config/passport')(passport); // pass passport for configuration

app.use(express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
// set up our express application
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
// ejs for templating
app.set('view engine', 'ejs');
// required for passport
app.use(session({
	secret: 'sessionscretgradebookthinkful',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./app/routes.js')(app, passport);
require('./app/api.js')(app);

function runServer(databaseUrl) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				if (mongoose.connection.readyState == 1) {}
				resolve();
			}).on('error', err => {
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}
if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
};
module.exports = {
	runServer,
	app,
	closeServer
};
console.log('Listening ' + port);
