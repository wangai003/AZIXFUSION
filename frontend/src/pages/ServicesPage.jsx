import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  IconButton,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Pagination,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchAllServicesAsync,
  selectAllServices,
  selectAllServicesStatus,
  searchServicesAsync,
  selectSearchResults,
  selectSearchStatus
} from '../features/services/ServiceSlice';
import { ServiceList } from '../features/services/ServiceList';
import { selectCategories, fetchCategories } from '../features/categories/CategoriesSlice';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 12;

const sortOptions = [
  { name: "Newest First", sort: "createdAt", order: "desc" },
  { name: "Oldest First", sort: "createdAt", order: "asc" },
  { name: "Price: Low to High", sort: "price", order: "asc" },
  { name: "Price: High to Low", sort: "price", order: "desc" },
  { name: "Name: A to Z", sort: "title", order: "asc" },
  { name: "Name: Z to A", sort: "title", order: "desc" },
  { name: "Most Popular", sort: "rating", order: "desc" }
];

const ServicesPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Responsive breakpoints
  const is1200 = useMediaQuery(theme.breakpoints.down(1200));
  const is800 = useMediaQuery(theme.breakpoints.down(800));
  const is700 = useMediaQuery(theme.breakpoints.down(700));
  const is600 = useMediaQuery(theme.breakpoints.down(600));
  const is500 = useMediaQuery(theme.breakpoints.down(500));

  // State management
  const [filters, setFilters] = useState({
    category: [],
    subcategory: [],
    serviceLevel: '',
    pricingModel: '',
    minPrice: '',
    maxPrice: '',
    searchQuery: '',
    isFeatured: false,
    isActive: true
  });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('Newest First');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    serviceLevel: true,
    pricing: true,
    features: true
  });
  const [searchInput, setSearchInput] = useState(''); // Separate state for search input
  const [localSearchQuery, setLocalSearchQuery] = useState(''); // Local search for real-time filtering

  // Redux selectors
  const services = useSelector(selectAllServices);
  const searchResults = useSelector(selectSearchResults);
  const status = useSelector(selectAllServicesStatus);
  const searchStatus = useSelector(selectSearchStatus);
  const categories = useSelector(selectCategories) || [];

  // Filter handlers
  const handleCategoryFilters = (categoryIds) => {
    setFilters({ ...filters, category: categoryIds });
    setPage(1);
  };

  const handleSubcategoryFilters = (subcategoryIds) => {
    setFilters({ ...filters, subcategory: subcategoryIds });
    setPage(1);
  };

  const handleServiceLevelFilter = (serviceLevel) => {
    setFilters({ ...filters, serviceLevel });
    setPage(1);
  };

  const handlePricingModelFilter = (pricingModel) => {
    setFilters({ ...filters, pricingModel });
    setPage(1);
  };

  const handlePriceRangeChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(1);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setLocalSearchQuery(value); // Update local search for real-time filtering
    setPage(1); // Reset to first page when searching
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      handleManualSearch();
    }
  };

  const handleFeatureFilter = (feature) => {
    setFilters({ ...filters, [feature]: !filters[feature] });
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      category: [],
      subcategory: [],
      serviceLevel: '',
      pricingModel: '',
      minPrice: '',
      maxPrice: '',
      searchQuery: '',
      isFeatured: false,
      isActive: true
    });
    setSearchInput(''); // Clear search input
    setLocalSearchQuery(''); // Clear local search
    setSort('Newest First');
    setPage(1);
  };

  const toggleFilterExpansion = (filterType) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  // Calculate active filters count
  const activeFiltersCount = [
    filters.category.length,
    filters.subcategory.length,
    filters.serviceLevel ? 1 : 0,
    filters.pricingModel ? 1 : 0,
    localSearchQuery ? 1 : 0,
    filters.isFeatured ? 1 : 0,
    (filters.minPrice || filters.maxPrice) ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  // Effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: "instant"
      });
    }
  }, []);

  // Load categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch services on component mount and when filters change
  useEffect(() => {
    if (dispatch) {
      const queryParams = {
        ...filters,
        page,
        limit: ITEMS_PER_PAGE,
        sort: sortOptions.find(option => option.name === sort)?.sort || 'createdAt',
        order: sortOptions.find(option => option.name === sort)?.order || 'desc'
      };

      if (localSearchQuery.trim()) {
        dispatch(searchServicesAsync(queryParams));
      } else {
        dispatch(fetchAllServicesAsync(queryParams));
      }
    }
  }, [filters, page, sort, localSearchQuery, dispatch]);

  // Manual search function
  const handleManualSearch = () => {
    if (searchInput.trim()) {
      const newFilters = { ...filters, searchQuery: searchInput.trim() };
      setFilters(newFilters);
      setLocalSearchQuery(searchInput.trim());
      setPage(1);

      if (dispatch) {
        dispatch(searchServicesAsync({
          ...newFilters,
          page: 1,
          limit: ITEMS_PER_PAGE
        }));
      }
    }
  };

  // Get display services (either from search results or all services)
  const getDisplayServices = () => {
    const sourceServices = localSearchQuery.trim() ? searchResults : services;
    if (!sourceServices || !Array.isArray(sourceServices)) return [];

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sourceServices.slice(startIndex, endIndex);
  };

  // Get total count
  const getTotalResults = () => {
    const sourceServices = localSearchQuery.trim() ? searchResults : services;
    return Array.isArray(sourceServices) ? sourceServices.length : 0;
  };

  return (
    <>
      {/* Main Content */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 4 }}>
        {/* Header Section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              Freelance Services Marketplace
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover professional services from verified freelancers
            </Typography>
          </Box>

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '& .MuiToggleButton-root': {
                px: 2,
                py: 1
              }
            }}
          >
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Search and Filter Bar */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}
        >

          <Grid container spacing={3} alignItems="center">
            {/* Search Bar */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Search services..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchKeyPress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      bgcolor: 'background.paper'
                    }
                  }}
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  onClick={handleManualSearch}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    minWidth: 'auto'
                  }}
                  disabled={(status === 'pending' || searchStatus === 'pending') || !searchInput.trim()}
                >
                  {status === 'pending' ? 'Searching...' : 'Search'}
                </Button>
              </Box>
            </Grid>

            {/* Sort Dropdown */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort</InputLabel>
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  label="Sort"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.name} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filter Button */}
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilterDrawerOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    badgeContent={activeFiltersCount}
                    color="error"
                    sx={{ ml: 1 }}
                  />
                )}
              </Button>
            </Grid>
          </Grid>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                {filters.category.map(catId => {
                  const category = categories.find(c => c._id === catId);
                  return category ? (
                    <Chip
                      key={catId}
                      label={category.name}
                      onDelete={() => handleCategoryFilters(filters.category.filter(id => id !== catId))}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : null;
                })}
                {filters.serviceLevel && (
                  <Chip
                    label={`Level: ${filters.serviceLevel}`}
                    onDelete={() => handleServiceLevelFilter('')}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {filters.pricingModel && (
                  <Chip
                    label={`Pricing: ${filters.pricingModel}`}
                    onDelete={() => handlePricingModelFilter('')}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
                {localSearchQuery && (
                  <Chip
                    label={`"${localSearchQuery}"`}
                    onDelete={() => {
                      setSearchInput('');
                      setLocalSearchQuery('');
                    }}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
                <Button
                  size="small"
                  onClick={clearAllFilters}
                  sx={{ ml: 1 }}
                >
                  Clear All
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Services Grid */}
        <Box sx={{ mb: 4 }}>
          {getDisplayServices().length > 0 ? (
            <Grid
              container
              spacing={viewMode === 'grid' ? 3 : 2}
              sx={{
                justifyContent: 'center',
                '& .MuiGrid-item': {
                  width: viewMode === 'grid' ? 'auto' : '100%'
                }
              }}
            >
              <AnimatePresence>
                {getDisplayServices().map((service, index) => (
                  service && service._id ? (
                    <Grid
                      item
                      key={service._id}
                      xs={12}
                      sm={viewMode === 'grid' ? 6 : 12}
                      md={viewMode === 'grid' ? 4 : 12}
                      lg={viewMode === 'grid' ? 3 : 12}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.1,
                          ease: "easeOut"
                        }}
                      >
                        <ServiceCard service={service} />
                      </motion.div>
                    </Grid>
                  ) : null
                ))}
              </AnimatePresence>
            </Grid>
          ) : (
            <Box
              textAlign="center"
              py={8}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 1
              }}
            >
              <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {localSearchQuery ? 'No services found' : 'No services available'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {localSearchQuery
                  ? `No services match "${localSearchQuery}". Try a different search term.`
                  : activeFiltersCount > 0
                    ? 'Try adjusting your filters'
                    : 'No services are currently available. Check back later!'
                }
              </Typography>
              {(localSearchQuery || activeFiltersCount > 0) && (
                <Button
                  variant="outlined"
                  onClick={clearAllFilters}
                  startIcon={<ClearIcon />}
                >
                  Clear All Filters
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Pagination */}
        {getTotalResults() > 0 && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 4 }}
          >
            <Stack spacing={2} alignItems="center">
              <Pagination
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                count={Math.ceil(getTotalResults() / ITEMS_PER_PAGE)}
                variant="outlined"
                shape="rounded"
                size={is500 ? 'medium' : 'large'}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    mx: 0.5
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Page {page} of {Math.ceil(getTotalResults() / ITEMS_PER_PAGE)}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Enhanced Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            p: 3,
            bgcolor: 'background.paper'
          }
        }}
      >
        <Stack spacing={3}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Filters
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <ClearIcon />
            </IconButton>
          </Box>

          {/* Categories */}
          <Accordion
            expanded={expandedFilters.categories}
            onChange={() => toggleFilterExpansion('categories')}
            sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Categories</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {categories
                  .filter(cat => cat.type === 'main')
                  .map((mainCategory) => (
                    <Box key={mainCategory._id} sx={{ mb: 2 }}>
                      {/* Main Category */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.category.includes(mainCategory._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleCategoryFilters([...filters.category, mainCategory._id]);
                              } else {
                                handleCategoryFilters(filters.category.filter(id => id !== mainCategory._id));
                              }
                            }}
                          />
                        }
                        label={
                          <Typography variant="subtitle2" fontWeight={600} color="primary">
                            {mainCategory.name}
                          </Typography>
                        }
                        sx={{ mb: 1 }}
                      />

                      {/* Subcategories under this main category */}
                      <Box sx={{ ml: 3 }}>
                        {categories
                          .filter(cat => cat.type === 'sub' && cat.parentId === mainCategory._id)
                          .map((subCategory) => (
                            <Box key={subCategory._id} sx={{ mb: 1 }}>
                              {/* Subcategory */}
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={filters.category.includes(subCategory._id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        handleCategoryFilters([...filters.category, subCategory._id]);
                                      } else {
                                        handleCategoryFilters(filters.category.filter(id => id !== subCategory._id));
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Typography variant="body2" fontWeight={500}>
                                    {subCategory.name}
                                  </Typography>
                                }
                                sx={{ mb: 0.5 }}
                              />

                              {/* Elements under this subcategory */}
                              <Box sx={{ ml: 3 }}>
                                {categories
                                  .filter(cat => cat.type === 'element' && cat.parentId === subCategory._id)
                                  .map((element) => (
                                    <FormControlLabel
                                      key={element._id}
                                      control={
                                        <Checkbox
                                          size="small"
                                          checked={filters.category.includes(element._id)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              handleCategoryFilters([...filters.category, element._id]);
                                            } else {
                                              handleCategoryFilters(filters.category.filter(id => id !== element._id));
                                            }
                                          }}
                                        />
                                      }
                                      label={
                                        <Typography variant="caption" color="text.secondary">
                                          {element.name}
                                        </Typography>
                                      }
                                    />
                                  ))}
                              </Box>
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Service Level */}
          <Accordion
            expanded={expandedFilters.serviceLevel}
            onChange={() => toggleFilterExpansion('serviceLevel')}
            sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Service Level</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {['basic', 'standard', 'premium'].map((level) => (
                  <FormControlLabel
                    key={level}
                    control={
                      <Checkbox
                        checked={filters.serviceLevel === level}
                        onChange={(e) => handleServiceLevelFilter(e.target.checked ? level : '')}
                      />
                    }
                    label={level.charAt(0).toUpperCase() + level.slice(1)}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* Pricing Model */}
          <Accordion
            expanded={expandedFilters.pricing}
            onChange={() => toggleFilterExpansion('pricing')}
            sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Pricing Model</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormGroup>
                  {['fixed', 'hourly', 'project'].map((model) => (
                    <FormControlLabel
                      key={model}
                      control={
                        <Checkbox
                          checked={filters.pricingModel === model}
                          onChange={(e) => handlePricingModelFilter(e.target.checked ? model : '')}
                        />
                      }
                      label={model.charAt(0).toUpperCase() + model.slice(1)}
                    />
                  ))}
                </FormGroup>

                {/* Price Range */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Price Range
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      label="Min"
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handlePriceRangeChange('minPrice', e.target.value)}
                      InputProps={{ startAdornment: <Typography>$</Typography> }}
                    />
                    <TextField
                      size="small"
                      label="Max"
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handlePriceRangeChange('maxPrice', e.target.value)}
                      InputProps={{ startAdornment: <Typography>$</Typography> }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Features */}
          <Accordion
            expanded={expandedFilters.features}
            onChange={() => toggleFilterExpansion('features')}
            sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Features</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.isFeatured}
                      onChange={() => handleFeatureFilter('isFeatured')}
                    />
                  }
                  label="Featured Services Only"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Action Buttons */}
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              Apply Filters
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearAllFilters}
              startIcon={<ClearIcon />}
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              Clear All
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
};

// Service Card Component (moved here for better organization)
const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  return (
    <Card sx={{ maxWidth: 345, m: 2, cursor: 'pointer', boxShadow: 3 }} onClick={() => navigate(`/services/${service._id}`)}>
      {service.images && service.images.length > 0 && (
        <CardMedia
          component="img"
          height="180"
          image={service.images[0]}
          alt={service.title}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {service.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {service.description?.slice(0, 60)}...
        </Typography>
        <Typography variant="subtitle2" color="primary" mt={1}>
          From ${service.price || (service.packages && service.packages[0]?.price) || 'N/A'}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {service.subcategory && (
            <Chip
              label={service.subcategory}
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
          {service.serviceLevel && (
            <Chip
              label={service.serviceLevel}
              size="small"
              variant="outlined"
              color="secondary"
            />
          )}
          {service.isFeatured && (
            <Chip
              label="Featured"
              size="small"
              variant="filled"
              color="success"
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          Seller: {service.sellerName || service.provider || 'Unknown'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ServicesPage;