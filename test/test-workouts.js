'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// this makes the should syntax available throughout
// this module
const expect = chai.expect;

const {Workout} = require('../workouts');
const{User} = require('../users');
const {closeServer,runServer,app} = require('../server');
const {TEST_DATABASE_URL, JWT_SECRET} = require('../config');

chai.use(chaiHttp);

const username = 'exampleUser';
const password = 'examplePass';
const firstName = 'Example';
const lastName = 'User';
let workoutId = "213123";


function generateWorkoutData() {
    return {
        name: faker.lorem.word(),
        date: faker.date.recent(),
        exerciseTime: faker.lorem.word(),
        exerciseType: faker.lorem.word(),
        notes: faker.lorem.paragraph(),
        caloriesBurned: faker.lorem.word()
    };
}

function seedWorkoutData() {
    console.info('seeding workout data');
    const seedData = [];

    for (let i = 1; i <= 5; i++) {
        seedData.push(generateWorkoutData());
    }
    return Workout.insertMany(seedData)
    .then(workout => {
     workoutId = workout[0]._id
    })
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

 function createUserProfile() {
     return User.hashPassword(password).then(password =>
        User.create({
            username,
            password,
            firstName,
            lastName
          })
        );
 }   


 describe('Jobs API resource', function () {

  let token;

  before(function () {
      return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
      return createUserProfile()
      .then(function() {
          token = jwt.sign(
              {
                  user: {
                      username,
                      firstName,
                      lastName
                  }
              },
              JWT_SECRET,
              {
                  algorithm: 'HS256',
                  subject: username,
                  expiresIn: '7d'
              });
         return seedWorkoutData();
      });
  });

  afterEach(function () {
      return tearDownDb();
  });

  after(function () {
      return closeServer();
  });
// ================================================
//                   WORKOUT ROUTES TESTS
// ================================================
  describe('existing workout GET endpoint', function() {

    it('should return all existing workouts', function () {
        let res;
        return chai.request(app)
            .get('/api/workouts')
            .set('Authorization', `Bearer ${token}`)
            .then(function (_res) {
                res = _res;
                expect(res).to.have.status(200);
                expect(res.body.workouts).to.have.lengthOf.at.least(1);
                return Workout.count();
            })
            .then(function (count) {
                expect(res.body.workouts).to.have.lengthOf(count);
            });
    });

  });
  describe('new workout POST endpoint', function() {
        it('should create a new workout with correct fields', function() {
            const newWorkout = generateWorkoutData();
            return chai.request(app)
            .post("/api/workouts")
            .set('Authorization', `Bearer ${token}`)
            .send(newWorkout)
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body.name).to.equal(newWorkout.name);
                expect(res.body.id).to.not.be.null;
                expect(res.body.date).to.not.be.null;
                expect(res.body.exerciseTime).to.equal(newWorkout.exerciseTime);
                expect(res.body.exerciseType).to.equal(newWorkout.exerciseType);
                expect(res.body.notes).to.equal(newWorkout.notes); 
                expect(res.body.caloriesBurned).to.equal(newWorkout.caloriesBurned);     
            })

        });
    });

    describe('delete workout DELETE endpoint', function() {
        it('should delete a existing workout', function() {
            let workout;

            return Workout
            .findOne()
            .then(function(_workout) {
                workout = _workout;
                return chai.request(app)
                .delete(`/api/workouts/${workout._id}`)
                .set('Authorization', `Bearer ${token}`);
            })
            .then(function(res) {
                expect(res).to.have.status(204);
                return Workout.findById(workout._id);
            })
            .then(function(_workout) {
                expect(_workout).to.be.null;
            });

        });
    });

});