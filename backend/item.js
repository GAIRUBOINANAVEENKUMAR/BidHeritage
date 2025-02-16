const mongoose = require('mongoose');

// Define the schema for items
const itemSchema = new mongoose.Schema(
    {
        itemName: { type: String, required: true },
        basePrice: { type: Number, required: true },
        description: { type: String },
        image: { type: String }, // Assuming this stores image URLs or paths
        auctionDate: { type: Date, required: true }, // Add auctionDate field
    },
);

// Export the Item model
module.exports = mongoose.model('Item', itemSchema);
