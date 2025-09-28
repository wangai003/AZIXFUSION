const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');
const webSocketService = require('../services/WebSocketService');

// Create instances of the model classes
const auctionModel = new Auction();
const bidModel = new Bid();
const productModel = new Product();
const serviceModel = Service; // Service is already an object, not a constructor

// Create a new auction
exports.createAuction = async (req, res) => {
  try {
    const auctionData = req.body;
    const userId = req.user._id;

    // Validate auction data
    if (!auctionData.title || !auctionData.description || !auctionData.startingPrice) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and starting price are required'
      });
    }

    // Validate timing
    const startTime = new Date(auctionData.startTime || new Date());
    const endTime = new Date(auctionData.endTime);
    const now = new Date();

    if (startTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in the future'
      });
    }

    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Validate item exists and belongs to user (skip for standalone auctions)
    let itemExists = false;
    let itemData = null;

    if (auctionData.itemType === 'product') {
      const product = await productModel.getById(auctionData.itemId);
      if (!product || product.creatorId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or does not belong to you'
        });
      }
      itemExists = true;
      itemData = product;
    } else if (auctionData.itemType === 'service') {
      const service = await serviceModel.getById(auctionData.itemId);
      if (!service || service.providerId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Service not found or does not belong to you'
        });
      }
      itemExists = true;
      itemData = service;
    } else if (auctionData.itemType === 'standalone') {
      // For standalone auctions, no item validation needed
      itemExists = true;
      itemData = null;
    }

    if (!itemExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type. Must be product, service, or standalone'
      });
    }

    // Get seller info
    const seller = await User.findById(userId);
    const sellerInfo = {
      name: seller.name || seller.username,
      rating: seller.rating || 0,
      totalSales: seller.totalSales || 0
    };

    // Create auction data
    const auctionPayload = {
      ...auctionData,
      sellerId: userId,
      sellerInfo,
      createdBy: userId,
      currentPrice: auctionData.startingPrice,
      startTime: startTime,
      endTime: endTime,
      status: 'active', // Start as active since we validate start time
      itemType: auctionData.itemType,
      itemId: auctionData.itemId
    };

    const auction = await auctionModel.create(auctionPayload);

    // Broadcast auction creation to all connected clients
    webSocketService.broadcastToAll('auction-created', auction);

    res.status(201).json({
      success: true,
      data: auction,
      message: 'Auction created successfully'
    });

  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating auction'
    });
  }
};

// Get all auctions with filters
exports.getAllAuctions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status,
      category,
      itemType,
      minPrice,
      maxPrice,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filters = {};

    if (status) filters.status = status;
    if (category) filters.category = category;
    if (itemType) filters.itemType = itemType;

    if (minPrice || maxPrice) {
      filters.currentPrice = {};
      if (minPrice) filters.currentPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filters.currentPrice.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filters.title = { $regex: search, $options: 'i' };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const auctions = await auctionModel.find(filters, {
      sort: sortObj,
      limit: parseInt(limit),
      skip
    });

    const total = await auctionModel.countDocuments(filters);

    res.json({
      success: true,
      data: auctions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching auctions'
    });
  }
};

// Get auction by ID
exports.getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await auctionModel.getById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Get bid history
    const bidHistory = await bidModel.getBidHistory(id);

    res.json({
      success: true,
      data: {
        ...auction,
        bidHistory
      }
    });

  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching auction'
    });
  }
};

// Update auction
exports.updateAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    const auction = await auctionModel.getById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Check if user is the seller
    if (auction.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this auction'
      });
    }

    // Prevent updates if auction has started
    if (auction.status !== 'draft' && auction.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update auction that has already started'
      });
    }

    // Update auction
    const updatedAuction = await auctionModel.updateById(id, updates);

    res.json({
      success: true,
      data: updatedAuction,
      message: 'Auction updated successfully'
    });

  } catch (error) {
    console.error('Error updating auction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating auction'
    });
  }
};

// Delete auction
exports.deleteAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const auction = await auctionModel.getById(id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Check if user is the seller
    if (auction.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this auction'
      });
    }

    // Prevent deletion if auction has bids
    if (auction.totalBids > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete auction with existing bids'
      });
    }

    await auctionModel.deleteById(id);

    res.json({
      success: true,
      message: 'Auction deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting auction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting auction'
    });
  }
};

// Get auctions by seller
exports.getSellerAuctions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const filters = { sellerId: userId };
    if (status) filters.status = status;

    const auctions = await auctionModel.find(filters, {
      sort: { createdAt: -1 }
    });

    res.json({
      success: true,
      data: auctions
    });

  } catch (error) {
    console.error('Error fetching seller auctions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching seller auctions'
    });
  }
};

// Get featured auctions
exports.getFeaturedAuctions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const now = new Date();

    const filters = {
      status: 'active',
      endTime: { $gt: now },
      featured: true
    };

    const auctions = await auctionModel.find(filters, {
      sort: { totalBids: -1, currentPrice: -1 },
      limit
    });

    res.json({
      success: true,
      data: auctions
    });

  } catch (error) {
    console.error('Error fetching featured auctions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching featured auctions'
    });
  }
};

// Get auctions ending soon
exports.getEndingSoonAuctions = async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes) || 60;

    const auctions = await auctionModel.findEndingSoon(minutes);

    // Sort by end time
    auctions.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));

    res.json({
      success: true,
      data: auctions
    });

  } catch (error) {
    console.error('Error fetching ending soon auctions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching ending soon auctions'
    });
  }
};

// Watch/Unwatch auction
exports.toggleWatch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const auction = await auctionModel.getById(id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    const watcherIndex = auction.watchers.indexOf(userId);

    if (watcherIndex > -1) {
      // Remove from watchlist
      await auctionModel.removeWatcher(id, userId);

      res.json({
        success: true,
        message: 'Removed from watchlist',
        watching: false
      });
    } else {
      // Add to watchlist
      await auctionModel.addWatcher(id, userId);

      res.json({
        success: true,
        message: 'Added to watchlist',
        watching: true
      });
    }

  } catch (error) {
    console.error('Error toggling watch:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating watchlist'
    });
  }
};

// Get user's watchlist
exports.getWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Since Firebase doesn't support array queries efficiently like MongoDB,
    // we'll need to get all auctions and filter client-side
    // In a production environment, you might want to maintain a separate watchlist collection
    const allAuctions = await auctionModel.find({
      status: { $in: ['scheduled', 'active'] }
    });

    // Filter auctions where user is in watchers array
    const watchlistAuctions = allAuctions.filter(auction =>
      auction.watchers && auction.watchers.includes(userId)
    );

    // Sort by end time
    watchlistAuctions.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));

    res.json({
      success: true,
      data: watchlistAuctions
    });

  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching watchlist'
    });
  }
};