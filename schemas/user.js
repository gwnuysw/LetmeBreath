const mongoose = require('mongoose');

const {Schema} = mongoose;

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  pw:{
    type: String,
    required : true
  },
  age:{
    type: Number,
    required : true
  },
  weight:{
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('user', userSchema);
