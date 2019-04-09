const mongoose = require('mongoose');

const {Schema} = mongoose;

const locationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  tmx: {
    type: Number,
    required: true,
  },
  tmy: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('location', locationSchema);
