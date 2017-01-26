
const express  = require('express');
const app      = express();
const port     = process.env.PORT || 8080;
const mongoose = require('mongoose');
const passport = require('passport');
const flash    = require('connect-flash');
const  dotenv = require('dotenv').load();

const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');

require('./config/passport')(passport); // pass passport for configuration


const DATABASE_URL = process.env.dev;

app.use(express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// set up our express application
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
  console.log(databaseUrl);

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }

      server = app.listen(port, () => {
        console.log(databaseUrl);
        if(mongoose.connection.readyState==1){
        console.log("DB connected");
      }
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}


function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server===');
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
  console.log("running");
};

module.exports = {runServer, app, closeServer};


console.log('Listening ' + port);
