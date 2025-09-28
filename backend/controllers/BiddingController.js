const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');

// Create instances of the model classes
const auctionModel = new Auction();
const bidModel = new Bid();

// Place a bid on an auction
exports.placeBid = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { bidAmount, isAutoBid = false, maxAutoBid } = req.body;
    const bidderId = req.user._id;

    // Validate auction exists and is active
    const auction = await auctionModel.getById(auctionId);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    if (!auction.canAcceptBids) {
      return res.status(400).json({
        success: false,
        message: 'Auction is not accepting bids'
      });
    }

    // Prevent seller from bidding on own auction
    if (auction.sellerId === bidderId) {
      return res.status(400).json({
        success: false,
        message: 'Seller cannot bid on own auction'
      });
    }

    // Validate bid amount
    const minimumBid = auction.currentPrice + auction.bidIncrement;
    if (bidAmount < minimumBid) {
      return res.status(400).json({
        success: false,
        message: `Bid must be at least ${minimumBid}`
      });
    }

    // Check if user has sufficient balance (if required)
    const bidder = await User.findById(bidderId);
    if (bidder.balance < bidAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance to place this bid'
      });
    }

    // Create bid record
    const bidData = {
      auctionId,
      bidderId,
      bidAmount,
      isAutoBid,
      maxAutoBid: isAutoBid ? maxAutoBid : undefined,
      bidSequence: auction.totalBids + 1
    };

    const bid = await bidModel.create(bidData);

    // Update auction
    const updatedAuction = await auctionModel.updateById(auctionId, {
      currentPrice: bidAmount,
      totalBids: auction.totalBids + 1,
      winnerId: bidderId,
      winningBid: bidAmount,
      winningBidTime: new Date()
    });

    // Update unique bidders count
    const uniqueBidders = await bidModel.countUniqueBidders(auctionId);
    await auctionModel.updateById(auctionId, { uniqueBidders });

    // Check if reserve price is met
    if (auction.reservePrice && bidAmount >= auction.reservePrice) {
      await auctionModel.updateById(auctionId, { reservePrice: null }); // Hide reserve price once met
    }

    // Mark previous bids as outbid
    const previousWinningBids = await bidModel.findActiveBidsForAuction(auctionId);
    const bidsToMarkOutbid = previousWinningBids.filter(b => b.bidderId !== bidderId);

    for (const bidToUpdate of bidsToMarkOutbid) {
      await bidModel.markAsOutbid(bidToUpdate._id);
    }

    // Mark this bid as winning
    await bidModel.updateById(bid._id, { bidStatus: 'winning' });

    // Handle auto-bidding
    if (isAutoBid && maxAutoBid > bidAmount) {
      await handleAutoBidding(auctionId, bidderId, maxAutoBid);
    }

    // Check if auction should be extended
    const timeRemaining = auction.timeRemaining;
    if (timeRemaining < 300000) { // Less than 5 minutes
      await auctionModel.extendEndTime(auctionId, 5);
    }

    // Get updated auction data
    const finalAuction = await auctionModel.getById(auctionId);

    res.json({
      success: true,
      data: {
        bid: { ...bid, bidStatus: 'winning' },
        auction: {
          currentPrice: finalAuction.currentPrice,
          totalBids: finalAuction.totalBids,
          uniqueBidders: finalAuction.uniqueBidders,
          timeRemaining: finalAuction.timeRemaining
        }
      },
      message: 'Bid placed successfully'
    });

  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error placing bid'
    });
  }
};

// Handle auto-bidding logic
async function handleAutoBidding(auctionId, bidderId, maxAutoBid) {
  try {
    // Find competing auto-bids
    const allBids = await bidModel.find({
      auctionId,
      isAutoBid: true,
      bidStatus: { $in: ['active', 'winning'] }
    });

    // Filter competing auto-bids (excluding current bidder)
    const competingAutoBids = allBids
      .filter(bid => bid.bidderId !== bidderId && bid.maxAutoBid > 0)
      .sort((a, b) => b.maxAutoBid - a.maxAutoBid);

    const auction = await auctionModel.getById(auctionId);
    let currentPrice = auction.currentPrice;

    for (const autoBid of competingAutoBids) {
      if (autoBid.maxAutoBid > currentPrice) {
        const newBidAmount = Math.min(
          autoBid.maxAutoBid,
          currentPrice + auction.bidIncrement
        );

        if (newBidAmount > currentPrice && newBidAmount <= maxAutoBid) {
          // Place competing auto-bid
          const competingBidData = {
            auctionId,
            bidderId: autoBid.bidderId,
            bidAmount: newBidAmount,
            isAutoBid: true,
            bidSequence: auction.totalBids + 1
          };

          const competingBid = await bidModel.create(competingBidData);

          // Update auction
          await auctionModel.updateById(auctionId, {
            currentPrice: newBidAmount,
            totalBids: auction.totalBids + 1,
            winnerId: autoBid.bidderId,
            winningBid: newBidAmount,
            winningBidTime: new Date()
          });

          currentPrice = newBidAmount;

          // Mark previous bids as outbid
          const previousWinningBids = await bidModel.findActiveBidsForAuction(auctionId);
          const bidsToMarkOutbid = previousWinningBids.filter(b => b.bidderId !== autoBid.bidderId);

          for (const bidToUpdate of bidsToMarkOutbid) {
            await bidModel.markAsOutbid(bidToUpdate._id);
          }

          // Mark this bid as winning
          await bidModel.updateById(competingBid._id, { bidStatus: 'winning' });

          // Update auction reference for next iteration
          auction.totalBids += 1;
        }
      }
    }

  } catch (error) {
    console.error('Error handling auto-bidding:', error);
  }
}

// Get bid history for an auction
exports.getBidHistory = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { limit = 50 } = req.query;

    const bidHistory = await bidModel.getBidHistory(auctionId, parseInt(limit));

    res.json({
      success: true,
      data: bidHistory
    });

  } catch (error) {
    console.error('Error fetching bid history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching bid history'
    });
  }
};

// Get user's bids
exports.getUserBids = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const filters = { bidderId: userId };
    if (status) filters.bidStatus = status;

    const bids = await bidModel.getBidsByUser(userId, {
      status,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Get total count
    const total = await bidModel.countDocuments(filters);

    // Populate auction data for each bid
    const populatedBids = await Promise.all(
      bids.map(async (bid) => {
        const auction = await auctionModel.getById(bid.auctionId);
        return {
          ...bid,
          auctionId: auction ? {
            _id: auction._id,
            title: auction.title,
            currentPrice: auction.currentPrice,
            endTime: auction.endTime,
            status: auction.status,
            winnerId: auction.winnerId,
            images: auction.images,
            sellerId: {
              name: auction.sellerInfo?.name || 'Unknown',
              username: auction.sellerInfo?.name || 'Unknown'
            }
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: populatedBids,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching user bids:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user bids'
    });
  }
};

// Cancel a bid (if allowed)
exports.cancelBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const userId = req.user._id;

    const bid = await bidModel.getById(bidId);
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Check if user owns the bid
    if (bid.bidderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this bid'
      });
    }

    // Check if bid can be cancelled
    if (bid.bidStatus === 'winning') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel winning bid'
      });
    }

    const auction = await auctionModel.getById(bid.auctionId);

    // Check auction rules
    if (!auction.rules.allowBidRetraction) {
      return res.status(400).json({
        success: false,
        message: 'Bid retraction is not allowed for this auction'
      });
    }

    // Cancel the bid
    await bidModel.cancel(bidId);

    // If this was the highest bid, find the new highest bid
    if (bid.bidStatus === 'winning') {
      const highestBid = await bidModel.findHighestBid(bid.auctionId);
      if (highestBid) {
        await auctionModel.updateById(bid.auctionId, {
          currentPrice: highestBid.bidAmount,
          winnerId: highestBid.bidderId,
          winningBid: highestBid.bidAmount,
          winningBidTime: highestBid.bidTime
        });
        await bidModel.updateById(highestBid._id, { bidStatus: 'winning' });
      } else {
        await auctionModel.updateById(bid.auctionId, {
          currentPrice: auction.startingPrice,
          winnerId: null,
          winningBid: null,
          winningBidTime: null
        });
      }

      await auctionModel.updateById(bid.auctionId, {
        totalBids: auction.totalBids - 1
      });
    }

    res.json({
      success: true,
      message: 'Bid cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling bid:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling bid'
    });
  }
};

// Get bidding statistics
exports.getBiddingStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all bids for the user
    const userBids = await bidModel.find({ bidderId: userId });

    if (userBids.length === 0) {
      return res.json({
        success: true,
        data: {
          totalBids: 0,
          winningBids: 0,
          totalSpent: 0,
          averageBid: 0,
          highestBid: 0,
          winRate: 0
        }
      });
    }

    // Calculate statistics
    const totalBids = userBids.length;
    const winningBids = userBids.filter(bid => bid.bidStatus === 'winning').length;
    const totalSpent = userBids
      .filter(bid => bid.bidStatus === 'winning')
      .reduce((sum, bid) => sum + bid.bidAmount, 0);
    const averageBid = userBids.reduce((sum, bid) => sum + bid.bidAmount, 0) / totalBids;
    const highestBid = Math.max(...userBids.map(bid => bid.bidAmount));
    const winRate = totalBids > 0 ? (winningBids / totalBids) * 100 : 0;

    const userStats = {
      totalBids,
      winningBids,
      totalSpent,
      averageBid,
      highestBid,
      winRate
    };

    res.json({
      success: true,
      data: userStats
    });

  } catch (error) {
    console.error('Error fetching bidding stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching bidding stats'
    });
  }
};

// Set auto-bid for user
exports.setAutoBid = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { maxAmount, increment = 1 } = req.body;
    const userId = req.user._id;

    // Validate auction
    const auction = await auctionModel.getById(auctionId);
    if (!auction || !auction.canAcceptBids) {
      return res.status(400).json({
        success: false,
        message: 'Auction not available for bidding'
      });
    }

    // Check if user already has an auto-bid
    const userBids = await bidModel.findUserBidsForAuction(userId, auctionId);
    const existingAutoBid = userBids.find(bid =>
      bid.isAutoBid && ['active', 'winning'].includes(bid.bidStatus)
    );

    if (existingAutoBid) {
      // Update existing auto-bid
      await bidModel.updateById(existingAutoBid._id, {
        maxAutoBid: maxAmount,
        autoBidIncrement: increment
      });

      const updatedBid = await bidModel.getById(existingAutoBid._id);

      res.json({
        success: true,
        data: updatedBid,
        message: 'Auto-bid updated successfully'
      });
    } else {
      // Create new auto-bid
      const autoBidData = {
        auctionId,
        bidderId: userId,
        bidAmount: auction.currentPrice + auction.bidIncrement,
        isAutoBid: true,
        maxAutoBid: maxAmount,
        autoBidIncrement: increment,
        bidSequence: auction.totalBids + 1
      };

      const autoBid = await bidModel.create(autoBidData);

      // Trigger auto-bidding logic
      await handleAutoBidding(auctionId, userId, maxAmount);

      res.json({
        success: true,
        data: autoBid,
        message: 'Auto-bid set successfully'
      });
    }

  } catch (error) {
    console.error('Error setting auto-bid:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error setting auto-bid'
    });
  }
};

// Remove auto-bid
exports.removeAutoBid = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user._id;

    const userBids = await bidModel.findUserBidsForAuction(userId, auctionId);
    const autoBid = userBids.find(bid =>
      bid.isAutoBid && ['active', 'winning'].includes(bid.bidStatus)
    );

    if (!autoBid) {
      return res.status(404).json({
        success: false,
        message: 'Auto-bid not found'
      });
    }

    await bidModel.cancel(autoBid._id);

    res.json({
      success: true,
      message: 'Auto-bid removed successfully'
    });

  } catch (error) {
    console.error('Error removing auto-bid:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing auto-bid'
    });
  }
};