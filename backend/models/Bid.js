const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item reference is required']
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bidder reference is required']
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;
