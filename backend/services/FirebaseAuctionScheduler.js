const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const biddingService = require('./FirebaseBiddingService');
const webSocketService = require('./WebSocketService');

// Instantiate the models
const auctionModel = new Auction();
const bidModel = new Bid();

class FirebaseAuctionScheduler {
  constructor() {
    this.activeTimers = new Map(); // auctionId -> timer
    this.endingSoonTimers = new Map(); // auctionId -> timer
    this.notificationTimers = new Map(); // auctionId -> timer
    this.checkInterval = 60000; // Check every minute
    this.mainInterval = null;
  }

  // Start the scheduler
  start() {
    console.log('🚀 Starting Firebase Auction Scheduler...');
    this.mainInterval = setInterval(() => {
      this.checkAndProcessAuctions();
    }, this.checkInterval);
  }

  // Stop the scheduler
  stop() {
    console.log('🛑 Stopping Firebase Auction Scheduler...');
    if (this.mainInterval) {
      clearInterval(this.mainInterval);
      this.mainInterval = null;
    }

    // Clear all timers
    this.activeTimers.forEach(timer => clearTimeout(timer));
    this.endingSoonTimers.forEach(timer => clearTimeout(timer));
    this.notificationTimers.forEach(timer => clearTimeout(timer));

    this.activeTimers.clear();
    this.endingSoonTimers.clear();
    this.notificationTimers.clear();
  }

  // Main check function
  async checkAndProcessAuctions() {
    try {
      const now = new Date();

      // Find all active auctions and filter client-side for ended ones
      const allActiveAuctions = await auctionModel.find({
        status: 'active',
        isDeleted: false
      });

      // Process ended auctions
      const endedAuctions = allActiveAuctions.filter(auction =>
        new Date(auction.endTime) <= now
      );

      for (const auction of endedAuctions) {
        await this.processAuctionEnd(auction._id);
      }

      // Find auctions ending soon (within 10 minutes)
      const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
      const endingSoonAuctions = allActiveAuctions.filter(auction =>
        new Date(auction.endTime) > now && new Date(auction.endTime) <= tenMinutesFromNow
      );

      // Set up ending soon notifications
      for (const auction of endingSoonAuctions) {
        await this.scheduleEndingSoonNotification(auction);
      }

      // Find auctions starting soon (within 5 minutes)
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      const allScheduledAuctions = await auctionModel.find({
        status: 'scheduled',
        isDeleted: false
      });

      const startingSoonAuctions = allScheduledAuctions.filter(auction =>
        new Date(auction.startTime) <= fiveMinutesFromNow && new Date(auction.startTime) > now
      );

      // Activate auctions that should start
      for (const auction of startingSoonAuctions) {
        await this.activateAuction(auction._id);
      }

    } catch (error) {
      console.error('Error in auction scheduler check:', error);
    }
  }

  // Process auction end
  async processAuctionEnd(auctionId) {
    try {
      console.log(`🏁 Processing end for auction ${auctionId}`);

      const result = await biddingService.processAuctionEnd(auctionId);

      if (result.success) {
        console.log(`✅ Auction ${auctionId} ended successfully`);

        // Broadcast auction ending to all connected clients
        const endedAuction = await auctionModel.getById(auctionId);
        webSocketService.broadcastToAll('auction-ended', endedAuction);

        // Send notifications to winner and seller
        await this.sendAuctionEndNotifications(auctionId, result);

        // Clean up any timers for this auction
        this.clearAuctionTimers(auctionId);
      } else {
        console.error(`❌ Failed to process end for auction ${auctionId}:`, result.message);
      }

    } catch (error) {
      console.error(`Error processing auction end for ${auctionId}:`, error);
    }
  }

  // Schedule ending soon notification
  async scheduleEndingSoonNotification(auction) {
    const auctionId = auction._id;
    const endTime = new Date(auction.endTime);
    const now = new Date();
    const timeUntilEnd = endTime - now;

    // Don't schedule if already scheduled or ending in more than 10 minutes
    if (this.endingSoonTimers.has(auctionId) || timeUntilEnd > 10 * 60 * 1000) {
      return;
    }

    // Schedule notification for 5 minutes before end
    const notificationTime = Math.max(0, timeUntilEnd - 5 * 60 * 1000);

    const timer = setTimeout(async () => {
      try {
        await this.sendEndingSoonNotification(auctionId);
        this.endingSoonTimers.delete(auctionId);
      } catch (error) {
        console.error(`Error sending ending soon notification for auction ${auctionId}:`, error);
      }
    }, notificationTime);

    this.endingSoonTimers.set(auctionId, timer);
  }

  // Activate scheduled auction
  async activateAuction(auctionId) {
    try {
      console.log(`🚀 Activating auction ${auctionId}`);

      await auctionModel.updateById(auctionId, { status: 'active' });

      // Send activation notifications
      await this.sendAuctionActivationNotification(auctionId);

      console.log(`✅ Auction ${auctionId} activated successfully`);

    } catch (error) {
      console.error(`Error activating auction ${auctionId}:`, error);
    }
  }

  // Send ending soon notification
  async sendEndingSoonNotification(auctionId) {
    try {
      const auction = await auctionModel.getById(auctionId);
      if (!auction) return;

      // Get all bidders for this auction
      const bidders = await bidModel.find({ auctionId });
      const uniqueBidderIds = [...new Set(bidders.map(bid => bid.bidderId))];

      console.log(`📢 Sending ending soon notifications for auction ${auctionId} to ${uniqueBidderIds.length} bidders`);

      // In a real implementation, you would send actual notifications here
      // For now, just log the notification
      for (const bidderId of uniqueBidderIds) {
        console.log(`📧 Ending soon notification sent to bidder ${bidderId} for auction ${auction.title}`);
      }

    } catch (error) {
      console.error('Error sending ending soon notification:', error);
    }
  }

  // Send auction activation notification
  async sendAuctionActivationNotification(auctionId) {
    try {
      const auction = await auctionModel.getById(auctionId);
      if (!auction) return;

      console.log(`📢 Auction ${auction.title} is now live and accepting bids!`);

      // In a real implementation, you would send notifications to:
      // - Auction seller
      // - Users who have favorited/watched this auction
      // - Users who have set auto-bids

    } catch (error) {
      console.error('Error sending auction activation notification:', error);
    }
  }

  // Send auction end notifications
  async sendAuctionEndNotifications(auctionId, result) {
    try {
      const auction = await auctionModel.getById(auctionId);
      if (!auction) return;

      if (result.winner) {
        console.log(`🎉 Auction ${auction.title} won by ${result.winner} for $${result.finalPrice}`);

        // Send winner notification
        console.log(`📧 Winner notification sent to ${result.winner}`);

        // Send seller notification
        console.log(`📧 Sale notification sent to seller ${auction.sellerId}`);

      } else {
        console.log(`😔 Auction ${auction.title} ended without meeting reserve price`);

        // Send no-sale notification to seller
        console.log(`📧 No-sale notification sent to seller ${auction.sellerId}`);
      }

      // Send notifications to all bidders
      const bidders = await bidModel.find({ auctionId });
      const uniqueBidderIds = [...new Set(bidders.map(bid => bid.bidderId))];

      for (const bidderId of uniqueBidderIds) {
        if (bidderId !== result.winner) {
          console.log(`📧 Outbid notification sent to ${bidderId}`);
        }
      }

    } catch (error) {
      console.error('Error sending auction end notifications:', error);
    }
  }

  // Clear timers for a specific auction
  clearAuctionTimers(auctionId) {
    if (this.activeTimers.has(auctionId)) {
      clearTimeout(this.activeTimers.get(auctionId));
      this.activeTimers.delete(auctionId);
    }

    if (this.endingSoonTimers.has(auctionId)) {
      clearTimeout(this.endingSoonTimers.get(auctionId));
      this.endingSoonTimers.delete(auctionId);
    }

    if (this.notificationTimers.has(auctionId)) {
      clearTimeout(this.notificationTimers.get(auctionId));
      this.notificationTimers.delete(auctionId);
    }
  }

  // Force end auction (admin function)
  async forceEndAuction(auctionId, reason = 'admin_action') {
    try {
      console.log(`⚡ Force ending auction ${auctionId} - Reason: ${reason}`);

      const result = await biddingService.processAuctionEnd(auctionId);

      if (result.success) {
        // Mark as cancelled instead of ended if force ended
        await auctionModel.updateById(auctionId, {
          status: 'cancelled',
          endTime: new Date()
        });

        console.log(`✅ Auction ${auctionId} force ended successfully`);
        return { success: true, message: 'Auction force ended successfully' };
      } else {
        return { success: false, message: result.message };
      }

    } catch (error) {
      console.error(`Error force ending auction ${auctionId}:`, error);
      return { success: false, message: error.message };
    }
  }

  // Extend auction time
  async extendAuctionTime(auctionId, minutes = 5) {
    try {
      console.log(`⏰ Extending auction ${auctionId} by ${minutes} minutes`);

      await auctionModel.extendEndTime(auctionId, minutes);

      // Clear existing timers and reschedule
      this.clearAuctionTimers(auctionId);

      const auction = await auctionModel.getById(auctionId);
      if (auction) {
        await this.scheduleEndingSoonNotification(auction);
      }

      console.log(`✅ Auction ${auctionId} extended successfully`);
      return { success: true, message: `Auction extended by ${minutes} minutes` };

    } catch (error) {
      console.error(`Error extending auction ${auctionId}:`, error);
      return { success: false, message: error.message };
    }
  }

  // Get scheduler statistics
  getSchedulerStats() {
    return {
      activeTimers: this.activeTimers.size,
      endingSoonTimers: this.endingSoonTimers.size,
      notificationTimers: this.notificationTimers.size,
      checkInterval: this.checkInterval,
      isRunning: this.mainInterval !== null
    };
  }

  // Manual trigger for testing
  async triggerCheck() {
    console.log('🔧 Manual trigger for auction scheduler check');
    await this.checkAndProcessAuctions();
  }

  // Get auctions requiring attention
  async getAuctionsRequiringAttention() {
    try {
      const now = new Date();
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);

      const [endingSoon, startingSoon, recentlyEnded] = await Promise.all([
        // Auctions ending within 10 minutes
        auctionModel.find({
          status: 'active',
          endTime: { $gt: now, $lte: tenMinutesFromNow },
          isDeleted: false
        }),

        // Auctions starting within 5 minutes
        auctionModel.find({
          status: 'scheduled',
          startTime: { $lte: fiveMinutesFromNow, $gt: now },
          isDeleted: false
        }),

        // Auctions that ended in the last 5 minutes
        auctionModel.find({
          status: 'ended',
          endTime: { $gte: new Date(Date.now() - 5 * 60 * 1000), $lte: now },
          isDeleted: false
        })
      ]);

      return {
        endingSoon: endingSoon.length,
        startingSoon: startingSoon.length,
        recentlyEnded: recentlyEnded.length,
        totalRequiringAttention: endingSoon.length + startingSoon.length + recentlyEnded.length
      };

    } catch (error) {
      console.error('Error getting auctions requiring attention:', error);
      return {
        endingSoon: 0,
        startingSoon: 0,
        recentlyEnded: 0,
        totalRequiringAttention: 0
      };
    }
  }
}

// Export singleton instance
module.exports = new FirebaseAuctionScheduler();