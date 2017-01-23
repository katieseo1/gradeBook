const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const should = chai.should();
const configDB = require('../config/database.js');
const User = require('../app/models/user');
let TestScore = require('../app/models/testscore');
const {
	closeServer,
	runServer,
	app
} = require('../server');
var request = require('supertest')(app);
var supertest = require('supertest');
var agent = supertest.agent(app);
let cookie;
describe('Gradebook API TEST', function() {
	before(function() {
		//  tearDownDb();
		seedTestData();
		return runServer(configDB.mongoURI.test);
	});
	beforeEach(function() {
		//  return seedTestData();
	});
	afterEach(function() {
		//return tearDownDb();
	});
	after(function() {
		// tearDownDb();
		return closeServer();
	});

	describe('authenticate Test', function() {
		it('create a new user', function(done) {
			request.post('/signup').type('form').send({
				email: 'katie2',
				password: '000000'
			}).expect(302)
      .expect('Location', '/studentList')
      .expect('set-cookie', /connect.sid/)
      .end(function(err, res) {
				if (err) return done(err);
				cookie = res.headers['set-cookie']; //Setting the cookie
				return done();
			});
		});

		it('should be able to login and redirect ', function(done) {
			agent.post('/login').type('form').send({
				email: 'katie2',
				password: '000000'
			}).expect(302)
      .expect('Location', '/studentList')
      .expect('set-cookie', /connect.sid/)
      .end(function(err, res) {
				if (err) {
					return done(err);
				}
				cookie = res.headers['set-cookie']; //Setting the cookie
				return done();
			});
		});
	});

  describe('Gradebook end point', function() {



	it('Get list of student', function(done) {
			console.log("=============***********");

			request.get('/studentList').
			set('Cookie', cookie)
      .expect(200)
      .expect(function(res) {
        //console.log(res.text)

			})
      .end(done);
		});
	});


});

function seedTestData() {
	const seedData = [];
	for (let i = 1; i <= 10; i++) {
		seedData.push({
			local: {
				email: faker.internet.userName(),
				firstname: faker.name.firstName(),
				lastname: faker.name.firstName(),
				password: faker.internet.password(),
				usergroup: "student",
				grades: [{
					"testNumber": 1,
					"testScore": Math.floor((Math.random() * 100) + 1)
				}, {
					"testNumber": 2,
					"testScore": Math.floor((Math.random() * 100) + 1)
				}, {
					"testNumber": 3,
					"testScore": Math.floor((Math.random() * 100) + 1)
				}]
			}
		});
	}
	return User.insertMany(seedData);
}

function tearDownDb() {
	return new Promise((resolve, reject) => {
		console.warn('Deleting database');
		mongoose.connection.dropDatabase().then(result => resolve(result)).catch(err => reject(err))
	});
}
