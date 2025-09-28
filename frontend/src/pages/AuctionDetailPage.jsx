import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
  LinearProgress
} from '@mui/material';
import {
  Gavel as GavelIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Report as ReportIcon,
  LocalOffer as LocalOfferIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  Group as GroupIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchAuctionById,
  placeBid,
  fetchBidHistory,
  toggleWatchAuction,
  selectCurrentAuction,
  selectBidHistory,
  selectAuctionLoading,
  selectAuctionError,
  selectParticipantCount,
  selectRealTimeUpdates,
  updateAuctionPrice,
  updateParticipantCount,
  addRealTimeUpdate
} from '../features/auctions/auctionSlice';
import { io } from 'socket.io-client';

const AuctionDetailPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // Redux selectors
  const auction = useSelector(selectCurrentAuction);
  const bidHistory = useSelector(selectBidHistory);
  const loading = useSelector(selectAuctionLoading);
  const error = useSelector(selectAuctionError);
  const participantCount = useSelector(selectParticipantCount);
  const realTimeUpdates = useSelector(selectRealTimeUpdates);

  // Local state
  const [bidAmount, setBidAmount] = useState('');
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [autoBidAmount, setAutoBidAmount] = useState('');
  const [autoBidDialogOpen, setAutoBidDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');

  // Refs
  const timerRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const initSocket = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:8000', {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
          console.log('Connected to auction room');
          setIsConnected(true);
          newSocket.emit('join-auction', { auctionId: id });
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from auction room');
          setIsConnected(false);
        });

        newSocket.on('auction-state', (data) => {
          console.log('Received auction state:', data);
          dispatch(updateParticipantCount(data.participantCount));
        });

        newSocket.on('bid-update', (data) => {
          console.log('Received bid update:', data);
          dispatch(updateAuctionPrice({
            auctionId: id,
            newPrice: data.currentPrice,
            bidData: data
          }));
          dispatch(addRealTimeUpdate({
            type: 'bid',
            data,
            timestamp: new Date()
          }));
        });

        newSocket.on('participant-joined', (data) => {
          dispatch(updateParticipantCount(data.count));
        });

        newSocket.on('participant-left', (data) => {
          dispatch(updateParticipantCount(data.count));
        });

        newSocket.on('auction-extended', (data) => {
          setTimeRemaining(data.newEndTime - new Date());
          dispatch(addRealTimeUpdate({
            type: 'extension',
            data,
            timestamp: new Date()
          }));
        });

        newSocket.on('error', (error) => {
          console.error('Socket error:', error);
          setBidError(error.message);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id, dispatch]);

  // Load auction data
  useEffect(() => {
    if (id) {
      dispatch(fetchAuctionById(id));
      dispatch(fetchBidHistory(id));
    }
  }, [id, dispatch]);

  // Timer for countdown
  useEffect(() => {
    if (auction?.endTime) {
      const updateTimer = () => {
        const now = new Date();
        const end = new Date(auction.endTime);
        const remaining = end - now;
        setTimeRemaining(Math.max(0, remaining));
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [auction?.endTime]);

  // Calculate minimum bid
  const getMinimumBid = () => {
    if (!auction) return 0;
    return auction.currentPrice + auction.bidIncrement;
  };

  // Format time remaining
  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return 'Auction Ended';

    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Handle bid placement
  const handlePlaceBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) < getMinimumBid()) {
      setBidError(`Bid must be at least $${getMinimumBid()}`);
      return;
    }

    try {
      setBidError('');
      const result = await dispatch(placeBid({
        auctionId: id,
        bidAmount: parseFloat(bidAmount)
      })).unwrap();

      setBidSuccess('Bid placed successfully!');
      setBidDialogOpen(false);
      setBidAmount('');

      // Emit bid to socket
      if (socket && isConnected) {
        socket.emit('place-bid', {
          auctionId: id,
          bidAmount: parseFloat(bidAmount)
        });
      }

      setTimeout(() => setBidSuccess(''), 3000);
    } catch (error) {
      setBidError(error.message || 'Failed to place bid');
    }
  };

  // Handle auto-bid
  const handleSetAutoBid = async () => {
    if (!autoBidAmount || parseFloat(autoBidAmount) <= auction.currentPrice) {
      setBidError('Auto-bid amount must be higher than current price');
      return;
    }

    try {
      setBidError('');
      // Emit auto-bid to socket
      if (socket && isConnected) {
        socket.emit('set-auto-bid', {
          auctionId: id,
          maxAmount: parseFloat(autoBidAmount)
        });
      }

      setAutoBidDialogOpen(false);
      setAutoBidAmount('');
      setBidSuccess('Auto-bid set successfully!');
      setTimeout(() => setBidSuccess(''), 3000);
    } catch (error) {
      setBidError(error.message || 'Failed to set auto-bid');
    }
  };

  // Handle watch toggle
  const handleWatchToggle = () => {
    dispatch(toggleWatchAuction(id));
  };

  // Handle image navigation
  const handleImageChange = (index) => {
    setSelectedImageIndex(index);
  };

  // Loading skeleton
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="text" height={40} />
              <Skeleton variant="text" height={24} width="60%" />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error.message || 'Failed to load auction'}
        </Alert>
      </Container>
    );
  }

  // No auction found
  if (!auction) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Auction not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success/Error Messages */}
      <AnimatePresence>
        {bidSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {bidSuccess}
            </Alert>
          </motion.div>
        )}
        {bidError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {bidError}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Image Gallery */}
          <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height={400}
                image={auction.images?.[selectedImageIndex]?.url || '/placeholder-auction.jpg'}
                alt={auction.title}
                sx={{ objectFit: 'cover' }}
              />

              {/* Image Navigation */}
              {auction.images && auction.images.length > 1 && (
                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 1
                }}>
                  {auction.images.map((image, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: selectedImageIndex === index ? '2px solid white' : '2px solid transparent',
                        opacity: selectedImageIndex === index ? 1 : 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                      onClick={() => handleImageChange(index)}
                    />
                  ))}
                </Box>
              )}

              {/* Connection Status */}
              <Chip
                label={isConnected ? 'Live' : 'Connecting...'}
                color={isConnected ? 'success' : 'warning'}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Card>

          {/* Auction Details */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                {auction.title}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                {auction.description}
              </Typography>

              {/* Auction Meta */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {auction.totalBids || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bids
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {participantCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Watching
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {auction.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {auction.itemType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Tags */}
              {auction.tags && auction.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  {auction.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}

              {/* Seller Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{ width: 48, height: 48 }}
                  src={auction.sellerId?.profileImage}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {auction.sellerId?.name || 'Anonymous Seller'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Seller Rating: {auction.sellerInfo?.rating || 0}/5
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Bid History */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon />
                Bid History
              </Typography>

              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {bidHistory && bidHistory.length > 0 ? (
                  bidHistory.slice(0, 20).map((bid, index) => (
                    <ListItem key={bid._id || index} divider={index < bidHistory.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <GavelIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`$${bid.bidAmount?.toLocaleString() || 0}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {bid.bidderId?.name || 'Anonymous'} • {new Date(bid.bidTime).toLocaleString()}
                            </Typography>
                            {bid.isAutoBid && (
                              <Chip label="Auto-bid" size="small" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No bids yet. Be the first to bid!
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Bidding Panel */}
          <Card sx={{ mb: 3, borderRadius: 3, position: 'sticky', top: 20 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Current Bid
              </Typography>

              {/* Current Price */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  ${auction.currentPrice?.toLocaleString() || auction.startingPrice?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Starting: ${auction.startingPrice?.toLocaleString()}
                </Typography>
              </Box>

              {/* Time Remaining */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Time Remaining
                </Typography>
                <Typography variant="h4" color="error" fontWeight="bold">
                  {formatTimeRemaining(timeRemaining)}
                </Typography>
                {timeRemaining > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(0, (timeRemaining / (24 * 60 * 60 * 1000)) * 100)} // Assuming 24h auction
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                )}
              </Box>

              {/* Bid Buttons */}
              {auction.canBid && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<GavelIcon />}
                    onClick={() => setBidDialogOpen(true)}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: 3
                    }}
                  >
                    Place Bid
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<TrendingUpIcon />}
                    onClick={() => setAutoBidDialogOpen(true)}
                    sx={{
                      py: 1.5,
                      borderRadius: 3
                    }}
                  >
                    Set Auto-Bid
                  </Button>
                </Box>
              )}

              {/* Auction Ended */}
              {timeRemaining <= 0 && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  This auction has ended
                </Alert>
              )}

              {/* Watch Button */}
              <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<FavoriteBorderIcon />}
                  onClick={handleWatchToggle}
                  sx={{ borderRadius: 3 }}
                >
                  Add to Watchlist
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Auction Rules */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Auction Rules
              </Typography>

              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Minimum bid increment: ${auction.bidIncrement}
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  {auction.rules?.allowAutoBid ? 'Auto-bidding allowed' : 'Auto-bidding not allowed'}
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  {auction.reservePrice ? 'Reserve price set' : 'No reserve price'}
                </Typography>
                <Typography component="li" variant="body2">
                  Auction ends: {new Date(auction.endTime).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bid Dialog */}
      <Dialog
        open={bidDialogOpen}
        onClose={() => setBidDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Place Your Bid</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Bid Amount"
            type="number"
            fullWidth
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            helperText={`Minimum bid: $${getMinimumBid()}`}
            InputProps={{
              startAdornment: <LocalOfferIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBidDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePlaceBid} variant="contained">
            Place Bid
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto-Bid Dialog */}
      <Dialog
        open={autoBidDialogOpen}
        onClose={() => setAutoBidDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set Auto-Bid</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Maximum Auto-Bid Amount"
            type="number"
            fullWidth
            value={autoBidAmount}
            onChange={(e) => setAutoBidAmount(e.target.value)}
            helperText="We'll automatically bid up to this amount on your behalf"
            InputProps={{
              startAdornment: <TrendingUpIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoBidDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSetAutoBid} variant="contained">
            Set Auto-Bid
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AuctionDetailPage;