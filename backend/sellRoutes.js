const express = require('express');
const router = express.Router();
const Item = require('./item');
const multer = require('multer');
const path = require('path');

// Set up multer for handling image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder to store the images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
    }
});

const upload = multer({ storage: storage });

// POST route for selling an item
router.post('/sell', upload.single('image'), async (req, res) => {
    try {
        const { name, history, basePrice, auctionDate } = req.body;
        const image = req.file?.path; // Use optional chaining for safety

        // Validate required fields
        if (!name || !history || !basePrice || !auctionDate || !image) {
            return res.status(400).json({ error: 'Please provide all required fields.' });
        }

        // Save new item
        const newItem = new Item({
            itemName: name,
            description: history,
            basePrice,
            auctionDate,
            image,
        });

        await newItem.save();
        return res.status(201).json({ message: 'Item successfully listed!' });
    } catch (error) {
        console.error('Error saving item:', error.message); // Log error for debugging
        return res.status(500).json({ error: 'An error occurred while listing the item.' });
    }
});

//Delete Method
router.delete('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Item.findByIdAndDelete(id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
//Delete Method end


module.exports = router;
