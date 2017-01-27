const dotenv = require('dotenv').load();
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const should = chai.should();
const TEST_DATABASE_URL = process.env.tst;
const User = require('../app/models/user');
const numOfSeedData = 3;
const {
	closeServer,
	runServer,
	app
} = require('../server');
chai.use(chaiHttp);
let seedData = [];
let stat = [];
describe('Gradebook API resource', function() {
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});
	beforeEach(function() {
		return seedTestData();
	});
	afterEach(function() {
		return tearDownDb();
	});
	after(function() {
		return closeServer();
	});
	//Get endpoint for addTest & student
	describe('GET endpoint', function() {
		it('should return all existing posts', function() {
			let res;
			return chai.request(app).get('/api/studentList').then(_res => {
				res = _res;
				res.should.have.status(200);
				res.body.should.have.length.of.at.least(1);
				return User.count().where('local.usergroup').equals('student');
			}).then(count => {
				res.body.should.have.length.of(count);
			});
		});
		it('should return posts with right fields', function() {
			//  Get back all students, and ensure they have expected keys
			let resStudentList;
			return chai.request(app).get('/api/studentList').then(function(res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('array');
				res.body.should.have.length.of.at.least(1);
				res.body.forEach(function(student) {
					student.should.be.a('object');
					student.should.include.keys('id', 'usergroup', 'email', 'firstname', 'lastname', 'grades');
				});
				resStudentList = res.body[0];
				return User.findById(resStudentList.id).exec();
			}).then(student => {
				resStudentList.usergroup.should.equal(student.local.usergroup);
				resStudentList.firstname.should.equal(student.local.firstname);
				resStudentList.lastname.should.equal(student.local.lastname);
			});
		});
		it('should get grades of a student', function() {
			//  Get back grades of a student, and ensure they have expected data type
			return User.findOne().exec().then(user => {
				return chai.request(app).get(`/api/getGrade/${user.id}`);
			}).then(res => {
				res.should.be.json;
				res.body.should.be.a('object');
			})
		});
		it('should return test stat', function() {
			//  prove test stat we got back is equal to the stat from seeded data.
			let res;
			return chai.request(app).get('/api/testStat').then(_res => {
				res = _res;
				res.should.have.status(200);
				res.body.stat.should.have.length.of.at.least(1);
				//Calculated avg score is equal to the avg from DB
				res.body.stat[0].avg.should.equal(getStat(seedData)[0].avg);
			})
		});
		it('should get scores for a test', function() {
			//prove the number scores of a test we got back is equal to the number of scores
			// from seeded data for db
			return User.findOne().exec().then(user => {
				return chai.request(app).get(`/api/testList/1`);
			}).then(res => {
				res.should.be.json;
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.testScores.length.should.equal(getTestScore(seedData, 1).length);
				res.body.testScores[0].should.equal(getTestScore(seedData, 1)[0]);
			})
		});
		// Should return next test number from the test number we got back
		it('should return next test number', function() {
			let res;
			return chai.request(app).get('/api/addTest').then(_res => {
				res = _res;
				res.should.have.status(200);
				//Next test number should be 4 based on seed data
				res.body.nextTestNumber.should.equal(numOfSeedData + 1);
			})
		});
	});

	//********************* POST ENDPOINT **************//
	describe('POST endpoint', function() {
		this.timeout(5000);
		let newStudent;
		//  Find new student from DB from the data we sent over
		it('should add a student', function() {
			newStudent = {
				firstname: faker.name.firstName(),
				lastname: faker.name.lastName()
			};
			return chai.request(app).post('/api/addStudent').send(newStudent).then(function(res) {
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.id.should.not.be.null;
				return User.findById(res.body.id).exec();
			}).then(student => {
				student.local.firstname.should.equal(newStudent.firstname);
				student.local.lastname.should.equal(newStudent.lastname);
			});
		});
		// Compare the test score we sent over with a score of the student in DB
		it('should add test scores', function() {
			let testScores = [];
			let aUserId;
			let numOfGrades;
			return User.findOne().exec().then(user => {
				testScores.push([user.id, 100])
				testScores.push(["testNumber", 99]);
				numOfGrades = user.local.grades.length + 1;
				aUserId = user.id;
				return chai.request(app).post(`/api/addTestScore2`).send(testScores);
			}).then(res => {
				return User.findById(aUserId).exec().then(user => {
					user.local.grades.should.have.length(numOfGrades);
					user.local.grades[numOfGrades - 1].testNumber.should.equal(99);
				});
			});
		});
	});
	describe('PUT endpoint', function() {
		// From an existing student returned by request contains data we sent
		it('should update fields we send over (Updating a student)', function() {
			const updateData = {
				firstname: 'foo',
				lastname: 'bar'
			};
			return User.findOne().exec().then(user => {
				updateData.id = user.id;
				return chai.request(app).put(`/api/student/${user.id}`).send(updateData);
			}).then(res => {
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.firstname.should.equal(updateData.firstname);
				res.body.lastname.should.equal(updateData.lastname);
			});
		});
		//  Prove an existing test returned by request contains the same data we sent
		it('should update test score we send over', function() {
			const updateData = {
				testNumber: 1,
				testScore: 100
			};
			return User.findOne().exec().then(user => {
				updateData.id = user.id;
				return chai.request(app).put(`/api/testList/${user.id}`).send(updateData);
			}).then(res => {
				res.body.should.be.a('object');
				res.body.user.local.grades[0].testScore.should.equal(updateData.testScore);
			})
		});
	});
	//Delete a student by id and check if the student still exists in the db
	describe('DELETE endpoint', function() {
		it('should delete a student by id', function() {
			let stu;
			return User.findOne().exec().then(_stu => {
				stu = _stu;
				return chai.request(app).delete(`/api/student/${stu.id}`);
			}).then(res => {
				res.should.have.status(204);
				return User.findById(stu.id);
			}).then(_stu => {
				should.not.exist(_stu);
			});
		});
		//Delete a score of the student and compare the number of scores of the student in DB (should be one less)
		it('should delete a score of test', function() {
			const deleteData = {
				testNumber: 1
			};
			return User.findOne().exec().then(user => {
				deleteData.id = user.id;
				deleteData.testScore = user.local.grades[0].testScore;
				deleteData.numOfScores = user.local.grades.length;
				return chai.request(app).delete(`/api/testList/${user.id}`).send(deleteData);
			}).then(res => {
				res.should.have.status(204);
				return User.findById(deleteData.id).exec().then(user => {
					user.local.grades.length.should.equal(deleteData.numOfScores - 1);
				});
			});
		});
	});
});
// deletes the entire database
function tearDownDb() {
	return new Promise((resolve, reject) => {
		console.warn('Deleting database');
		mongoose.connection.dropDatabase().then(result => resolve(result)).catch(err => reject(err))
	});
}
//Use Faker library to populate test data
function seedTestData() {
	seedData = [];
	stat = [];
	for (let i = 1; i <= numOfSeedData; i++) {
		seedData.push({
			local: {
				email: faker.internet.userName(),
				firstname: faker.name.firstName(),
				lastname: faker.name.firstName(),
				password: faker.internet.password(),
				usergroup: 'student',
				grades: [{
					'testNumber': 1,
					'testScore': Math.floor((Math.random() * 100) + 1)
				}, {
					'testNumber': 2,
					'testScore': Math.floor((Math.random() * 100) + 1)
				}, {
					'testNumber': 3,
					'testScore': Math.floor((Math.random() * 100) + 1)
				}]
			}
		});
	}
	return User.insertMany(seedData);
}
// get test scores
function getTestScore(seedData, testId) {
	let testScores = [];
	for (i = 0; i < seedData.length; i++) {
		if (seedData[i].local.grades) {
			cnt += 1;
			for (k = 0; k < seedData[i].local.grades.length; k++) {
				if (seedData[i].local.grades[k].testNumber == testId) {
					testScores.push(seedData[i].local.grades[k].testScore);
				}
			}
		}
	} //for looop
	return testScores;
}
//get stat
function getStat(seedData) {
	let maxTstNumber = 0;
	for (i = 0; i < seedData.length; i++) {
		if (maxTstNumber < seedData[i].local.grades.length) {
			maxTstNumber = seedData[i].local.grades.length;
		}
	}
	let stat = [];
	let examObj;
	for (j = 1; j <= maxTstNumber; j++) {
		examObj = {};
		sum = 0;
		cnt = 0;
		for (i = 0; i < seedData.length; i++) {
			if (seedData[i].local.grades) {
				cnt += 1;
				for (k = 0; k < seedData[i].local.grades.length; k++) {
					if (seedData[i].local.grades[k].testNumber == j) {
						sum += seedData[i].local.grades[k].testScore;
					}
				}
			}
		} //for loop
		examObj['testId'] = j;
		examObj['avg'] = sum / cnt;
		stat.push(examObj);
	} //for looop
	return stat;
}
