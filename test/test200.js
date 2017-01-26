const  dotenv = require('dotenv').load();

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const should = chai.should();
const TEST_DATABASE_URL=process.env.tst;
const User = require('../app/models/user');

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
		// tear down database so we ensure no state from this test
		// effects any coming after.
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
				// the number of returned posts should be same
				// as number of posts in DB
				res.body.should.have.length.of(count);
			});
		});


		it('should return posts with right fields', function() {
			// Strategy: Get back all students, and ensure they have expected keys
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
				// just check one of the posts that its values match with those in db
				// and we'll assume it's true for rest
				resStudentList = res.body[0];
				return User.findById(resStudentList.id).exec();
			}).then(student => {
				resStudentList.usergroup.should.equal(student.local.usergroup);
				resStudentList.firstname.should.equal(student.local.firstname);
				resStudentList.lastname.should.equal(student.local.lastname);
			});
		});

		it('should get grades of a student', function() {
			// Strategy: Get back grades of a student, and ensure they have expected data type
			return User.findOne().exec().then(user => {
				return chai.request(app).get(`/api/getGrade/${user.id}`);
			}).then(res => {
				res.should.be.json;
				res.body.should.be.a('object');
			})
		});

		it('should return test stat', function() {
			// strategy: prove test stat we got back is equal to stat from seeded data.
			let res;
			return chai.request(app).get('/api/testStat').then(_res => {
				res = _res;
				res.should.have.status(200);
				// otherwise our db seeding didn't work
				res.body.stat.should.have.length.of.at.least(1);
				//Calculated avg score is equal to the avg from DB
				res.body.stat[0].avg.should.equal(getStat(seedData)[0].avg);
			})
		});


		it('should get scores for a test', function() {
			// strategy: prove the number scores of a test we got back is equal to the number of scores
			//       from seeded data for db

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
	});

	describe('POST endpoint', function() {
		this.timeout(5000);

		let newStudent;
		// strategy: make a POST request with data,
		// then prove that the student  we get back has
		// right keys, and that `id` is there (which means
		// the data was inserted into db)
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

		// strategy:
		//  1. Get an existing student from db
		//  2. Make a post request to add grade scores to the existing student
		//  3. Prove student returned by request contains data we sent
		//  4. Prove student in db is correctly updated

		it('should add test scores', function() {

			let testScores=[];
			let aUserId;
			let numOfGrades;
			return User.findOne().exec().then(user => {
				testScores.push([user.id, 100])
				testScores.push(["testNumber", 99]);
				numOfGrades=user.local.grades.length+1;
				aUserId=user.id;

				return chai.request(app).post(`/api/addTestScore/`).send(testScores);
			}).then(res => {
						res.body.should.be.a('object');
						res.body.grades.should.have.length(numOfGrades);
						res.body.grades[numOfGrades-1].testNumber.should.equal(99);

						return User.findById(aUserId).exec();
					});
		});
	});

	describe('PUT endpoint', function() {
		// strategy:
		//  1. Get an existing student from db
		//  2. Make a PUT request to update that post
		//  3. Prove student returned by request contains data we sent
		//  4. Prove student in db is correctly updated
		it('should update fields you send over', function() {
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
				return User.findById(res.body.id).exec();
			}).then(post => {});
		});

		// strategy:
		//  1. Get an existing test from db
		//  2. Make a PUT request to update that test score
		//  3. Prove test returned by request contains data we sent
		it('should update test score you send over', function() {
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
				return User.findById(res.body.id).exec();
			})
		});
	});

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
	for (let i = 1; i <= 2; i++) {
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


// get test scores
function getTestScore(seedData, testId) {
	let testScores = [];
		for (i = 0; i < seedData.length; i++) {
			if (seedData[i].local.grades) {
				cnt += 1;
				for (k = 0; k < seedData[i].local.grades.length; k++) {
					if (seedData[i].local.grades[k].testNumber == testId) {
						testScores.push (seedData[i].local.grades[k].testScore);
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
