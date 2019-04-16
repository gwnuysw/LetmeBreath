const mongoose = require('mongoose');

const {Schema} = mongoose;

const pinedustSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  pinedust:{
    type: Object,
    required : true
  },
});

module.exports = mongoose.model('pinedust', pinedustSchema);
