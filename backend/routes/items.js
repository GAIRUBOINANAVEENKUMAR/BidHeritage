const express = require('express');
const fs = require('fs');
const path = require('path');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET / - Get all items (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }

    const items = await Item.find(filter)
      .populate('seller', 'username email photo')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Get items error:', error.message);
    res.status(500).json({ message: 'Server error fetching items.', error: error.message });
  }
});

// GET /user/my-items - Get current user's items (auth required) — must be before /:id
router.get('/user/my-items', auth, async (req, res) => {
  try {
    const items = await Item.find({ seller: req.user.id })
      .populate('seller', 'username email photo')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Get my items error:', error.message);
    res.status(500).json({ message: 'Server error fetching your items.', error: error.message });
  }
});

// GET /:id - Get single item (public)
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'username email photo')
      .populate('winner', 'username email photo');

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get item error:', error.message);
    res.status(500).json({ message: 'Server error fetching item.', error: error.message });
  }
});

// POST / - Create item (auth required)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, history, basePrice, auctionDate, category } = req.body;

    if (!name || !basePrice || !auctionDate) {
      return res.status(400).json({ message: 'Name, base price, and auction date are required.' });
    }

    const itemData = {
      name,
      history,
      basePrice: Number(basePrice),
      auctionDate,
      category: category || 'General',
      seller: req.user.id
    };

    if (req.file) {
      itemData.image = req.file.path;
    }

    const item = new Item(itemData);
    await item.save();

    const populatedItem = await Item.findById(item._id).populate('seller', 'username email photo');

    res.status(201).json({
      message: 'Item created successfully.',
      item: populatedItem
    });
  } catch (error) {
    console.error('Create item error:', error.message);
    res.status(500).json({ message: 'Server error creating item.', error: error.message });
  }
});

// PUT /:id - Update item (auth required, seller only)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this item.' });
    }

    const { name, history, basePrice, auctionDate, category, status } = req.body;

    if (name) item.name = name;
    if (history !== undefined) item.history = history;
    if (basePrice) item.basePrice = Number(basePrice);
    if (auctionDate) item.auctionDate = auctionDate;
    if (category) item.category = category;
    if (status) item.status = status;

    if (req.file) {
      // Delete old image if exists
      if (item.image) {
        const oldImagePath = path.resolve(item.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      item.image = req.file.path;
    }

    await item.save();

    const updatedItem = await Item.findById(item._id).populate('seller', 'username email photo');

    res.json({
      message: 'Item updated successfully.',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error.message);
    res.status(500).json({ message: 'Server error updating item.', error: error.message });
  }
});

// DELETE /:id - Delete item (auth required, seller only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this item.' });
    }

    // Delete image file if exists
    if (item.image) {
      const imagePath = path.resolve(item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    console.error('Delete item error:', error.message);
    res.status(500).json({ message: 'Server error deleting item.', error: error.message });
  }
});

module.exports = router;
