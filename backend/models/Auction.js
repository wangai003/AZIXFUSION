const createFirebaseAdapter = require('../utils/FirebaseAdapter');

class Auction {
  constructor() {
    this.adapter = createFirebaseAdapter('auctions');
  }

  // Create a new auction
  async create(auctionData) {
    try {
      const auction = {
        // Basic Information
        title: auctionData.title,
        description: auctionData.description,
        itemType: auctionData.itemType || 'product',
        itemId: auctionData.itemId,

        // Seller Information
        sellerId: auctionData.sellerId,
        sellerInfo: {
          name: auctionData.sellerName || auctionData.sellerInfo?.name,
          rating: auctionData.sellerInfo?.rating || 0,
          totalSales: auctionData.sellerInfo?.totalSales || 0
        },

        // Pricing
        startingPrice: auctionData.startingPrice,
        currentPrice: auctionData.currentPrice || auctionData.startingPrice,
        reservePrice: auctionData.reservePrice || null,
        buyItNowPrice: auctionData.buyItNowPrice || null,
        bidIncrement: auctionData.bidIncrement || 1.00,

        // Timing
        startTime: auctionData.startTime || new Date(),
        endTime: auctionData.endTime,
        extendedTime: auctionData.extendedTime || 300, // 5 minutes extension

        // Status & State
        status: auctionData.status || 'active',

        // Winner Information
        winnerId: null,
        winningBid: null,
        winningBidTime: null,

        // Statistics
        totalBids: 0,
        uniqueBidders: 0,
        watchers: [],

        // Categories & Tags
        category: auctionData.category,
        subcategory: auctionData.subcategory || null,
        tags: auctionData.tags || [],

        // Media
        images: auctionData.images || [],
        videos: auctionData.videos || [],

        // Shipping & Location
        location: {
          country: auctionData.location?.country || 'Kenya',
          city: auctionData.location?.city || null,
          coordinates: auctionData.location?.coordinates || null
        },
        shippingInfo: {
          method: auctionData.shippingInfo?.method || 'pickup',
          cost: auctionData.shippingInfo?.cost || 0,
          estimatedDays: auctionData.shippingInfo?.estimatedDays || null,
          freeShipping: auctionData.shippingInfo?.freeShipping || false
        },

        // Auction Rules
        rules: {
          allowAutoBid: auctionData.rules?.allowAutoBid !== false,
          allowBidRetraction: auctionData.rules?.allowBidRetraction || false,
          bidRetractionLimit: auctionData.rules?.bidRetractionLimit || 0,
          reservePriceHidden: auctionData.rules?.reservePriceHidden !== false,
          bidExtensionTime: auctionData.rules?.bidExtensionTime || 5, // minutes
          bidExtensionThreshold: auctionData.rules?.bidExtensionThreshold || 5 // minutes before end
        },

        // Metadata
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: auctionData.createdBy || auctionData.sellerId,
        isDeleted: false
      };

      return await this.adapter.create(auction);
    } catch (error) {
      throw new Error(`Error creating auction: ${error.message}`);
    }
  }

  // Get auction by ID
  async getById(id) {
    try {
      const auction = await this.adapter.findById(id);
      if (!auction) return null;

      // Add virtual properties
      auction.isActive = this.canAcceptBids(auction);
      auction.timeRemaining = this.calculateTimeRemaining(auction);
      auction.duration = this.calculateDuration(auction);
      auction.isReserveMet = this.isReserveMet(auction);

      return auction;
    } catch (error) {
      throw new Error(`Error fetching auction: ${error.message}`);
    }
  }

  // Update auction
  async updateById(id, updateData) {
    try {
      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      return await this.adapter.updateById(id, update);
    } catch (error) {
      throw new Error(`Error updating auction: ${error.message}`);
    }
  }

  // Delete auction (soft delete)
  async deleteById(id) {
    try {
      return await this.updateById(id, { isDeleted: true });
    } catch (error) {
      throw new Error(`Error deleting auction: ${error.message}`);
    }
  }

  // Find auctions with filters
  async find(filters = {}, options = {}) {
    try {
      const { sort = { createdAt: -1 }, limit = 0, skip = 0 } = options;

      // Add default filter for non-deleted auctions
      const searchFilters = {
        isDeleted: false,
        ...filters
      };

      return await this.adapter.find(searchFilters, sort, limit, skip);
    } catch (error) {
      throw new Error(`Error finding auctions: ${error.message}`);
    }
  }

  // Find active auctions
  async findActive(options = {}) {
    try {
      const now = new Date();
      const filters = {
        status: 'active',
        startTime: { $lte: now },
        endTime: { $gt: now }
      };

      return await this.find(filters, options);
    } catch (error) {
      throw new Error(`Error finding active auctions: ${error.message}`);
    }
  }

  // Find auctions ending soon
  async findEndingSoon(minutes = 10, options = {}) {
    try {
      const now = new Date();
      const futureTime = new Date(Date.now() + minutes * 60 * 1000);

      const filters = {
        status: 'active',
        endTime: { $lte: futureTime, $gt: now }
      };

      return await this.find(filters, options);
    } catch (error) {
      throw new Error(`Error finding auctions ending soon: ${error.message}`);
    }
  }

  // Find auctions by category
  async findByCategory(categoryId, type = 'main', options = {}) {
    try {
      let filters = { isDeleted: false };

      switch (type) {
        case 'main':
          filters.category = categoryId;
          break;
        case 'sub':
          filters.subcategory = categoryId;
          break;
      }

      return await this.find(filters, options);
    } catch (error) {
      throw new Error(`Error finding auctions by category: ${error.message}`);
    }
  }

  // Find auctions by seller
  async findBySeller(sellerId, options = {}) {
    try {
      const filters = {
        sellerId,
        isDeleted: false
      };

      return await this.find(filters, options);
    } catch (error) {
      throw new Error(`Error finding auctions by seller: ${error.message}`);
    }
  }

  // Search auctions
  async searchAuctions(searchQuery, filters = {}) {
    try {
      const searchFilters = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { tags: { $in: [new RegExp(searchQuery, 'i')] } }
        ],
        isDeleted: false,
        ...filters
      };

      return await this.find(searchFilters);
    } catch (error) {
      throw new Error(`Error searching auctions: ${error.message}`);
    }
  }

  // Extend auction time
  async extendTime(id, extensionSeconds = 300) {
    try {
      const auction = await this.getById(id);
      if (!auction) {
        throw new Error('Auction not found');
      }

      const newEndTime = new Date(auction.endTime.getTime() + (extensionSeconds * 1000));

      return await this.updateById(id, {
        endTime: newEndTime,
        extendedTime: extensionSeconds
      });
    } catch (error) {
      throw new Error(`Error extending auction time: ${error.message}`);
    }
  }

  // Update current price
  async updateCurrentPrice(id, newPrice, winnerId = null) {
    try {
      const updateData = {
        currentPrice: newPrice,
        totalBids: { $inc: 1 }
      };

      if (winnerId) {
        updateData.winnerId = winnerId;
        updateData.winningBid = newPrice;
        updateData.winningBidTime = new Date();
      }

      return await this.updateById(id, updateData);
    } catch (error) {
      throw new Error(`Error updating auction price: ${error.message}`);
    }
  }

  // End auction
  async endAuction(id, winnerId = null, finalPrice = null) {
    try {
      const updateData = {
        status: 'ended',
        winnerId,
        winningBid: finalPrice,
        winningBidTime: new Date()
      };

      return await this.updateById(id, updateData);
    } catch (error) {
      throw new Error(`Error ending auction: ${error.message}`);
    }
  }

  // Cancel auction
  async cancelAuction(id) {
    try {
      return await this.updateById(id, { status: 'cancelled' });
    } catch (error) {
      throw new Error(`Error cancelling auction: ${error.message}`);
    }
  }

  // Count documents
  async countDocuments(filters = {}) {
    try {
      return await this.adapter.countDocuments(filters);
    } catch (error) {
      throw new Error(`Error counting auctions: ${error.message}`);
    }
  }

  // Helper methods
  canAcceptBids(auction) {
    const now = new Date();
    return auction.status === 'active' &&
           new Date(auction.startTime) <= now &&
           new Date(auction.endTime) > now;
  }

  calculateTimeRemaining(auction) {
    if (auction.status !== 'active') return 0;
    const now = new Date();
    const end = new Date(auction.endTime);
    return Math.max(0, end - now);
  }

  calculateDuration(auction) {
    const start = new Date(auction.startTime);
    const end = new Date(auction.endTime);
    return end - start;
  }

  isReserveMet(auction) {
    return !auction.reservePrice || auction.currentPrice >= auction.reservePrice;
  }

  // Add watcher
  async addWatcher(auctionId, userId) {
    try {
      const auction = await this.getById(auctionId);
      if (!auction) {
        throw new Error('Auction not found');
      }

      if (!auction.watchers.includes(userId)) {
        auction.watchers.push(userId);
        return await this.updateById(auctionId, { watchers: auction.watchers });
      }

      return auction;
    } catch (error) {
      throw new Error(`Error adding watcher: ${error.message}`);
    }
  }

  // Remove watcher
  async removeWatcher(auctionId, userId) {
    try {
      const auction = await this.getById(auctionId);
      if (!auction) {
        throw new Error('Auction not found');
      }

      auction.watchers = auction.watchers.filter(id => id !== userId);
      return await this.updateById(auctionId, { watchers: auction.watchers });
    } catch (error) {
      throw new Error(`Error removing watcher: ${error.message}`);
    }
  }
}

// Export the class, not an instance
module.exports = Auction;