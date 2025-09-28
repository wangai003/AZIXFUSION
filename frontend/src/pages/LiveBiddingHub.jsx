import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Skeleton,
  Alert,
  Tabs,
  Tab,
  Paper,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Gavel as GavelIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  LocalOffer as LocalOfferIcon,
  FilterList as FilterListIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  fetchAuctions,
  fetchFeaturedAuctions,
  fetchEndingSoonAuctions,
  setFilters,
  clearFilters,
  toggleWatchAuction,
  selectAuctions,
  selectAuctionLoading,
  selectAuctionError,
  selectAuctionFilters,
  selectAuctionPagination,
  selectFeaturedAuctions,
  selectEndingSoonAuctions,
  selectRealTimeUpdates,
  updateAuctionPrice,
  addAuctionToList,
  removeAuctionFromList
} from '../features/auctions/auctionSlice';
import { selectLoggedInUser } from '../features/auth/AuthSlice';

const LiveBiddingHub = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // WebSocket state
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Redux selectors
  const auctions = useSelector(selectAuctions);
  const featuredAuctions = useSelector(selectFeaturedAuctions);
  const endingSoonAuctions = useSelector(selectEndingSoonAuctions);
  const loading = useSelector(selectAuctionLoading);
  const error = useSelector(selectAuctionError);
  const filters = useSelector(selectAuctionFilters);
  const pagination = useSelector(selectAuctionPagination);
  const realTimeUpdates = useSelector(selectRealTimeUpdates);
  const loggedInUser = useSelector(selectLoggedInUser);

  // Categories for filtering
  const categories = [
    'All Categories',
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Collectibles',
    'Art',
    'Jewelry',
    'Vehicles',
    'Real Estate',
    'Services'
  ];

  // Status options
  const statusOptions = [
    { value: '', label: 'All Auctions' },
    { value: 'active', label: 'Active' },
    { value: 'scheduled', label: 'Starting Soon' },
    { value: 'ended', label: 'Ended' }
  ];

  // Load initial data
  useEffect(() => {
    dispatch(fetchAuctions());
    dispatch(fetchFeaturedAuctions());
    dispatch(fetchEndingSoonAuctions());
  }, [dispatch]);

  // Initialize WebSocket connection
  useEffect(() => {
    const initSocket = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setConnectionError('Authentication required for live updates');
          return;
        }

        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:8000', {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
          console.log('Connected to live bidding hub');
          setIsConnected(true);
          setConnectionError('');
          reconnectAttempts.current = 0;
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from live bidding hub');
          setIsConnected(false);
          attemptReconnect();
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setConnectionError('Failed to connect to live updates');
          setIsConnected(false);
          attemptReconnect();
        });

        // Listen for global auction updates
        newSocket.on('auction-update', (data) => {
          console.log('Received auction update:', data);
          dispatch(updateAuctionPrice({
            auctionId: data._id,
            newPrice: data.currentPrice,
            bidData: {
              bidAmount: data.currentPrice,
              totalBids: data.totalBids,
              bidderName: 'Live Update'
            }
          }));
        });

        // Listen for new auctions
        newSocket.on('auction-created', (data) => {
          console.log('New auction created:', data);
          dispatch(addAuctionToList(data));
        });

        // Listen for auction endings
        newSocket.on('auction-ended', (data) => {
          console.log('Auction ended:', data);
          dispatch(removeAuctionFromList(data._id));
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setConnectionError('Failed to initialize live updates');
      }
    };

    const attemptReconnect = () => {
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setConnectionError('Unable to reconnect. Please refresh the page.');
        return;
      }

      reconnectAttempts.current += 1;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
        initSocket();
      }, delay);
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value, page: 1 }));
    dispatch(fetchAuctions());
  };

  // Handle search
  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      dispatch(setFilters({ search: event.target.value, page: 1 }));
      dispatch(fetchAuctions());
    }
  };

  // Handle page change
  const handlePageChange = (event, page) => {
    dispatch(setFilters({ page }));
    dispatch(fetchAuctions());
  };

  // Handle auction click
  const handleAuctionClick = (auctionId) => {
    navigate(`/auctions/${auctionId}`);
  };

  // Handle watch toggle
  const handleWatchToggle = async (auctionId, event) => {
    event.stopPropagation();
    dispatch(toggleWatchAuction(auctionId));
  };

  // Clear all filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(fetchAuctions());
  };

  // Check if user can create auctions (service vendor, goods vendor, export vendor, or experience host)
  const canCreateAuctions = () => {
    if (!loggedInUser?.roles) return false;

    return loggedInUser.roles.some(role =>
      ['seller', 'exporter', 'experience_host'].includes(role) ||
      (role === 'seller' && loggedInUser.sellerType === 'service')
    );
  };

  // Format time remaining
  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Get auction status color
  const getStatusColor = (status, endTime) => {
    const now = new Date();
    const end = new Date(endTime);

    if (status === 'ended' || end <= now) return 'error';
    if (status === 'active') return 'success';
    if (status === 'scheduled') return 'warning';
    return 'default';
  };

  // Auction card component
  const AuctionCard = ({ auction, featured = false }) => {
    const [isPriceUpdating, setIsPriceUpdating] = useState(false);

    // Listen for real-time updates for this auction
    useEffect(() => {
      if (realTimeUpdates.length > 0) {
        const latestUpdate = realTimeUpdates.find(update =>
          update.type === 'bid' && update.auctionId === auction._id
        );
        if (latestUpdate) {
          setIsPriceUpdating(true);
          const timer = setTimeout(() => setIsPriceUpdating(false), 2000);
          return () => clearTimeout(timer);
        }
      }
    }, [realTimeUpdates, auction._id]);

    return (
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        animate={isPriceUpdating ? { scale: [1, 1.02, 1] } : {}}
      >
        <Card
          sx={{
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: featured ? `2px solid ${theme.palette.primary.main}` : '1px solid',
            borderColor: featured ? theme.palette.primary.main : theme.palette.divider,
            '&:hover': {
              boxShadow: theme.shadows[8],
              transform: 'translateY(-2px)'
            },
            ...(isPriceUpdating && {
              boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
              borderColor: theme.palette.primary.main
            })
          }}
          onClick={() => handleAuctionClick(auction._id)}
        >
        {/* Auction Image */}
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height={featured ? 200 : 180}
            image={auction.images?.[0]?.url || '/placeholder-auction.jpg'}
            alt={auction.title}
            sx={{ objectFit: 'cover' }}
          />

          {/* Status Badge */}
          <Chip
            label={auction.status === 'active' ? 'Live' : auction.status}
            color={getStatusColor(auction.status, auction.endTime)}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              fontWeight: 'bold'
            }}
          />

          {/* Featured Badge */}
          {featured && (
            <Chip
              label="Featured"
              color="secondary"
              size="small"
              icon={<TrendingUpIcon />}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                fontWeight: 'bold'
              }}
            />
          )}

          {/* Watch Button */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 10,
              right: featured ? 80 : 10,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
            onClick={(e) => handleWatchToggle(auction._id, e)}
          >
            <FavoriteBorderIcon color="action" />
          </IconButton>
        </Box>

        <CardContent sx={{ p: 2 }}>
          {/* Title */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              mb: 1,
              fontSize: featured ? '1.1rem' : '1rem',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3
            }}
          >
            {auction.title}
          </Typography>

          {/* Current Price */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <GavelIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
            <Typography variant="h6" color="primary" fontWeight="bold">
              ${auction.currentPrice?.toLocaleString() || auction.startingPrice?.toLocaleString()}
            </Typography>
          </Box>

          {/* Time Remaining */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
            <Typography variant="body2" color="text.secondary">
              {formatTimeRemaining(auction.endTime)}
            </Typography>
          </Box>

          {/* Seller Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 24, height: 24, mr: 1 }}
                src={auction.sellerId?.profileImage}
              >
                <PersonIcon sx={{ fontSize: '1rem' }} />
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {auction.sellerId?.name || 'Anonymous'}
              </Typography>
            </Box>

            {/* Bid Count */}
            <Chip
              label={`${auction.totalBids || 0} bids`}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>

          {/* Category */}
          <Box sx={{ mt: 1 }}>
            <Chip
              label={auction.category}
              size="small"
              variant="filled"
              sx={{
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.secondary,
                border: `1px solid ${theme.palette.divider}`
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

  // Loading skeleton
  const AuctionSkeleton = () => (
    <Card>
      <Skeleton variant="rectangular" height={180} />
      <CardContent>
        <Skeleton variant="text" height={28} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width="30%" height={20} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            sx={{
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Live Bidding Hub
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Discover amazing deals and bid on unique items in real-time
          </Typography>

          {/* Connection Status */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Chip
              icon={isConnected ? <WifiIcon /> : <WifiOffIcon />}
              label={isConnected ? 'Live Updates Active' : 'Connecting...'}
              color={isConnected ? 'success' : 'warning'}
              variant={isConnected ? 'filled' : 'outlined'}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          {/* Connection Error */}
          {connectionError && (
            <Alert severity="warning" sx={{ mb: 2, maxWidth: 400, mx: 'auto', borderRadius: 2 }}>
              {connectionError}
            </Alert>
          )}
        </motion.div>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search auctions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category === 'All Categories' ? '' : category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filter Toggle */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ borderRadius: 3, py: 1.5 }}
            >
              {showFilters ? 'Hide Filters' : 'More Filters'}
            </Button>
          </Grid>

          {/* Clear Filters */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="text"
              onClick={handleClearFilters}
              sx={{ borderRadius: 3, py: 1.5 }}
            >
              Clear All
            </Button>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Min Price"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Max Price"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sort}
                    label="Sort By"
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  >
                    <MenuItem value="startTime">Start Time</MenuItem>
                    <MenuItem value="endTime">End Time</MenuItem>
                    <MenuItem value="currentPrice">Current Price</MenuItem>
                    <MenuItem value="totalBids">Bid Count</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={filters.order}
                    label="Order"
                    onChange={(e) => handleFilterChange('order', e.target.value)}
                  >
                    <MenuItem value="desc">Descending</MenuItem>
                    <MenuItem value="asc">Ascending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error.message || 'An error occurred while loading auctions'}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 4, borderRadius: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: isMobile ? '0.875rem' : '1rem'
            }
          }}
        >
          <Tab label="All Auctions" />
          <Tab label="Featured" />
          <Tab label="Ending Soon" />
        </Tabs>
      </Paper>

      {/* Auction Grid */}
      <Box sx={{ mb: 4 }}>
        {activeTab === 0 && (
          <>
            <Grid container spacing={3}>
              {loading ? (
                // Loading skeletons
                Array.from({ length: 12 }).map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <AuctionSkeleton />
                  </Grid>
                ))
              ) : (
                auctions.map((auction) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={auction._id}>
                    <AuctionCard auction={auction} />
                  </Grid>
                ))
              )}
            </Grid>

            {/* Pagination */}
            {!loading && pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            {featuredAuctions.map((auction) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={auction._id}>
                <AuctionCard auction={auction} featured />
              </Grid>
            ))}
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            {endingSoonAuctions.map((auction) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={auction._id}>
                <AuctionCard auction={auction} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Empty State */}
      {!loading && auctions.length === 0 && activeTab === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <GavelIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No auctions found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your filters or check back later for new auctions
          </Typography>
        </Box>
      )}

      {/* Quick Actions */}
      {canCreateAuctions() && (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<GavelIcon />}
            onClick={() => navigate('/auctions/create')}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Start Selling
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default LiveBiddingHub;