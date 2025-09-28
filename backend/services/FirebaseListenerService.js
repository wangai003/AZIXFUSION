const { db } = require('../database/firebase');
const auctionModel = require('../models/Auction');
const bidModel = require('../models/Bid');

class FirebaseListenerService {
  constructor() {
    this.auctionListeners = new Map();
    this.bidListeners = new Map();
    this.activeListeners = new Set();
  }

  // Start listening to auction changes
  listenToAuction(auctionId, callback) {
    if (this.auctionListeners.has(auctionId)) {
      return; // Already listening
    }

    const unsubscribe = db.collection('auctions').doc(auctionId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const auction = {
            _id: doc.id,
            ...doc.data(),
            // Add computed properties
            isActive: this.isAuctionActive(doc.data()),
            timeRemaining: this.calculateTimeRemaining(doc.data())
          };
          callback(auction);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error(`Error listening to auction ${auctionId}:`, error);
      });

    this.auctionListeners.set(auctionId, unsubscribe);
    this.activeListeners.add(unsubscribe);

    return unsubscribe;
  }

  // Stop listening to auction changes
  stopListeningToAuction(auctionId) {
    const unsubscribe = this.auctionListeners.get(auctionId);
    if (unsubscribe) {
      unsubscribe();
      this.auctionListeners.delete(auctionId);
      this.activeListeners.delete(unsubscribe);
    }
  }

  // Listen to bid changes for an auction
  listenToAuctionBids(auctionId, callback) {
    const listenerKey = `bids_${auctionId}`;

    if (this.bidListeners.has(listenerKey)) {
      return; // Already listening
    }

    const unsubscribe = db.collection('bids')
      .where('auctionId', '==', auctionId)
      .orderBy('bidTime', 'desc')
      .limit(50)
      .onSnapshot((snapshot) => {
        const bids = [];
        snapshot.forEach((doc) => {
          bids.push({
            _id: doc.id,
            ...doc.data()
          });
        });
        callback(bids);
      }, (error) => {
        console.error(`Error listening to bids for auction ${auctionId}:`, error);
      });

    this.bidListeners.set(listenerKey, unsubscribe);
    this.activeListeners.add(unsubscribe);

    return unsubscribe;
  }

  // Stop listening to bid changes
  stopListeningToAuctionBids(auctionId) {
    const listenerKey = `bids_${auctionId}`;
    const unsubscribe = this.bidListeners.get(listenerKey);
    if (unsubscribe) {
      unsubscribe();
      this.bidListeners.delete(listenerKey);
      this.activeListeners.delete(unsubscribe);
    }
  }

  // Listen to active auctions
  listenToActiveAuctions(callback) {
    const listenerKey = 'active_auctions';

    if (this.bidListeners.has(listenerKey)) {
      return; // Already listening
    }

    const now = new Date();
    const unsubscribe = db.collection('auctions')
      .where('status', '==', 'active')
      .where('endTime', '>', now)
      .where('isDeleted', '==', false)
      .onSnapshot((snapshot) => {
        const auctions = [];
        snapshot.forEach((doc) => {
          auctions.push({
            _id: doc.id,
            ...doc.data(),
            isActive: true,
            timeRemaining: this.calculateTimeRemaining(doc.data())
          });
        });
        callback(auctions);
      }, (error) => {
        console.error('Error listening to active auctions:', error);
      });

    this.bidListeners.set(listenerKey, unsubscribe);
    this.activeListeners.add(unsubscribe);

    return unsubscribe;
  }

  // Listen to user's bids
  listenToUserBids(userId, callback) {
    const listenerKey = `user_bids_${userId}`;

    if (this.bidListeners.has(listenerKey)) {
      return; // Already listening
    }

    const unsubscribe = db.collection('bids')
      .where('bidderId', '==', userId)
      .orderBy('bidTime', 'desc')
      .limit(100)
      .onSnapshot((snapshot) => {
        const bids = [];
        snapshot.forEach((doc) => {
          bids.push({
            _id: doc.id,
            ...doc.data()
          });
        });
        callback(bids);
      }, (error) => {
        console.error(`Error listening to bids for user ${userId}:`, error);
      });

    this.bidListeners.set(listenerKey, unsubscribe);
    this.activeListeners.add(unsubscribe);

    return unsubscribe;
  }

  // Listen to auctions ending soon
  listenToEndingSoonAuctions(minutes = 60, callback) {
    const listenerKey = `ending_soon_${minutes}`;

    if (this.bidListeners.has(listenerKey)) {
      return; // Already listening
    }

    const now = new Date();
    const futureTime = new Date(Date.now() + minutes * 60 * 1000);

    const unsubscribe = db.collection('auctions')
      .where('status', '==', 'active')
      .where('endTime', '>', now)
      .where('endTime', '<=', futureTime)
      .where('isDeleted', '==', false)
      .onSnapshot((snapshot) => {
        const auctions = [];
        snapshot.forEach((doc) => {
          auctions.push({
            _id: doc.id,
            ...doc.data(),
            isActive: true,
            timeRemaining: this.calculateTimeRemaining(doc.data())
          });
        });
        callback(auctions);
      }, (error) => {
        console.error('Error listening to ending soon auctions:', error);
      });

    this.bidListeners.set(listenerKey, unsubscribe);
    this.activeListeners.add(unsubscribe);

    return unsubscribe;
  }

  // Listen to featured auctions
  listenToFeaturedAuctions(callback) {
    const listenerKey = 'featured_auctions';

    if (this.bidListeners.has(listenerKey)) {
      return; // Already listening
    }

    const now = new Date();
    const unsubscribe = db.collection('auctions')
      .where('status', '==', 'active')
      .where('endTime', '>', now)
      .where('featured', '==', true)
      .where('isDeleted', '==', false)
      .onSnapshot((snapshot) => {
        const auctions = [];
        snapshot.forEach((doc) => {
          auctions.push({
            _id: doc.id,
            ...doc.data(),
            isActive: true,
            timeRemaining: this.calculateTimeRemaining(doc.data())
          });
        });
        callback(auctions);
      }, (error) => {
        console.error('Error listening to featured auctions:', error);
      });

    this.bidListeners.set(listenerKey, unsubscribe);
    this.activeListeners.add(unsubscribe);

    return unsubscribe;
  }

  // Listen to auctions by category
  listenToAuctionsByCategory(categoryId, type = 'main', callback) {
    const listenerKey = `category_${type}_${categoryId}`;

    if (this.bidListeners.has(listenerKey)) {
      return; // Already listening
    }

    let query = db.collection('auctions')
      .where('isDeleted', '==', false);

    if (type === 'main') {
      query = query.where('category', '==', categoryId);
    } else if (type === 'sub') {
      query = query.where('subcategory', '==', categoryId);
    }

    const unsubscribe = query
      .onSnapshot((snapshot) => {
        const auctions = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          auctions.push({
            _id: doc.id,
            ...data,
            isActive: this.isAuctionActive(data),
            timeRemaining: this.calculateTimeRemaining(data)
          });
        });
        callback(auctions);
      }, (error) => {
        console.error(`Error listening to auctions by category ${categoryId}:`, error);
      });

    this.bidListeners.set(listenerKey, unsubscribe);
    this.activeListeners.add(unsubscribe);

    return unsubscribe;
  }

  // Stop all listeners
  stopAllListeners() {
    this.activeListeners.forEach(unsubscribe => {
      unsubscribe();
    });

    this.auctionListeners.clear();
    this.bidListeners.clear();
    this.activeListeners.clear();
  }

  // Helper methods
  isAuctionActive(auctionData) {
    const now = new Date();
    const endTime = auctionData.endTime ? new Date(auctionData.endTime.seconds * 1000) : new Date();
    return auctionData.status === 'active' && endTime > now;
  }

  calculateTimeRemaining(auctionData) {
    if (auctionData.status !== 'active') return 0;

    const now = new Date();
    const endTime = auctionData.endTime ? new Date(auctionData.endTime.seconds * 1000) : new Date();

    return Math.max(0, endTime - now);
  }

  // Get listener statistics
  getListenerStats() {
    return {
      auctionListeners: this.auctionListeners.size,
      bidListeners: this.bidListeners.size,
      totalActiveListeners: this.activeListeners.size
    };
  }
}

// Export singleton instance
module.exports = new FirebaseListenerService();