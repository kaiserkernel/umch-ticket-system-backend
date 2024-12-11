const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  group: {
    type: String,
    required: true
  },
  sequenceValue: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;
