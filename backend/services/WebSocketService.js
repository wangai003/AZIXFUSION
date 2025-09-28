const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');
const biddingService = require('./FirebaseBiddingService');
const listenerService = require('./FirebaseListenerService');

// Create model instances
const auctionModel = new Auction();
const bidModel = new Bid();

class WebSocketService {
  constructor() {
    this.io = null;
    this.auctionRooms = new Map();
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id;
        socket.user = user;
        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    this.setupEventHandlers();
    console.log('WebSocket service initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected via WebSocket`);

      // Store connected user
      this.connectedUsers.set(socket.userId.toString(), socket.id);

      // Handle auction room joining
      socket.on('join-auction', async (data) => {
        await this.handleJoinAuction(socket, data);
      });

      // Handle bid placement
      socket.on('place-bid', async (data) => {
        await this.handlePlaceBid(socket, data);
      });

      // Handle auto-bid setup
      socket.on('set-auto-bid', async (data) => {
        await this.handleSetAutoBid(socket, data);
      });

      // Handle leaving auction
      socket.on('leave-auction', async (data) => {
        await this.handleLeaveAuction(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Handle heartbeat
      socket.on('heartbeat', () => {
        socket.emit('heartbeat-response', { timestamp: new Date() });
      });
    });
  }

  async handleJoinAuction(socket, data) {
    try {
      const { auctionId } = data;
      const userId = socket.userId;

      // Validate auction exists
      const auction = await auctionModel.getById(auctionId);
      if (!auction) {
        socket.emit('error', { message: 'Auction not found' });
        return;
      }

      // Join auction room
      const roomName = `auction-${auctionId}`;
      socket.join(roomName);

      // Track room membership
      if (!this.auctionRooms.has(roomName)) {
        this.auctionRooms.set(roomName, new Set());
      }
      this.auctionRooms.get(roomName).add(userId.toString());

      // Send current auction state
      const auctionState = await this.getAuctionState(auctionId);
      socket.emit('auction-state', auctionState);

      // Notify others in the room
      const participantCount = this.auctionRooms.get(roomName).size;
      socket.to(roomName).emit('participant-joined', {
        userId: userId.toString(),
        count: participantCount
      });

      // Send participant count to all in room
      this.io.to(roomName).emit('participant-count', {
        count: participantCount
      });

      // Set up Firebase real-time listener for this auction
      const auctionUnsubscribe = listenerService.listenToAuction(auctionId, (updatedAuction) => {
        if (updatedAuction) {
          socket.emit('auction-update', updatedAuction);
        }
      });

      // Set up Firebase real-time listener for auction bids
      const bidsUnsubscribe = listenerService.listenToAuctionBids(auctionId, (bids) => {
        socket.emit('bids-update', bids);
      });

      // Store unsubscribe functions for cleanup
      socket.auctionUnsubscribe = auctionUnsubscribe;
      socket.bidsUnsubscribe = bidsUnsubscribe;

      console.log(`User ${userId} joined auction ${auctionId}`);

    } catch (error) {
      console.error('Error joining auction:', error);
      socket.emit('error', { message: 'Failed to join auction' });
    }
  }

  async handlePlaceBid(socket, data) {
    try {
      const { auctionId, bidAmount, isAutoBid = false, maxAutoBid } = data;
      const userId = socket.userId;
      const roomName = `auction-${auctionId}`;

      // Use Firebase bidding service to place bid
      const result = await biddingService.placeBid(auctionId, userId, bidAmount, {
        isAutoBid,
        maxAutoBid
      });

      if (!result.success) {
        socket.emit('error', { message: result.message });
        return;
      }

      const { bid, auction } = result.data;

      // Prepare bid update data
      const bidUpdate = {
        bidId: bid._id,
        bidderId: userId,
        bidderName: socket.user.name || socket.user.username,
        bidAmount,
        bidTime: bid.bidTime,
        isAutoBid,
        currentPrice: auction.currentPrice,
        totalBids: auction.totalBids,
        uniqueBidders: auction.uniqueBidders
      };

      // Send bid update to all participants
      this.io.to(roomName).emit('bid-update', bidUpdate);

      // Send outbid notifications to previous highest bidders
      const outbidBids = await bidModel.find({
        auctionId,
        bidStatus: 'outbid',
        bidderId: { $ne: userId }
      });

      const outbidUserIds = [...new Set(outbidBids.map(b => b.bidderId))];

      for (const outbidUserId of outbidUserIds) {
        const userSocketId = this.connectedUsers.get(outbidUserId.toString());
        if (userSocketId) {
          const auctionData = await auctionModel.getById(auctionId);
          this.io.to(userSocketId).emit('outbid-notification', {
            auctionId,
            auctionTitle: auctionData.title,
            newHighestBid: bidAmount,
            bidderName: socket.user.name || socket.user.username
          });
        }
      }

      // Check if auction should be extended
      const timeRemaining = auction.timeRemaining;
      if (timeRemaining < 300000) { // Less than 5 minutes
        await auctionModel.extendEndTime(auctionId, 5);
        const updatedAuction = await auctionModel.getById(auctionId);
        this.io.to(roomName).emit('auction-extended', {
          newEndTime: updatedAuction.endTime,
          extensionSeconds: 300
        });
      }

      console.log(`Bid placed: ${bidAmount} by user ${userId} on auction ${auctionId}`);

    } catch (error) {
      console.error('Error placing bid:', error);
      socket.emit('error', { message: 'Failed to place bid' });
    }
  }

  async handleSetAutoBid(socket, data) {
    try {
      const { auctionId, maxAmount, increment = 1 } = data;
      const userId = socket.userId;

      // Use Firebase bidding service to set auto-bid
      const result = await biddingService.setAutoBid(auctionId, userId, maxAmount, increment);

      if (!result.success) {
        socket.emit('error', { message: result.message });
        return;
      }

      // Send appropriate response based on whether it was created or updated
      const existingAutoBid = result.data;
      if (existingAutoBid.maxAutoBid === maxAmount) {
        socket.emit('auto-bid-updated', {
          auctionId,
          maxAmount,
          increment
        });
      } else {
        socket.emit('auto-bid-set', {
          auctionId,
          maxAmount,
          increment
        });
      }

      console.log(`Auto-bid set/updated: max $${maxAmount} by user ${userId} on auction ${auctionId}`);

    } catch (error) {
      console.error('Error setting auto-bid:', error);
      socket.emit('error', { message: 'Failed to set auto-bid' });
    }
  }

  async processAutoBidding(auctionId, triggerUserId, maxAutoBid) {
    try {
      const auction = await Auction.findById(auctionId);
      const roomName = `auction-${auctionId}`;

      // Find competing auto-bids
      const competingAutoBids = await Bid.find({
        auctionId,
        bidderId: { $ne: triggerUserId },
        isAutoBid: true,
        bidStatus: { $in: ['active', 'winning'] },
        maxAutoBid: { $gt: auction.currentPrice }
      }).sort({ maxAutoBid: -1 });

      for (const autoBid of competingAutoBids) {
        const newBidAmount = Math.min(
          autoBid.maxAutoBid,
          auction.currentPrice + auction.bidIncrement
        );

        if (newBidAmount > auction.currentPrice && newBidAmount <= maxAutoBid) {
          // Place competing auto-bid
          const competingBid = new Bid({
            auctionId,
            bidderId: autoBid.bidderId,
            bidAmount: newBidAmount,
            isAutoBid: true,
            bidSequence: auction.totalBids + 1
          });

          await competingBid.save();

          // Update auction
          auction.currentPrice = newBidAmount;
          auction.totalBids += 1;
          await auction.save();

          // Mark previous bids as outbid
          await Bid.updateMany(
            {
              auctionId,
              bidderId: { $ne: autoBid.bidderId },
              bidStatus: 'winning'
            },
            { bidStatus: 'outbid' }
          );

          // Mark this bid as winning
          competingBid.bidStatus = 'winning';
          await competingBid.save();

          // Send bid update
          const bidder = await User.findById(autoBid.bidderId);
          const bidUpdate = {
            bidId: competingBid._id,
            bidderId: autoBid.bidderId,
            bidderName: bidder.name || bidder.username,
            bidAmount: newBidAmount,
            bidTime: competingBid.bidTime,
            isAutoBid: true,
            currentPrice: auction.currentPrice,
            totalBids: auction.totalBids
          };

          this.io.to(roomName).emit('bid-update', bidUpdate);
        }
      }

    } catch (error) {
      console.error('Error processing auto-bidding:', error);
    }
  }

  async handleLeaveAuction(socket, data) {
    try {
      const { auctionId } = data;
      const userId = socket.userId;
      const roomName = `auction-${auctionId}`;

      // Leave room
      socket.leave(roomName);

      // Update room tracking
      if (this.auctionRooms.has(roomName)) {
        this.auctionRooms.get(roomName).delete(userId.toString());

        const participantCount = this.auctionRooms.get(roomName).size;

        // Notify others
        socket.to(roomName).emit('participant-left', {
          userId: userId.toString(),
          count: participantCount
        });

        // Send updated count
        this.io.to(roomName).emit('participant-count', {
          count: participantCount
        });
      }

      // Clean up Firebase listeners
      if (socket.auctionUnsubscribe) {
        socket.auctionUnsubscribe();
        socket.auctionUnsubscribe = null;
      }

      if (socket.bidsUnsubscribe) {
        socket.bidsUnsubscribe();
        socket.bidsUnsubscribe = null;
      }

      console.log(`User ${userId} left auction ${auctionId}`);

    } catch (error) {
      console.error('Error leaving auction:', error);
    }
  }

  handleDisconnect(socket) {
    const userId = socket.userId;

    // Clean up Firebase listeners
    if (socket.auctionUnsubscribe) {
      socket.auctionUnsubscribe();
      socket.auctionUnsubscribe = null;
    }

    if (socket.bidsUnsubscribe) {
      socket.bidsUnsubscribe();
      socket.bidsUnsubscribe = null;
    }

    // Remove from connected users
    this.connectedUsers.delete(userId.toString());

    // Remove from all auction rooms
    for (const [roomName, participants] of this.auctionRooms.entries()) {
      if (participants.has(userId.toString())) {
        participants.delete(userId.toString());

        const participantCount = participants.size;
        socket.to(roomName).emit('participant-left', {
          userId: userId.toString(),
          count: participantCount
        });

        this.io.to(roomName).emit('participant-count', {
          count: participantCount
        });
      }
    }

    console.log(`User ${userId} disconnected`);
  }

  async getAuctionState(auctionId) {
    try {
      const auction = await auctionModel.getById(auctionId);

      if (!auction) return null;

      // Get recent bids
      const recentBids = await bidModel.getBidHistory(auctionId, 10);

      // Get participant count
      const roomName = `auction-${auctionId}`;
      const participantCount = this.auctionRooms.get(roomName)?.size || 0;

      return {
        auction: {
          id: auction._id,
          title: auction.title,
          description: auction.description,
          currentPrice: auction.currentPrice,
          startingPrice: auction.startingPrice,
          bidIncrement: auction.bidIncrement,
          reservePrice: auction.reservePrice,
          buyItNowPrice: auction.buyItNowPrice,
          startTime: auction.startTime,
          endTime: auction.endTime,
          status: auction.status,
          totalBids: auction.totalBids,
          uniqueBidders: auction.uniqueBidders,
          winnerId: auction.winnerId,
          sellerId: auction.sellerId,
          sellerInfo: auction.sellerInfo,
          images: auction.images,
          category: auction.category,
          timeRemaining: auction.timeRemaining,
          canAcceptBids: auction.canAcceptBids
        },
        recentBids,
        participantCount,
        canBid: auction.canAcceptBids
      };

    } catch (error) {
      console.error('Error getting auction state:', error);
      return null;
    }
  }

  // Send notification to specific user
  sendNotificationToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Broadcast to auction room
  broadcastToAuction(auctionId, event, data) {
    const roomName = `auction-${auctionId}`;
    this.io.to(roomName).emit(event, data);
  }

  // Broadcast to all connected clients
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get active auction rooms
  getActiveRooms() {
    return Array.from(this.auctionRooms.keys());
  }
}

module.exports = new WebSocketService();