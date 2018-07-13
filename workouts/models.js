'use strict'
//================
//     SETUP
//================
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const WorkoutSchema = mongoose.Schema({
 name: {type: String},
 date: {type: Date},
 liftTime: {type: String},
 exercises: [{
    name: {type: String},
    sets: {type: String},
    reps: {type: String},
    weight: {type: String}
 }],
 cardio: {
   type: {type: String},
   cardioTime: {type: String}
 },
 caloriesBurned: {type: String}
});


WorkoutSchema.virtual('formattedDate').get(function() {
  let date = new Date(this.date);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
});

WorkoutSchema.methods.exercise = function(exercise) {
  return {
    id: exercise._id,
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight
  };
}

WorkoutSchema.methods.serialize = function () {
  return {
    id: this._id,
    name: this.name,
    date: this.formattedDate,
    liftTime: this.liftTime,
    exercises: this.exercises.map(WorkoutSchema.methods.exercise),
    cardio: {
      type: this.cardio.type,
      cardioTime: this.cardio.cardioTime
    },
    caloriesBurned: this.caloriesBurned,
  }
}



const Workout = mongoose.model("Workout", WorkoutSchema);

module.exports = {Workout};

