const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

// POST / - Save contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    res.status(201).json({
      message: 'Contact message sent successfully.',
      contact
    });
  } catch (error) {
    console.error('Contact save error:', error.message);
    res.status(500).json({ message: 'Server error saving contact message.', error: error.message });
  }
});

// GET / - Get all contact messages (admin use)
router.get('/', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Get contacts error:', error.message);
    res.status(500).json({ message: 'Server error fetching contact messages.', error: error.message });
  }
});

module.exports = router;
