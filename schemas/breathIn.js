const mongoose = require('mongoose');

const {Schema} = mongoose;

const breathInSchema = new Schema({
  userid: {
    type: String,
    required: true,
  },
  createdAt:{
    type: Date,
    default : Date.now
  },
  dust:{
    type: Number,
    required: true
  },
  finedust:{
    type: Number,
    required: true
  },
  dmx:{
    type:Number,
    required: true
  },
  dmy:{
    type: Number,
    required : true
  }
});

module.exports = mongoose.model('breathIn', breathInSchema);
