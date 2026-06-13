const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const Bid = require('../models/Bid');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /profile - Get current user profile (auth required)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error fetching profile.', error: error.message });
  }
});

// PUT /profile - Update profile (auth required)
router.put('/profile', auth, upload.single('photo'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { username, phone, dob, country, state, district, address } = req.body;

    if (username) user.username = username;
    if (phone !== undefined) user.phone = phone;
    if (dob !== undefined) user.dob = dob;
    if (country !== undefined) user.country = country;
    if (state !== undefined) user.state = state;
    if (district !== undefined) user.district = district;
    if (address !== undefined) user.address = address;

    if (req.file) {
      user.photo = req.file.path;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Profile updated successfully.',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile.', error: error.message });
  }
});

// PUT /change-password - Change password (auth required)
router.put('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error.message);
    res.status(500).json({ message: 'Server error changing password.', error: error.message });
  }
});

// DELETE /account - Delete user account and their items (auth required)
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all items listed by this user
    await Item.deleteMany({ seller: userId });

    // Delete all bids by this user
    await Bid.deleteMany({ bidder: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account and all associated data deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error.message);
    res.status(500).json({ message: 'Server error deleting account.', error: error.message });
  }
});

// GET /dashboard - Get user dashboard stats (auth required)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Items listed by user
    const itemsListed = await Item.countDocuments({ seller: userId });

    // Active bids by user (bids on active items)
    const activeBids = await Bid.countDocuments({ bidder: userId });

    // Items won by user
    const itemsWon = await Item.countDocuments({ winner: userId });

    // Total spent (sum of currentBid for items won)
    const wonItems = await Item.find({ winner: userId }).select('currentBid');
    const totalSpent = wonItems.reduce((sum, item) => sum + (item.currentBid || 0), 0);

    res.json({
      itemsListed,
      activeBids,
      itemsWon,
      totalSpent
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({ message: 'Server error fetching dashboard.', error: error.message });
  }
});

module.exports = router;
