process.env.NODE_ENV = 'development';


var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var passport = require('passport');
const app = require('../server');


app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: false }));
require('../app/routes.js')(app, passport);



let User = require('../app/models/user');
let TestScore = require('../app/models/testscore');
//var should = require("should");
var db;
//require('../app/routes.js')(app, passport);

chai.use(chaiHttp);
var request = require('supertest');
var requestSuper = require('superagent');

before(function(done) {
 //db = mongoose.connect('mongodb://tst:abc@ds023932.mlab.com:23932/capstone_seo');
   done();
 });

 after(function(done) {
   mongoose.connection.close()
   done();
 });
//    request.agent(app)

describe('Sessions', function() {

var agent = chai.request.agent(app);
  it('Should create a ABC', function(done) {

agent.post('/login')
    .send({ username: 'katie', password: '000000' })
     .then(function(res){
             agent.get('/studentList')
                  .then(function(res2){
                      console.log(res2);
                      // should get status 200, which indicates req.session existence.
                      res2.should.have.status(200);
                      done();
     });
});
});
})



var agent = request.agent(app);

describe('Sessions', function() {

  it('Should create a session', function(done) {
    agent.post('/login')
    .send({ username: 'katie', password: '000000' })
    .end(function(err, res) {
      console.log(res.status);
      //expect(req.status).to.equal(201);
      done();
    });
  });

  it('Should return the current session', function(done) {
    agent.get('/studentList').end(function(err, res) {
      //expect(req.status).to.equal(200);
            console.log(res.status);
             console.log(res.body);

      done();
    });
  });
});



 var user1 = requestSuper.agent();
user1
  .post('http://localhost:8080/login')
  .send({ email: 'katie', password: '000000' })

  .end(function(err, res) {
  // console.log(err);
  //console.log(res.body);
  });


describe('Account', function() {




 /*beforeEach(function(done) {
 //create new user
  var teacher = new User({
    "local.email": '12345',
    "local.password": 'testy'
  });

  teacher.save(function(error) {
    if (error) console.log('error' + error.message);
    else console.log('no error');
    done();
   });
 });*/

 //Check if a registered user can be found
 it('find a user by username', function(done) {
    User.findOne({ "local.email" : '12345' }, function(err, user) {
      user.local.email.should.eql('12345');
      done();
    });
 });

  var cookie;

//
 describe('GET /api/getDir', function(){
    it('login', loginUser());

    it('uri that requires user to be logged in', function(done){
    request.agent(app)
        .get('/studentList')
        //.expect('Location', '/studentList')

        .end(function(err, res){
              cookie = res.headers['set-cookie'];

            if (err) return done(err);
            //console.log(res);
            //console.log(res.body);
            done()
        });
    });
});


function loginUser() {
    return function(done) {
    request.agent(app)
            .post('/login')
            //.set('Content-Type',  'application/json') //<-- again, I'm getting tired
            .send({ "email": 'katie', "password": '000000' })
            .expect(302)
            .expect('Location', '/studentList')
            .end(onResponse);

        function onResponse(err, res) {
              cookie = res.headers['set-cookie'];

          console.log(err);
           if (err) return done(err);
           return done();
        }
    };
};


 });
