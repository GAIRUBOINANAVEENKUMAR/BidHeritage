const express = require('express');
const Bid = require('../models/Bid');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

// POST / - Place a bid (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, amount } = req.body;

    if (!itemId || !amount) {
      return res.status(400).json({ message: 'Item ID and bid amount are required.' });
    }

    const bidAmount = Number(amount);

    // Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Check item is active
    if (item.status !== 'active') {
      return res.status(400).json({ message: 'This auction is no longer active.' });
    }

    // Validate bid amount > basePrice
    if (bidAmount <= item.basePrice) {
      return res.status(400).json({
        message: `Bid amount must be greater than the base price of ${item.basePrice}.`
      });
    }

    // Validate bid amount > currentBid
    if (bidAmount <= item.currentBid) {
      return res.status(400).json({
        message: `Bid amount must be greater than the current bid of ${item.currentBid}.`
      });
    }

    // Create bid
    const bid = new Bid({
      item: itemId,
      bidder: req.user.id,
      amount: bidAmount
    });

    await bid.save();

    // Update item's currentBid and bidCount
    item.currentBid = bidAmount;
    item.bidCount = (item.bidCount || 0) + 1;
    await item.save();

    // Populate bidder details
    const populatedBid = await Bid.findById(bid._id)
      .populate('bidder', 'username photo')
      .populate('item', 'name currentBid');

    res.status(201).json({
      message: 'Bid placed successfully.',
      bid: populatedBid
    });
  } catch (error) {
    console.error('Place bid error:', error.message);
    res.status(500).json({ message: 'Server error placing bid.', error: error.message });
  }
});

// GET /item/:itemId - Get all bids for an item (auth required)
router.get('/item/:itemId', auth, async (req, res) => {
  try {
    const bids = await Bid.find({ item: req.params.itemId })
      .populate('bidder', 'username photo')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error('Get item bids error:', error.message);
    res.status(500).json({ message: 'Server error fetching bids.', error: error.message });
  }
});

// GET /my-bids - Get all bids by current user (auth required)
router.get('/my-bids', auth, async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user.id })
      .populate('item')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error('Get my bids error:', error.message);
    res.status(500).json({ message: 'Server error fetching your bids.', error: error.message });
  }
});

module.exports = router;
