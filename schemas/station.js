const mongoose = require('mongoose');

const {Schema} = mongoose;

const stationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('location', stationSchema);
