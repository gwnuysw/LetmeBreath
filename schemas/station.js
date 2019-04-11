const mongoose = require('mongoose');

const {Schema} = mongoose;

const stationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  dmx:{
    type: Number,
    required : true
  },
  dmy:{
    type: Number,
    required : true
  }
});

module.exports = mongoose.model('station', stationSchema);
