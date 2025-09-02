import React, { useEffect, useState } from 'react';
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
  Card,
  CardContent,
  Slider,
  Divider,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProductsAsync, 
  resetProductFetchStatus, 
  selectProductFetchStatus, 
  selectProductIsFilterOpen, 
  selectProductTotalResults, 
  selectProducts, 
  toggleFilters,
  selectProductActionStatus,
  clearProducts
} from '../ProductSlice';
import { ProductCard } from './ProductCard';
import { selectBrands } from '../../brands/BrandSlice';
import { selectCategories } from '../../categories/CategoriesSlice';
import { EnhancedCategoryFilter } from './EnhancedCategoryFilter';
import { 
  createWishlistItemAsync, 
  deleteWishlistItemByIdAsync, 
  resetWishlistItemAddStatus, 
  resetWishlistItemDeleteStatus, 
  selectWishlistItemAddStatus, 
  selectWishlistItemDeleteStatus, 
  selectWishlistItems 
} from '../../wishlist/WishlistSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { toast } from 'react-toastify';
import { loadingAnimation } from '../../../assets';
import { resetCartItemAddStatus, selectCartItemAddStatus } from '../../cart/CartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Navbar } from '../../navigation/components/Navbar';
import { Footer } from '../../footer/Footer';

const ITEMS_PER_PAGE = 12;

const sortOptions = [
  { name: "Newest First", sort: "createdAt", order: "desc" },
  { name: "Oldest First", sort: "createdAt", order: "asc" },
  { name: "Price: Low to High", sort: "price", order: "asc" },
  { name: "Price: High to Low", sort: "price", order: "desc" },
  { name: "Name: A to Z", sort: "title", order: "asc" },
  { name: "Name: Z to A", sort: "title", order: "desc" },
  { name: "Most Popular", sort: "rating", order: "desc" },
  { name: "Best Rated", sort: "rating", order: "desc" }
];

export const GoodsMarketplace = () => {
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
    brand: [], 
    category: [],
    subcategory: [],
    element: [],
    priceRange: [0, 10000],
    searchQuery: '',
    inStock: false,
    onSale: false,
    featured: false
  });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('Newest First');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    brands: true,
    categories: true,
    price: true,
    features: true
  });
  const [searchInput, setSearchInput] = useState(''); // Separate state for search input
  const [localSearchQuery, setLocalSearchQuery] = useState(''); // Local search for real-time filtering

  // Redux selectors with safety checks
  const brands = useSelector(selectBrands) || [];
  const categories = useSelector(selectCategories) || [];
  const products = useSelector(selectProducts);
  const totalResults = useSelector(selectProductTotalResults) || 0;
  
  // Ensure products is always an array to prevent "not iterable" errors
  const safeProducts = Array.isArray(products) ? products : [];
  
  const loggedInUser = useSelector(selectLoggedInUser);
  const productFetchStatus = useSelector(selectProductFetchStatus) || 'idle';
  const wishlistItems = useSelector(selectWishlistItems) || [];
  const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus) || 'idle';
  const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus) || 'idle';
  const cartItemAddStatus = useSelector(selectCartItemAddStatus) || 'idle';
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen) || false;
  const productActionStatus = useSelector(selectProductActionStatus) || 'idle';

  // Filter handlers
  const handleBrandFilters = (e) => {
    const filterSet = new Set(filters.brand || []);
    if (e.target.checked) {
      filterSet.add(e.target.value);
    } else {
      filterSet.delete(e.target.value);
    }
    const filterArray = Array.from(filterSet);
    setFilters({ ...filters, brand: filterArray });
    setPage(1);
  };

  const handleCategoryFilters = (categoryIds) => {
    setFilters({ ...filters, category: categoryIds });
    setPage(1);
  };

  const handleSubcategoryFilters = (subcategoryIds) => {
    setFilters({ ...filters, subcategory: subcategoryIds });
    setPage(1);
  };

  const handleElementFilters = (elementIds) => {
    setFilters({ ...filters, element: elementIds });
    setPage(1);
  };

  const handlePriceRangeChange = (event, newValue) => {
    setFilters({ ...filters, priceRange: newValue });
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
      brand: [], 
      category: [],
      subcategory: [],
      element: [],
      priceRange: [0, 10000],
      searchQuery: '',
      inStock: false,
      onSale: false,
      featured: false
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

  // Wishlist handlers
  const handleAddRemoveFromWishlist = (e, productId) => {
    if (e.target.checked) {
      if (loggedInUser && loggedInUser._id) {
        const data = { user: loggedInUser._id, product: productId };
        dispatch(createWishlistItemAsync(data));
      }
    } else {
      const index = wishlistItems.findIndex((item) => 
        item && item.product && item.product._id === productId
      );
      if (index !== -1 && wishlistItems[index]) {
        dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
      }
    }
  };

  // Toast notifications
  useEffect(() => {
    if (wishlistItemAddStatus === 'fulfilled') {
      toast.success("Product added to wishlist");
    } else if (wishlistItemAddStatus === 'rejected') {
      toast.error("Error adding product to wishlist, please try again later");
    }
  }, [wishlistItemAddStatus]);

  useEffect(() => {
    if (wishlistItemDeleteStatus === 'fulfilled') {
      toast.success("Product removed from wishlist");
    } else if (wishlistItemDeleteStatus === 'rejected') {
      toast.error("Error removing product from wishlist, please try again later");
    }
  }, [wishlistItemDeleteStatus]);

  useEffect(() => {
    if (cartItemAddStatus === 'fulfilled') {
      toast.success("Product added to cart");
    } else if (cartItemAddStatus === 'rejected') {
      toast.error("Error adding product to cart, please try again later");
    }
  }, [cartItemAddStatus]);

  useEffect(() => {
    if (productFetchStatus === 'rejected') {
      toast.error("Error fetching products, please try again later");
    }
  }, [productFetchStatus]);

  useEffect(() => {
    return () => {
      if (dispatch) {
        dispatch(resetProductFetchStatus());
        dispatch(resetWishlistItemAddStatus());
        dispatch(resetWishlistItemDeleteStatus());
        dispatch(resetCartItemAddStatus());
      }
    };
  }, [dispatch]);

  const handleFilterClose = () => {
    if (dispatch) {
      dispatch(toggleFilters());
    }
  };

  // Calculate active filters count
  const activeFiltersCount = [
    filters.brand.length,
    filters.category.length,
    filters.subcategory.length,
    filters.element.length,
    localSearchQuery ? 1 : 0,
    filters.inStock ? 1 : 0,
    filters.onSale ? 1 : 0,
    filters.featured ? 1 : 0,
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) ? 1 : 0
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

  // Fetch products on component mount and when filters change
  useEffect(() => {
    if (dispatch) {
      const finalFilters = { ...filters };
      finalFilters['pagination'] = { page: page, limit: ITEMS_PER_PAGE };
      
      if (sort && sort !== 'Newest First') {
        const selectedSortOption = sortOptions.find(option => option.name === sort);
        if (selectedSortOption) {
          finalFilters['sort'] = {
            sort: selectedSortOption.sort,
            order: selectedSortOption.order
          };
        }
      }

      // Set goods-specific filters - show ALL products (not just goods seller products)
      // Remove isGoodsSellerProduct filter - this should show all products, not just goods seller products
      // Remove user filter - this should show all goods seller products, not just the current user's

      dispatch(fetchProductsAsync(finalFilters));
    }
  }, [filters, page, sort, dispatch]);

  // Reset page when total results change
  useEffect(() => {
    if (totalResults > 0) {
      setPage(1);
    }
  }, [totalResults]);

  // Refresh products when a new product is added
  useEffect(() => {
    if (productActionStatus === 'fulfilled' && dispatch && loggedInUser) {
      const finalFilters = { ...filters };
      finalFilters['pagination'] = { page: page, limit: ITEMS_PER_PAGE };
      
      if (sort && sort !== 'Newest First') {
        const selectedSortOption = sortOptions.find(option => option.name === sort);
        if (selectedSortOption) {
          finalFilters['sort'] = {
            sort: selectedSortOption.sort,
            order: selectedSortOption.order
          };
        }
      }

      // Refresh the products list
      dispatch(fetchProductsAsync(finalFilters));
    }
  }, [productActionStatus, dispatch, loggedInUser, filters, page, sort]);

  // Manual search function - only triggers when user clicks search button
  const handleManualSearch = () => {
    if (searchInput.trim()) {
      const newFilters = { ...filters, searchQuery: searchInput.trim() };
      setFilters(newFilters);
      setLocalSearchQuery(searchInput.trim()); // Set local search for real-time filtering
      setPage(1); // Reset to first page for new search
      
      // Immediately fetch products with the new search filter
      if (dispatch) {
        const finalFilters = { ...newFilters };
        finalFilters['pagination'] = { page: 1, limit: ITEMS_PER_PAGE };
        
        if (sort && sort !== 'Newest First') {
          const selectedSortOption = sortOptions.find(option => option.name === sort);
          if (selectedSortOption) {
            finalFilters['sort'] = {
              sort: selectedSortOption.sort,
              order: selectedSortOption.order
            };
          }
        }

        dispatch(fetchProductsAsync(finalFilters));
      }
    }
  };

  // Real-time search filtering function
  const getFilteredProducts = () => {
    if (!safeProducts || safeProducts.length === 0) return [];
    
    let filtered = [...safeProducts];
    
    // Remove the goods seller filter - show all products
    // filtered = filtered.filter(product => product.isGoodsSellerProduct === true);
    
    // Apply local search filter (real-time)
    if (localSearchQuery.trim()) {
      const searchTerm = localSearchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        // Search in title, brand name, category name, and description
        const title = (product.title || '').toLowerCase();
        const brandName = (product.brand?.name || '').toLowerCase();
        const categoryName = (product.category?.name || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        
        return title.includes(searchTerm) || 
               brandName.includes(searchTerm) || 
               categoryName.includes(searchTerm) || 
               description.includes(searchTerm);
      });
    }
    
    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(product => 
        product.category && filters.category.includes(product.category._id)
      );
    }
    
    // Apply subcategory filter
    if (filters.subcategory.length > 0) {
      filtered = filtered.filter(product => 
        product.subcategory && filters.subcategory.includes(product.subcategory._id)
      );
    }
    
    // Apply element filter
    if (filters.element.length > 0) {
      filtered = filtered.filter(product => 
        product.element && filters.element.includes(product.element._id)
      );
    }
    
    // Apply brand filter
    if (filters.brand.length > 0) {
      filtered = filtered.filter(product => 
        product.brand && filters.brand.includes(product.brand._id)
      );
    }
    
    // Apply price range filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );
    }
    
    // Apply feature filters
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stockQuantity > 0);
    }
    
    if (filters.onSale) {
      filtered = filtered.filter(product => product.onSale === true);
    }
    
    if (filters.featured) {
      filtered = filtered.filter(product => product.featured === true);
    }
    
    return filtered;
  };

  // Get filtered and paginated products
  const getDisplayProducts = () => {
    const filtered = getFilteredProducts();
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  };

  // Get total count of filtered products
  const getFilteredTotalResults = () => {
    return getFilteredProducts().length;
  };

  // Show loading only when initially fetching products
  if (productFetchStatus === 'pending' && safeProducts.length === 0) {
    return (
      <Stack 
        width={is500 ? "35vh" : '25rem'} 
        height={'calc(100vh - 4rem)'} 
        justifyContent={'center'} 
        marginRight={'auto'} 
        marginLeft={'auto'}
      >
        <Lottie animationData={loadingAnimation} />
      </Stack>
    );
  }

  return (
    <>
      <Navbar isProductList={true} />
      
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
              Goods Marketplace
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover amazing products exclusively from verified goods sellers
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
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
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
                  disabled={productFetchStatus === 'pending' || !searchInput.trim()}
                >
                  {productFetchStatus === 'pending' ? 'Searching...' : 'Search'}
                </Button>
              </Box>
            </Grid>

            {/* Sort Dropdown */}
            <Grid item xs={12} sm={6} md={2}>
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
            <Grid item xs={12} sm={6} md={2}>
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
                {filters.brand.map(brandId => {
                  const brand = brands.find(b => b._id === brandId);
                  return brand ? (
                    <Chip
                      key={brandId}
                      label={brand.name}
                      onDelete={() => handleBrandFilters({ target: { value: brandId, checked: false } })}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : null;
                })}
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
                {filters.subcategory.map(subcatId => {
                  // You might need to fetch subcategory names here
                  return (
                    <Chip
                      key={subcatId}
                      label={`Sub: ${subcatId}`}
                      onDelete={() => handleSubcategoryFilters(filters.subcategory.filter(id => id !== subcatId))}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  );
                })}
                {filters.element.map(elementId => {
                  // You might need to fetch element names here
                  return (
                    <Chip
                      key={elementId}
                      label={`Element: ${elementId}`}
                      onDelete={() => handleElementFilters(filters.element.filter(id => id !== elementId))}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  );
                })}
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

        {/* Products Grid */}
        <Box sx={{ mb: 4 }}>
          {safeProducts && safeProducts.length > 0 ? (
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
                {getDisplayProducts().map((product, index) => (
                  product && product._id ? (
                    <Grid 
                      item 
                      key={product._id}
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
                        <ProductCard 
                          id={product._id} 
                          title={product.title || 'No Title'} 
                          thumbnail={product.thumbnail || ''} 
                          brand={product.brand && product.brand.name ? product.brand.name : 'Unknown Brand'} 
                          price={product.price || 0} 
                          stockQuantity={product.stockQuantity || 0}
                          handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                          viewMode={viewMode}
                        />
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
              <StoreIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {localSearchQuery ? 'No products found' : 'No goods available'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {localSearchQuery 
                  ? `No products match "${localSearchQuery}". Try a different search term.`
                  : filters.category.length > 0 || filters.brand.length > 0 || activeFiltersCount > 0
                    ? 'Try adjusting your filters'
                    : 'No goods sellers have added products yet. Check back later!'
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
        {getFilteredTotalResults() > 0 && (
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
                count={Math.ceil(getFilteredTotalResults() / ITEMS_PER_PAGE)} 
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
                Page {page} of {Math.ceil(getFilteredTotalResults() / ITEMS_PER_PAGE)}
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

          <Divider />

          {/* Hierarchical Category Filter */}
          <EnhancedCategoryFilter
            selectedCategories={filters.category}
            selectedSubcategories={filters.subcategory}
            selectedElements={filters.element}
            onCategoryChange={handleCategoryFilters}
            onSubcategoryChange={handleSubcategoryFilters}
            onElementChange={handleElementFilters}
            onClearAll={() => {
              setFilters({ ...filters, category: [], subcategory: [], element: [] });
            }}
          />

          <Divider />

          {/* Price Range */}
          <Accordion 
            expanded={expandedFilters.price}
            onChange={() => toggleFilterExpansion('price')}
            sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Price Range</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={filters.priceRange}
                  onChange={handlePriceRangeChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10000}
                  step={100}
                  sx={{ mt: 2 }}
                />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="body2">₳{filters.priceRange[0]}</Typography>
                  <Typography variant="body2">₳{filters.priceRange[1]}</Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Brands */}
          <Accordion 
            expanded={expandedFilters.brands}
            onChange={() => toggleFilterExpansion('brands')}
            sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Brands</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {brands.map((brand) => (
                  brand && brand._id ? (
                    <FormControlLabel
                      key={brand._id}
                      control={
                        <Checkbox 
                          checked={filters.brand.includes(brand._id)}
                          onChange={handleBrandFilters}
                          value={brand._id}
                        />
                      }
                      label={brand.name || 'Unknown Brand'}
                    />
                  ) : null
                ))}
              </FormGroup>
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
                      checked={filters.inStock}
                      onChange={() => handleFeatureFilter('inStock')}
                    />
                  }
                  label="In Stock Only"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={filters.onSale}
                      onChange={() => handleFeatureFilter('onSale')}
                    />
                  }
                  label="On Sale"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={filters.featured}
                      onChange={() => handleFeatureFilter('featured')}
                    />
                  }
                  label="Featured Products"
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
      <Footer />
    </>
  );
};
