const jwt = require('jsonwebtoken');
const Bid = require('../models/Bid');
const Item = require('../models/Item');

const initBidSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join an auction room
    socket.on('join_auction', (itemId) => {
      if (!itemId) {
        socket.emit('error', { message: 'Item ID is required to join auction.' });
        return;
      }
      socket.join(itemId);
      console.log(`Socket ${socket.id} joined auction room: ${itemId}`);
      socket.emit('joined_auction', { itemId, message: `Joined auction room for item ${itemId}` });
    });

    // Place a bid via socket
    socket.on('place_bid', async (data) => {
      try {
        const { itemId, amount, token } = data;

        if (!itemId || !amount || !token) {
          socket.emit('error', { message: 'Item ID, amount, and token are required.' });
          return;
        }

        // Verify token
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
          socket.emit('error', { message: 'Invalid or expired token.' });
          return;
        }

        const bidderId = decoded.id;
        const bidAmount = Number(amount);

        // Find the item
        const item = await Item.findById(itemId);
        if (!item) {
          socket.emit('error', { message: 'Item not found.' });
          return;
        }

        // Check item is active
        if (item.status !== 'active') {
          socket.emit('error', { message: 'This auction is no longer active.' });
          return;
        }

        // Validate bid amount
        if (bidAmount <= item.basePrice) {
          socket.emit('error', { message: `Bid must be greater than base price of ${item.basePrice}.` });
          return;
        }

        if (bidAmount <= item.currentBid) {
          socket.emit('error', { message: `Bid must be greater than current bid of ${item.currentBid}.` });
          return;
        }

        // Create bid document
        const bid = new Bid({
          item: itemId,
          bidder: bidderId,
          amount: bidAmount
        });

        await bid.save();

        // Update item
        item.currentBid = bidAmount;
        item.bidCount = (item.bidCount || 0) + 1;
        await item.save();

        // Populate bidder details
        const populatedBid = await Bid.findById(bid._id)
          .populate('bidder', 'username photo');

        // Emit bid update to the auction room
        io.to(itemId).emit('bid_update', {
          bid: populatedBid,
          currentBid: bidAmount,
          bidCount: item.bidCount
        });

        console.log(`Bid placed: ${bidAmount} on item ${itemId} by user ${bidderId}`);
      } catch (error) {
        console.error('Socket place_bid error:', error.message);
        socket.emit('error', { message: 'Error placing bid. Please try again.' });
      }
    });

    // Leave an auction room
    socket.on('leave_auction', (itemId) => {
      if (!itemId) {
        socket.emit('error', { message: 'Item ID is required to leave auction.' });
        return;
      }
      socket.leave(itemId);
      console.log(`Socket ${socket.id} left auction room: ${itemId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initBidSocket;
