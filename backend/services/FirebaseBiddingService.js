const auctionModel = require('../models/Auction');
const bidModel = require('../models/Bid');
const User = require('../models/User');

class FirebaseBiddingService {
  constructor() {
    this.activeBids = new Map(); // Track active bidding sessions
  }

  // Validate bid before placement
  async validateBid(auctionId, bidderId, bidAmount) {
    try {
      // Get auction
      const auction = await auctionModel.getById(auctionId);
      if (!auction) {
        return { valid: false, message: 'Auction not found' };
      }

      // Check if auction is active
      if (!auction.canAcceptBids) {
        return { valid: false, message: 'Auction is not accepting bids' };
      }

      // Prevent seller from bidding on own auction
      if (auction.sellerId === bidderId) {
        return { valid: false, message: 'Seller cannot bid on own auction' };
      }

      // Check minimum bid amount
      const minimumBid = auction.currentPrice + auction.bidIncrement;
      if (bidAmount < minimumBid) {
        return {
          valid: false,
          message: `Bid must be at least $${minimumBid.toFixed(2)}`
        };
      }

      // Check user's balance
      const bidder = await User.findById(bidderId);
      if (!bidder || bidder.balance < bidAmount) {
        return { valid: false, message: 'Insufficient balance to place this bid' };
      }

      // Check if user already has the highest bid
      if (auction.winnerId === bidderId) {
        return { valid: false, message: 'You already have the highest bid' };
      }

      return { valid: true, auction, bidder };
    } catch (error) {
      console.error('Error validating bid:', error);
      return { valid: false, message: 'Error validating bid' };
    }
  }

  // Place a bid with validation
  async placeBid(auctionId, bidderId, bidAmount, options = {}) {
    try {
      const { isAutoBid = false, maxAutoBid = null } = options;

      // Validate bid
      const validation = await this.validateBid(auctionId, bidderId, bidAmount);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      const { auction, bidder } = validation;

      // Create bid record
      const bidData = {
        auctionId,
        bidderId,
        bidAmount,
        isAutoBid,
        maxAutoBid: isAutoBid ? maxAutoBid : null,
        bidSequence: auction.totalBids + 1,
        bidTime: new Date()
      };

      const bid = await bidModel.create(bidData);

      // Update auction
      const auctionUpdates = {
        currentPrice: bidAmount,
        totalBids: auction.totalBids + 1,
        winnerId: bidderId,
        winningBid: bidAmount,
        winningBidTime: new Date()
      };

      // Update unique bidders count
      const uniqueBidders = await bidModel.countUniqueBidders(auctionId);
      auctionUpdates.uniqueBidders = uniqueBidders;

      // Check if reserve price is met
      if (auction.reservePrice && bidAmount >= auction.reservePrice) {
        auctionUpdates.reservePrice = null; // Hide reserve price once met
      }

      await auctionModel.updateById(auctionId, auctionUpdates);

      // Mark previous bids as outbid
      const previousWinningBids = await bidModel.findActiveBidsForAuction(auctionId);
      const bidsToMarkOutbid = previousWinningBids.filter(b => b.bidderId !== bidderId);

      for (const bidToUpdate of bidsToMarkOutbid) {
        await bidModel.markAsOutbid(bidToUpdate._id);
      }

      // Mark this bid as winning
      await bidModel.updateById(bid._id, { bidStatus: 'winning' });

      // Handle auto-bidding if enabled
      if (isAutoBid && maxAutoBid > bidAmount) {
        await this.handleAutoBidding(auctionId, bidderId, maxAutoBid);
      }

      // Check if auction should be extended
      const timeRemaining = auction.timeRemaining;
      if (timeRemaining < 300000) { // Less than 5 minutes
        await auctionModel.extendEndTime(auctionId, 5);
      }

      // Get updated auction data
      const updatedAuction = await auctionModel.getById(auctionId);

      return {
        success: true,
        data: {
          bid: { ...bid, bidStatus: 'winning' },
          auction: {
            currentPrice: updatedAuction.currentPrice,
            totalBids: updatedAuction.totalBids,
            uniqueBidders: updatedAuction.uniqueBidders,
            timeRemaining: updatedAuction.timeRemaining
          }
        },
        message: 'Bid placed successfully'
      };

    } catch (error) {
      console.error('Error placing bid:', error);
      return { success: false, message: error.message || 'Error placing bid' };
    }
  }

  // Handle auto-bidding logic
  async handleAutoBidding(auctionId, bidderId, maxAutoBid) {
    try {
      // Get all competing auto-bids
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
            // Validate competing bidder has sufficient balance
            const competingBidder = await User.findById(autoBid.bidderId);
            if (!competingBidder || competingBidder.balance < newBidAmount) {
              continue; // Skip this auto-bid
            }

            // Place competing auto-bid
            const competingBidData = {
              auctionId,
              bidderId: autoBid.bidderId,
              bidAmount: newBidAmount,
              isAutoBid: true,
              bidSequence: auction.totalBids + 1,
              bidTime: new Date()
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

  // Cancel a bid
  async cancelBid(bidId, userId) {
    try {
      const bid = await bidModel.getById(bidId);
      if (!bid) {
        return { success: false, message: 'Bid not found' };
      }

      // Check if user owns the bid
      if (bid.bidderId !== userId) {
        return { success: false, message: 'Not authorized to cancel this bid' };
      }

      // Check if bid can be cancelled
      if (bid.bidStatus === 'winning') {
        return { success: false, message: 'Cannot cancel winning bid' };
      }

      const auction = await auctionModel.getById(bid.auctionId);

      // Check auction rules
      if (!auction.rules.allowBidRetraction) {
        return { success: false, message: 'Bid retraction is not allowed for this auction' };
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

      return { success: true, message: 'Bid cancelled successfully' };

    } catch (error) {
      console.error('Error cancelling bid:', error);
      return { success: false, message: error.message || 'Error cancelling bid' };
    }
  }

  // Set auto-bid for user
  async setAutoBid(auctionId, userId, maxAmount, increment = 1) {
    try {
      // Validate auction
      const auction = await auctionModel.getById(auctionId);
      if (!auction || !auction.canAcceptBids) {
        return { success: false, message: 'Auction not available for bidding' };
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
        return {
          success: true,
          data: updatedBid,
          message: 'Auto-bid updated successfully'
        };
      } else {
        // Create new auto-bid
        const autoBidData = {
          auctionId,
          bidderId: userId,
          bidAmount: auction.currentPrice + auction.bidIncrement,
          isAutoBid: true,
          maxAutoBid: maxAmount,
          autoBidIncrement: increment,
          bidSequence: auction.totalBids + 1,
          bidTime: new Date()
        };

        const autoBid = await bidModel.create(autoBidData);

        // Trigger auto-bidding logic
        await this.handleAutoBidding(auctionId, userId, maxAmount);

        return {
          success: true,
          data: autoBid,
          message: 'Auto-bid set successfully'
        };
      }

    } catch (error) {
      console.error('Error setting auto-bid:', error);
      return { success: false, message: error.message || 'Error setting auto-bid' };
    }
  }

  // Remove auto-bid
  async removeAutoBid(auctionId, userId) {
    try {
      const userBids = await bidModel.findUserBidsForAuction(userId, auctionId);
      const autoBid = userBids.find(bid =>
        bid.isAutoBid && ['active', 'winning'].includes(bid.bidStatus)
      );

      if (!autoBid) {
        return { success: false, message: 'Auto-bid not found' };
      }

      await bidModel.cancel(autoBid._id);

      return { success: true, message: 'Auto-bid removed successfully' };

    } catch (error) {
      console.error('Error removing auto-bid:', error);
      return { success: false, message: error.message || 'Error removing auto-bid' };
    }
  }

  // Get bid statistics for auction
  async getBidStatistics(auctionId) {
    try {
      return await bidModel.getBidStatistics(auctionId);
    } catch (error) {
      console.error('Error getting bid statistics:', error);
      return null;
    }
  }

  // Check if bid amount is valid increment
  isValidBidIncrement(currentPrice, bidAmount, increment) {
    const expectedMinBid = currentPrice + increment;
    return bidAmount >= expectedMinBid;
  }

  // Calculate next minimum bid
  calculateNextMinimumBid(currentPrice, increment) {
    return currentPrice + increment;
  }

  // Get user's bidding activity
  async getUserBiddingActivity(userId, options = {}) {
    try {
      const { limit = 50, status } = options;

      const filters = { bidderId: userId };
      if (status) filters.bidStatus = status;

      const bids = await bidModel.find(filters, {
        sort: { bidTime: -1 },
        limit
      });

      // Get auction details for each bid
      const bidsWithAuctions = await Promise.all(
        bids.map(async (bid) => {
          const auction = await auctionModel.getById(bid.auctionId);
          return {
            ...bid,
            auction: auction ? {
              title: auction.title,
              currentPrice: auction.currentPrice,
              endTime: auction.endTime,
              status: auction.status
            } : null
          };
        })
      );

      return bidsWithAuctions;

    } catch (error) {
      console.error('Error getting user bidding activity:', error);
      return [];
    }
  }

  // Process auction end
  async processAuctionEnd(auctionId) {
    try {
      const auction = await auctionModel.getById(auctionId);
      if (!auction || auction.status !== 'active') {
        return { success: false, message: 'Auction not found or not active' };
      }

      // Get highest bid
      const highestBid = await bidModel.findHighestBid(auctionId);

      if (highestBid && auction.reservePrice && highestBid.bidAmount >= auction.reservePrice) {
        // Auction won
        await auctionModel.endAuction(
          auctionId,
          highestBid.bidderId,
          highestBid.bidderId, // winner name will be populated from user data
          highestBid.bidAmount
        );

        // Mark winning bid
        await bidModel.updateById(highestBid._id, { bidStatus: 'winning' });

        return {
          success: true,
          message: 'Auction ended successfully',
          winner: highestBid.bidderId,
          finalPrice: highestBid.bidAmount
        };
      } else {
        // Auction ended without meeting reserve or no bids
        await auctionModel.endAuction(auctionId);

        return {
          success: true,
          message: 'Auction ended without meeting reserve price',
          winner: null,
          finalPrice: null
        };
      }

    } catch (error) {
      console.error('Error processing auction end:', error);
      return { success: false, message: error.message || 'Error processing auction end' };
    }
  }
}

// Export singleton instance
module.exports = new FirebaseBiddingService();