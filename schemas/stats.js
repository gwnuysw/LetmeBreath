const mongoose = require('mongoose');

const {Schema} = mongoose;

const statsSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  totaldust:{
    type: Number,
    required : true
  },
  totalFinedust:{
    type: Number,
    required : true
  },
  DayAverageDust:{
    type: Number,
    required: true
  },
  DayAverageFinedust:{
    type: Number,
    required: true
  },
  bigInDust:{
    type: Number,
    required: true
  },
  smallInDust:{
    type: Number,
    required: true
  },
  bigInFineDust:{
    type:Number,
    required: true
  },
  smallInFineDust:{
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('stats', statsSchema);
