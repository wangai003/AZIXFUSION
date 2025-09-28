const createFirebaseAdapter = require('../utils/FirebaseAdapter');

class Bid {
  constructor() {
    this.adapter = createFirebaseAdapter('bids');
  }

  // Create a new bid
  async create(bidData) {
    try {
      const bid = {
        // Relationships
        auctionId: bidData.auctionId,
        bidderId: bidData.bidderId,

        // Bid Details
        bidAmount: bidData.bidAmount,
        bidTime: bidData.bidTime || new Date(),

        // Auto-bidding
        isAutoBid: bidData.isAutoBid || false,
        maxAutoBid: bidData.maxAutoBid || null,
        autoBidIncrement: bidData.autoBidIncrement || 1.00,

        // Bid Status
        bidStatus: bidData.bidStatus || 'active',

        // Bid History
        previousBid: bidData.previousBid || null,
        bidSequence: bidData.bidSequence || null,

        // Bid Metadata
        ipAddress: bidData.ipAddress || null,
        userAgent: bidData.userAgent || null,
        deviceInfo: bidData.deviceInfo || null,

        // Financial tracking
        processingFee: bidData.processingFee || 0,
        platformFee: bidData.platformFee || 0,

        // Audit trail
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.adapter.create(bid);
    } catch (error) {
      throw new Error(`Error creating bid: ${error.message}`);
    }
  }

  // Get bid by ID
  async getById(id) {
    try {
      const bid = await this.adapter.findById(id);
      if (!bid) return null;

      // Add virtual properties
      bid.bidAge = this.calculateBidAge(bid);
      bid.isValid = this.isValid(bid);

      return bid;
    } catch (error) {
      throw new Error(`Error fetching bid: ${error.message}`);
    }
  }

  // Update bid
  async updateById(id, updateData) {
    try {
      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      return await this.adapter.updateById(id, update);
    } catch (error) {
      throw new Error(`Error updating bid: ${error.message}`);
    }
  }

  // Find bids with filters
  async find(filters = {}, options = {}) {
    try {
      const { sort = { bidTime: -1 }, limit = 0, skip = 0 } = options;
      return await this.adapter.find(filters, sort, limit, skip);
    } catch (error) {
      throw new Error(`Error finding bids: ${error.message}`);
    }
  }

  // Find highest bid for auction
  async findHighestBid(auctionId) {
    try {
      const filters = {
        auctionId,
        bidStatus: { $in: ['active', 'winning'] }
      };

      const bids = await this.find(filters, {
        sort: { bidAmount: -1, bidTime: 1 },
        limit: 1
      });

      return bids.length > 0 ? bids[0] : null;
    } catch (error) {
      throw new Error(`Error finding highest bid: ${error.message}`);
    }
  }

  // Find user's bids for auction
  async findUserBidsForAuction(userId, auctionId, options = {}) {
    try {
      const filters = {
        bidderId: userId,
        auctionId
      };

      return await this.find(filters, {
        sort: { bidTime: -1 },
        ...options
      });
    } catch (error) {
      throw new Error(`Error finding user bids for auction: ${error.message}`);
    }
  }

  // Find all active bids for auction
  async findActiveBidsForAuction(auctionId, options = {}) {
    try {
      const filters = {
        auctionId,
        bidStatus: { $in: ['active', 'winning'] }
      };

      return await this.find(filters, {
        sort: { bidAmount: -1, bidTime: 1 },
        ...options
      });
    } catch (error) {
      throw new Error(`Error finding active bids for auction: ${error.message}`);
    }
  }

  // Count unique bidders for auction
  async countUniqueBidders(auctionId) {
    try {
      const filters = {
        auctionId,
        bidStatus: { $nin: ['cancelled'] }
      };

      const bids = await this.find(filters);
      const uniqueBidderIds = [...new Set(bids.map(bid => bid.bidderId))];

      return uniqueBidderIds.length;
    } catch (error) {
      throw new Error(`Error counting unique bidders: ${error.message}`);
    }
  }

  // Get bid history for auction
  async getBidHistory(auctionId, limit = 50) {
    try {
      const bids = await this.find(
        { auctionId },
        {
          sort: { bidTime: -1 },
          limit
        }
      );

      // Return bids with selected fields
      return bids.map(bid => ({
        _id: bid._id,
        bidAmount: bid.bidAmount,
        bidTime: bid.bidTime,
        bidderId: bid.bidderId,
        bidStatus: bid.bidStatus,
        isAutoBid: bid.isAutoBid
      }));
    } catch (error) {
      throw new Error(`Error getting bid history: ${error.message}`);
    }
  }

  // Find bids requiring refund
  async findBidsForRefund(auctionId, winningBidAmount) {
    try {
      const filters = {
        auctionId,
        bidAmount: { $gt: winningBidAmount },
        bidStatus: { $in: ['active', 'outbid'] }
      };

      return await this.find(filters);
    } catch (error) {
      throw new Error(`Error finding bids for refund: ${error.message}`);
    }
  }

  // Cancel bid
  async cancel(id, reason = 'user_cancelled') {
    try {
      return await this.updateById(id, { bidStatus: 'cancelled' });
    } catch (error) {
      throw new Error(`Error cancelling bid: ${error.message}`);
    }
  }

  // Mark as outbid
  async markAsOutbid(id) {
    try {
      return await this.updateById(id, { bidStatus: 'outbid' });
    } catch (error) {
      throw new Error(`Error marking bid as outbid: ${error.message}`);
    }
  }

  // Mark as winning
  async markAsWinning(id) {
    try {
      return await this.updateById(id, { bidStatus: 'winning' });
    } catch (error) {
      throw new Error(`Error marking bid as winning: ${error.message}`);
    }
  }

  // Mark multiple bids as outbid (for batch operations)
  async markMultipleAsOutbid(bidIds) {
    try {
      const results = [];

      for (const bidId of bidIds) {
        const result = await this.markAsOutbid(bidId);
        results.push(result);
      }

      return results;
    } catch (error) {
      throw new Error(`Error marking multiple bids as outbid: ${error.message}`);
    }
  }

  // Get bids by auction with pagination
  async getBidsByAuction(auctionId, options = {}) {
    try {
      const { page = 1, limit = 20, sort = { bidTime: -1 } } = options;
      const skip = (page - 1) * limit;

      return await this.find(
        { auctionId },
        { sort, limit, skip }
      );
    } catch (error) {
      throw new Error(`Error getting bids by auction: ${error.message}`);
    }
  }

  // Get bids by user
  async getBidsByUser(userId, options = {}) {
    try {
      const { status, auctionId, page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const filters = { bidderId: userId };
      if (status) filters.bidStatus = status;
      if (auctionId) filters.auctionId = auctionId;

      return await this.find(filters, {
        sort: { bidTime: -1 },
        limit,
        skip
      });
    } catch (error) {
      throw new Error(`Error getting bids by user: ${error.message}`);
    }
  }

  // Count documents
  async countDocuments(filters = {}) {
    try {
      return await this.adapter.countDocuments(filters);
    } catch (error) {
      throw new Error(`Error counting bids: ${error.message}`);
    }
  }

  // Helper methods
  calculateBidAge(bid) {
    return Date.now() - new Date(bid.bidTime).getTime();
  }

  isValid(bid) {
    return bid.bidStatus === 'active' || bid.bidStatus === 'winning';
  }

  // Get bid statistics for auction
  async getBidStatistics(auctionId) {
    try {
      const allBids = await this.find({ auctionId });

      const stats = {
        totalBids: allBids.length,
        activeBids: allBids.filter(bid => bid.bidStatus === 'active').length,
        winningBids: allBids.filter(bid => bid.bidStatus === 'winning').length,
        cancelledBids: allBids.filter(bid => bid.bidStatus === 'cancelled').length,
        outbidBids: allBids.filter(bid => bid.bidStatus === 'outbid').length,
        refundedBids: allBids.filter(bid => bid.bidStatus === 'refunded').length,
        uniqueBidders: [...new Set(allBids.map(bid => bid.bidderId))].length,
        autoBids: allBids.filter(bid => bid.isAutoBid).length,
        highestBid: allBids.length > 0 ? Math.max(...allBids.map(bid => bid.bidAmount)) : 0,
        lowestBid: allBids.length > 0 ? Math.min(...allBids.map(bid => bid.bidAmount)) : 0,
        averageBid: allBids.length > 0 ? allBids.reduce((sum, bid) => sum + bid.bidAmount, 0) / allBids.length : 0
      };

      return stats;
    } catch (error) {
      throw new Error(`Error getting bid statistics: ${error.message}`);
    }
  }
}

// Export the class, not an instance
module.exports = Bid;