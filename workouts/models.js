'use strict'
//================
//     SETUP
//================
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const WorkoutSchema = mongoose.Schema({
 name: {type: String},
 date: {type: Date},
 exerciseTime: {type: String},
 type: {type: String},
 notes: {type: String},
 caloriesBurned: {type: String}
});


WorkoutSchema.virtual('formattedDate').get(function() {
  let date = new Date(this.date);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
});

WorkoutSchema.methods.serialize = function () {
  return {
    id: this._id,
    name: this.name,
    date: this.formattedDate,
    exerciseTime: this.exerciseTime,
    type: this.type,
    notes: this.notes,
    caloriesBurned: this.caloriesBurned,
  }
}



const Workout = mongoose.model("Workout", WorkoutSchema);

module.exports = {Workout};

