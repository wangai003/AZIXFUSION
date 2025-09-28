const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/AuctionController');
const biddingController = require('../controllers/BiddingController');
const verifyToken = require('../middleware/VerifyToken');

// Authentication middleware for protected routes
const requireAuth = verifyToken;

// Auction CRUD operations
router.post('/', requireAuth, auctionController.createAuction);
router.get('/', auctionController.getAllAuctions);
router.get('/:id', auctionController.getAuctionById);
router.put('/:id', requireAuth, auctionController.updateAuction);
router.delete('/:id', requireAuth, auctionController.deleteAuction);

// Seller-specific routes
router.get('/seller/auctions', requireAuth, auctionController.getSellerAuctions);

// Featured and special auction routes
router.get('/featured/list', auctionController.getFeaturedAuctions);
router.get('/ending-soon/list', auctionController.getEndingSoonAuctions);

// Watchlist routes
router.post('/:id/watch', requireAuth, auctionController.toggleWatch);
router.get('/user/watchlist', requireAuth, auctionController.getWatchlist);

// Bidding routes
router.post('/:auctionId/bids', requireAuth, biddingController.placeBid);
router.get('/:auctionId/bids', biddingController.getBidHistory);
router.delete('/:auctionId/bids/:bidId', requireAuth, biddingController.cancelBid);

// Auto-bidding routes
router.post('/:auctionId/auto-bid', requireAuth, biddingController.setAutoBid);
router.delete('/:auctionId/auto-bid', requireAuth, biddingController.removeAutoBid);

// User bidding routes
router.get('/user/bids', requireAuth, biddingController.getUserBids);
router.get('/user/stats', requireAuth, biddingController.getBiddingStats);

module.exports = router;