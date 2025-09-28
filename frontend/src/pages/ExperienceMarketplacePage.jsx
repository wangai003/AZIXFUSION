import React, { useState, useEffect, useCallback } from 'react';
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
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  Star as StarIcon,
  FavoriteBorder as FavoriteBorderIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { axiosi } from '../config/axios';
import { EXPERIENCE_CATEGORIES } from '../config/experienceCategories';

const ExperienceMarketplacePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // State
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subcategory: '',
    minPrice: '',
    maxPrice: '',
    difficulty: '',
    duration: '',
    location: '',
    sort: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 12
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await axiosi.get(`/experiences?${queryParams}`);
      setExperiences(response.data.data);
      setPagination(response.data.pagination);
      setError('');
    } catch (error) {
      console.error('Error fetching experiences:', error);
      setError('Failed to load experiences');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load experiences
  useEffect(() => {
    fetchExperiences();
  }, [filters, fetchExperiences]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1 // Reset to page 1 when changing filters
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      // Featured experiences
      handleFilterChange('isFeatured', 'true');
    } else {
      // All experiences
      handleFilterChange('isFeatured', '');
    }
  };

  const handleExperienceClick = (experienceId) => {
    navigate(`/experiences/${experienceId}`);
  };

  const formatPrice = (price, pricingType) => {
    if (pricingType === 'fixed_group') {
      return `$${price} (group)`;
    }
    return `$${price} per person`;
  };

  const formatDuration = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    } else if (hours === 1) {
      return '1 hour';
    } else {
      return `${hours} hours`;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'moderate': return 'warning';
      case 'challenging': return 'error';
      default: return 'default';
    }
  };

  const ExperienceCard = ({ experience }) => (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-2px)'
          }
        }}
        onClick={() => handleExperienceClick(experience._id)}
      >
        {/* Experience Image */}
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height={200}
            image={experience.images?.[0] || experience.featuredImage || '/placeholder-experience.jpg'}
            alt={experience.title}
            sx={{ objectFit: 'cover' }}
          />

          {/* Status Badges */}
          <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 1 }}>
            {experience.isFeatured && (
              <Chip label="Featured" color="secondary" size="small" />
            )}
            {experience.verificationStatus === 'verified' && (
              <Chip label="Verified" color="success" size="small" />
            )}
          </Box>

          {/* Difficulty Badge */}
          <Chip
            label={experience.difficulty}
            color={getDifficultyColor(experience.difficulty)}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              textTransform: 'capitalize'
            }}
          />

          {/* Favorite Button */}
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite toggle
            }}
          >
            <FavoriteBorderIcon color="action" />
          </IconButton>
        </Box>

        <CardContent sx={{ p: 2 }}>
          {/* Title and Rating */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
                flex: 1,
                mr: 1
              }}
            >
              {experience.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ color: 'warning.main', fontSize: '1rem' }} />
              <Typography variant="body2" color="text.secondary">
                {experience.averageRating || 4.5}
              </Typography>
            </Box>
          </Box>

          {/* Host Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar
              sx={{ width: 24, height: 24 }}
              src={experience.hostId?.profileImage}
            >
              {experience.hostName?.charAt(0) || 'H'}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              by {experience.hostName || 'Local Host'}
            </Typography>
          </Box>

          {/* Price */}
          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
            {formatPrice(experience.basePrice, experience.pricingType)}
          </Typography>

          {/* Details */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TimeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {formatDuration(experience.duration)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <GroupIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {experience.minParticipants}-{experience.maxParticipants} people
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {experience.location?.city || 'Local'}
              </Typography>
            </Box>
          </Box>

          {/* Category */}
          <Box sx={{ mt: 1 }}>
            <Chip
              label={`${experience.category} • ${experience.subcategory}`}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.75rem',
                height: 24
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ExperienceSkeleton = () => (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={28} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Skeleton variant="text" width="30%" height={16} />
          <Skeleton variant="text" width="35%" height={16} />
        </Box>
        <Skeleton variant="text" width="50%" height={20} />
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
            Local Experience Marketplace
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Discover authentic local experiences and cultural adventures
          </Typography>
        </motion.div>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search experiences..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchExperiences()}
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
                <MenuItem value="">All Categories</MenuItem>
                {Object.keys(EXPERIENCE_CATEGORIES).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Difficulty Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filters.difficulty}
                label="Difficulty"
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="challenging">Challenging</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filter Toggle */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
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
              onClick={() => {
                setFilters({
                  search: '',
                  category: '',
                  subcategory: '',
                  minPrice: '',
                  maxPrice: '',
                  difficulty: '',
                  duration: '',
                  location: '',
                  sort: 'createdAt',
                  order: 'desc',
                  page: 1,
                  limit: 12
                });
              }}
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
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
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
                  <TextField
                    fullWidth
                    label="Location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="City or region"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Duration</InputLabel>
                    <Select
                      value={filters.duration}
                      label="Duration"
                      onChange={(e) => handleFilterChange('duration', e.target.value)}
                    >
                      <MenuItem value="">Any Duration</MenuItem>
                      <MenuItem value="2">Up to 2 hours</MenuItem>
                      <MenuItem value="4">Up to 4 hours</MenuItem>
                      <MenuItem value="8">Up to 8 hours</MenuItem>
                      <MenuItem value="24">Full day</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        )}
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
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
          <Tab label="All Experiences" />
          <Tab label="Featured" />
        </Tabs>
      </Paper>

      {/* Experience Grid */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {loading ? (
            // Loading skeletons
            Array.from({ length: 12 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <ExperienceSkeleton />
              </Grid>
            ))
          ) : (
            experiences.map((experience) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={experience._id}>
                <ExperienceCard experience={experience} />
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
              onChange={(event, page) => handleFilterChange('page', page)}
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
      </Box>

      {/* Empty State */}
      {!loading && experiences.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No experiences found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your filters or check back later for new experiences
          </Typography>
        </Box>
      )}

      {/* Become Host CTA */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Want to share your local expertise?
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/become-experience-host')}
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
          Become a Local Experience Host
        </Button>
      </Box>
    </Container>
  );
};

export default ExperienceMarketplacePage;