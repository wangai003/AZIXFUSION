import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosi as axios } from '../../config/axios';

// Async thunks for auction operations
export const fetchAuctions = createAsyncThunk(
  'auctions/fetchAuctions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/auctions', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAuctionById = createAsyncThunk(
  'auctions/fetchAuctionById',
  async (auctionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/auctions/${auctionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createAuction = createAsyncThunk(
  'auctions/createAuction',
  async (auctionData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auctions', auctionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateAuction = createAsyncThunk(
  'auctions/updateAuction',
  async ({ auctionId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/auctions/${auctionId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteAuction = createAsyncThunk(
  'auctions/deleteAuction',
  async (auctionId, { rejectWithValue }) => {
    try {
      await axios.delete(`/auctions/${auctionId}`);
      return auctionId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const placeBid = createAsyncThunk(
  'auctions/placeBid',
  async ({ auctionId, bidAmount }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/auctions/${auctionId}/bids`, { bidAmount });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBidHistory = createAsyncThunk(
  'auctions/fetchBidHistory',
  async (auctionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/auctions/${auctionId}/bids`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleWatchAuction = createAsyncThunk(
  'auctions/toggleWatch',
  async (auctionId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/auctions/${auctionId}/watch`);
      return { auctionId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWatchlist = createAsyncThunk(
  'auctions/fetchWatchlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/auctions/user/watchlist');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSellerAuctions = createAsyncThunk(
  'auctions/fetchSellerAuctions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/auctions/seller/auctions', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFeaturedAuctions = createAsyncThunk(
  'auctions/fetchFeaturedAuctions',
  async (limit = 8, { rejectWithValue }) => {
    try {
      const response = await axios.get('/auctions/featured/list', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEndingSoonAuctions = createAsyncThunk(
  'auctions/fetchEndingSoonAuctions',
  async (minutes = 60, { rejectWithValue }) => {
    try {
      const response = await axios.get('/auctions/ending-soon/list', {
        params: { minutes }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const auctionSlice = createSlice({
  name: 'auctions',
  initialState: {
    // Auction lists
    list: [],
    current: null,
    sellerAuctions: [],
    watchlist: [],
    featured: [],
    endingSoon: [],

    // Bidding
    bidHistory: [],
    userBids: [],

    // UI state
    loading: false,
    error: null,
    filters: {
      category: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'startTime',
      order: 'desc'
    },
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      pages: 0
    },

    // Real-time state
    activeAuction: null,
    realTimeUpdates: [],
    participantCount: 0
  },
  reducers: {
    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        status: '',
        minPrice: '',
        maxPrice: '',
        search: '',
        sort: 'startTime',
        order: 'desc'
      };
    },

    // Real-time actions
    setActiveAuction: (state, action) => {
      state.activeAuction = action.payload;
    },
    updateAuctionPrice: (state, action) => {
      const { auctionId, newPrice, bidData } = action.payload;

      // Update in main list
      const auctionIndex = state.list.findIndex(a => a._id === auctionId);
      if (auctionIndex !== -1) {
        state.list[auctionIndex].currentPrice = newPrice;
        state.list[auctionIndex].totalBids += 1;
        if (bidData) {
          state.list[auctionIndex].uniqueBidders = bidData.uniqueBidders || state.list[auctionIndex].uniqueBidders;
        }
      }

      // Update in featured auctions
      const featuredIndex = state.featured.findIndex(a => a._id === auctionId);
      if (featuredIndex !== -1) {
        state.featured[featuredIndex].currentPrice = newPrice;
        state.featured[featuredIndex].totalBids += 1;
        if (bidData) {
          state.featured[featuredIndex].uniqueBidders = bidData.uniqueBidders || state.featured[featuredIndex].uniqueBidders;
        }
      }

      // Update in ending soon auctions
      const endingSoonIndex = state.endingSoon.findIndex(a => a._id === auctionId);
      if (endingSoonIndex !== -1) {
        state.endingSoon[endingSoonIndex].currentPrice = newPrice;
        state.endingSoon[endingSoonIndex].totalBids += 1;
        if (bidData) {
          state.endingSoon[endingSoonIndex].uniqueBidders = bidData.uniqueBidders || state.endingSoon[endingSoonIndex].uniqueBidders;
        }
      }

      // Update current auction
      if (state.current && state.current._id === auctionId) {
        state.current.currentPrice = newPrice;
        state.current.totalBids += 1;
        if (bidData) {
          state.current.uniqueBidders = bidData.uniqueBidders || state.current.uniqueBidders;
        }
      }

      // Add to real-time updates
      state.realTimeUpdates.unshift({
        type: 'bid',
        auctionId,
        data: bidData,
        timestamp: new Date()
      });

      // Keep only last 50 updates
      if (state.realTimeUpdates.length > 50) {
        state.realTimeUpdates = state.realTimeUpdates.slice(0, 50);
      }
    },
    updateParticipantCount: (state, action) => {
      state.participantCount = action.payload;
    },
    addRealTimeUpdate: (state, action) => {
      state.realTimeUpdates.unshift({
        ...action.payload,
        timestamp: new Date()
      });

      if (state.realTimeUpdates.length > 50) {
        state.realTimeUpdates = state.realTimeUpdates.slice(0, 50);
      }
    },
    clearRealTimeUpdates: (state) => {
      state.realTimeUpdates = [];
    },

    // Real-time auction management
    addAuctionToList: (state, action) => {
      const newAuction = action.payload;
      // Add to main list if not already present
      const exists = state.list.find(a => a._id === newAuction._id);
      if (!exists) {
        state.list.unshift(newAuction);
      }

      // Check if it should be in featured
      if (newAuction.featured) {
        const featuredExists = state.featured.find(a => a._id === newAuction._id);
        if (!featuredExists) {
          state.featured.unshift(newAuction);
        }
      }

      // Check if it should be in ending soon (within 1 hour)
      const now = new Date();
      const endTime = new Date(newAuction.endTime);
      const timeDiff = endTime - now;
      const oneHour = 60 * 60 * 1000;
      if (timeDiff > 0 && timeDiff <= oneHour) {
        const endingSoonExists = state.endingSoon.find(a => a._id === newAuction._id);
        if (!endingSoonExists) {
          state.endingSoon.unshift(newAuction);
        }
      }
    },

    removeAuctionFromList: (state, action) => {
      const auctionId = action.payload;

      // Remove from main list
      state.list = state.list.filter(a => a._id !== auctionId);

      // Remove from featured
      state.featured = state.featured.filter(a => a._id !== auctionId);

      // Remove from ending soon
      state.endingSoon = state.endingSoon.filter(a => a._id !== auctionId);

      // Clear current if it's the removed auction
      if (state.current && state.current._id === auctionId) {
        state.current = null;
      }
    },

    // Auction timer updates
    updateAuctionTimer: (state, action) => {
      const { auctionId, timeRemaining } = action.payload;

      const auction = state.list.find(a => a._id === auctionId);
      if (auction) {
        auction.timeRemaining = timeRemaining;
      }

      if (state.current && state.current._id === auctionId) {
        state.current.timeRemaining = timeRemaining;
      }
    },

    // Clear states
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAuction: (state) => {
      state.current = null;
      state.bidHistory = [];
      state.activeAuction = null;
      state.participantCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch auctions
      .addCase(fetchAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch auction by ID
      .addCase(fetchAuctionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctionById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.data.auction;
        state.bidHistory = action.payload.data.bidHistory;
      })
      .addCase(fetchAuctionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create auction
      .addCase(createAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAuction.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload.data);
      })
      .addCase(createAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update auction
      .addCase(updateAuction.fulfilled, (state, action) => {
        const index = state.list.findIndex(a => a._id === action.payload.data._id);
        if (index !== -1) {
          state.list[index] = action.payload.data;
        }
        if (state.current && state.current._id === action.payload.data._id) {
          state.current = action.payload.data;
        }
      })

      // Delete auction
      .addCase(deleteAuction.fulfilled, (state, action) => {
        state.list = state.list.filter(a => a._id !== action.payload);
        if (state.current && state.current._id === action.payload) {
          state.current = null;
        }
      })

      // Place bid
      .addCase(placeBid.fulfilled, (state, action) => {
        const { auction, bid } = action.payload.data;

        // Update auction in list
        const auctionIndex = state.list.findIndex(a => a._id === auction.id);
        if (auctionIndex !== -1) {
          state.list[auctionIndex].currentPrice = auction.currentPrice;
          state.list[auctionIndex].totalBids = auction.totalBids;
        }

        // Update current auction
        if (state.current && state.current._id === auction.id) {
          state.current.currentPrice = auction.currentPrice;
          state.current.totalBids = auction.totalBids;
        }

        // Add bid to history
        state.bidHistory.unshift(bid);
      })

      // Fetch bid history
      .addCase(fetchBidHistory.fulfilled, (state, action) => {
        state.bidHistory = action.payload.data;
      })

      // Toggle watch
      .addCase(toggleWatchAuction.fulfilled, (state, action) => {
        const { auctionId, watching } = action.payload;

        const auction = state.list.find(a => a._id === auctionId);
        if (auction) {
          if (watching) {
            auction.watchers = auction.watchers || [];
            auction.watchers.push(state.user?.id);
          } else {
            auction.watchers = auction.watchers?.filter(id => id !== state.user?.id) || [];
          }
        }
      })

      // Fetch watchlist
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.watchlist = action.payload.data;
      })

      // Fetch seller auctions
      .addCase(fetchSellerAuctions.fulfilled, (state, action) => {
        state.sellerAuctions = action.payload.data;
      })

      // Fetch featured auctions
      .addCase(fetchFeaturedAuctions.fulfilled, (state, action) => {
        state.featured = action.payload.data;
      })

      // Fetch ending soon auctions
      .addCase(fetchEndingSoonAuctions.fulfilled, (state, action) => {
        state.endingSoon = action.payload.data;
      });
  }
});

export const {
  setFilters,
  clearFilters,
  setActiveAuction,
  updateAuctionPrice,
  updateParticipantCount,
  addRealTimeUpdate,
  clearRealTimeUpdates,
  updateAuctionTimer,
  clearError,
  clearCurrentAuction,
  addAuctionToList,
  removeAuctionFromList
} = auctionSlice.actions;

// Selectors
export const selectAuctions = (state) => state.auctions.list;
export const selectCurrentAuction = (state) => state.auctions.current;
export const selectAuctionLoading = (state) => state.auctions.loading;
export const selectAuctionError = (state) => state.auctions.error;
export const selectAuctionFilters = (state) => state.auctions.filters;
export const selectAuctionPagination = (state) => state.auctions.pagination;
export const selectBidHistory = (state) => state.auctions.bidHistory;
export const selectWatchlist = (state) => state.auctions.watchlist;
export const selectSellerAuctions = (state) => state.auctions.sellerAuctions;
export const selectFeaturedAuctions = (state) => state.auctions.featured;
export const selectEndingSoonAuctions = (state) => state.auctions.endingSoon;
export const selectRealTimeUpdates = (state) => state.auctions.realTimeUpdates;
export const selectParticipantCount = (state) => state.auctions.participantCount;

export default auctionSlice.reducer;