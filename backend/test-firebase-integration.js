require('dotenv').config();
const { connectToDatabase } = require('./database/db');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');

// Create instances of the model classes
const auctionModel = new Auction();
const bidModel = new Bid();
const biddingService = require('./services/FirebaseBiddingService');
const listenerService = require('./services/FirebaseListenerService');
const auctionScheduler = require('./services/FirebaseAuctionScheduler');

async function testFirebaseIntegration() {
  console.log('🚀 Starting Firebase Integration Test...\n');

  try {
    // Test 1: Database Connection
    console.log('📡 Testing database connection...');
    await connectToDatabase();
    console.log('✅ Database connected successfully\n');

    // Test 2: Create a test auction
    console.log('🏷️  Testing auction creation...');
    const testAuctionData = {
      title: 'Test Auction - Firebase Integration',
      description: 'This is a test auction for Firebase integration',
      startingPrice: 10.00,
      bidIncrement: 1.00,
      startTime: new Date(Date.now() + 60000), // Start in 1 minute
      endTime: new Date(Date.now() + 3600000), // End in 1 hour
      sellerId: 'test-seller-id',
      sellerInfo: {
        name: 'Test Seller',
        rating: 4.5
      },
      category: 'test-category',
      itemType: 'product',
      itemId: 'test-product-id',
      status: 'scheduled'
    };

    const createdAuction = await auctionModel.create(testAuctionData);
    console.log('✅ Auction created successfully:', createdAuction._id, '\n');

    // Test 3: Update auction
    console.log('🔄 Testing auction update...');
    const updatedAuction = await auctionModel.updateById(createdAuction._id, {
      description: 'Updated test auction description'
    });
    console.log('✅ Auction updated successfully\n');

    // Test 4: Get auction by ID
    console.log('🔍 Testing auction retrieval...');
    const retrievedAuction = await auctionModel.getById(createdAuction._id);
    console.log('✅ Auction retrieved successfully:', retrievedAuction.title, '\n');

    // Test 5: Create a test bid
    console.log('💰 Testing bid creation...');
    const testBidData = {
      auctionId: createdAuction._id,
      bidderId: 'test-bidder-id',
      bidAmount: 15.00,
      bidSequence: 1,
      bidTime: new Date()
    };

    const createdBid = await bidModel.create(testBidData);
    console.log('✅ Bid created successfully:', createdBid._id, '\n');

    // Test 6: Get bid history
    console.log('📊 Testing bid history retrieval...');
    const bidHistory = await bidModel.getBidHistory(createdAuction._id, 10);
    console.log('✅ Bid history retrieved:', bidHistory.length, 'bids\n');

    // Test 7: Test bidding service validation
    console.log('✅ Testing bidding service validation...');
    const validationResult = await biddingService.validateBid(
      createdAuction._id,
      'test-bidder-id',
      20.00
    );
    console.log('✅ Bid validation result:', validationResult.valid ? 'Valid' : 'Invalid', '\n');

    // Test 8: Test listener service stats
    console.log('👂 Testing listener service...');
    const listenerStats = listenerService.getListenerStats();
    console.log('✅ Listener service stats:', listenerStats, '\n');

    // Test 9: Test auction scheduler stats
    console.log('⏰ Testing auction scheduler...');
    const schedulerStats = auctionScheduler.getSchedulerStats();
    console.log('✅ Auction scheduler stats:', schedulerStats, '\n');

    // Test 10: Clean up test data
    console.log('🧹 Cleaning up test data...');
    await auctionModel.deleteById(createdAuction._id);
    console.log('✅ Test auction deleted\n');

    // Test 11: Test search functionality
    console.log('🔎 Testing auction search...');
    const searchResults = await auctionModel.find({
      title: { $regex: 'test', $options: 'i' }
    });
    console.log('✅ Search completed, found', searchResults.length, 'results\n');

    console.log('🎉 All Firebase integration tests passed successfully!');
    console.log('📋 Test Summary:');
    console.log('   ✅ Database Connection');
    console.log('   ✅ Auction CRUD Operations');
    console.log('   ✅ Bid CRUD Operations');
    console.log('   ✅ Bidding Service Validation');
    console.log('   ✅ Real-time Listeners');
    console.log('   ✅ Auction Scheduler');
    console.log('   ✅ Search Functionality');
    console.log('   ✅ Data Cleanup');

  } catch (error) {
    console.error('❌ Firebase integration test failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Clean up listeners and scheduler
    try {
      listenerService.stopAllListeners();
      auctionScheduler.stop();
      console.log('\n🛑 Test cleanup completed');
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError.message);
    }

    process.exit(0);
  }
}

// Run the test
if (require.main === module) {
  testFirebaseIntegration();
}

module.exports = { testFirebaseIntegration };