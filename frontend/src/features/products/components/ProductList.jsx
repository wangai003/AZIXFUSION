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
  Zoom
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
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
  selectProductActionStatus
} from '../ProductSlice';
import { ProductCard } from './ProductCard';
import { selectBrands } from '../../brands/BrandSlice';
import { 
  selectCategories,
  fetchMainCategories,
  fetchSubcategories,
  fetchElements
} from '../../categories/CategoriesSlice';
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
import { ProductBanner } from './ProductBanner';
import Lottie from 'lottie-react';
import { banner1, banner2, banner3, banner4 } from '../../../assets';
import { EnhancedCategoryFilter } from './EnhancedCategoryFilter';

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

const bannerImages = [banner1, banner3, banner2, banner4];

export const MarketplaceList = ({ type = 'product' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  
  // State
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('Newest First');
  const [viewMode, setViewMode] = useState('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    brands: false,
    categories: false,
    features: false
  });

  // Enhanced category filtering state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);

  // Filters state
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

  // Selectors
  const products = useSelector(selectProducts);
  const totalResults = useSelector(selectProductTotalResults);
  const fetchStatus = useSelector(selectProductFetchStatus);
  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);
  const loggedInUser = useSelector(selectLoggedInUser);
  const cartItemAddStatus = useSelector(selectCartItemAddStatus);
  const wishlistItems = useSelector(selectWishlistItems);
  const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus);
  const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus);
  const productActionStatus = useSelector(selectProductActionStatus);

  // Effects
  useEffect(() => {
    if (dispatch) {
      dispatch(fetchMainCategories());
    }
  }, [dispatch]);

  // Redux selectors with safety checks
  const safeProducts = Array.isArray(products) ? products : [];

  // Enhanced category filter handlers
  const handleCategoryChange = (categoryIds) => {
    setSelectedCategories(categoryIds);
    setFilters(prev => ({ ...prev, category: categoryIds }));
    setPage(1);
  };

  const handleSubcategoryChange = (subcategoryIds) => {
    setSelectedSubcategories(subcategoryIds);
    setFilters(prev => ({ ...prev, subcategory: subcategoryIds }));
    setPage(1);
  };

  const handleElementChange = (elementIds) => {
    setSelectedElements(elementIds);
    setFilters(prev => ({ ...prev, element: elementIds }));
    setPage(1);
  };

  const clearAllCategoryFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedElements([]);
    setFilters(prev => ({ 
      ...prev, 
      category: [], 
      subcategory: [], 
      element: [] 
    }));
    setPage(1);
  };

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

  const handlePriceRangeChange = (event, newValue) => {
    setFilters({ ...filters, priceRange: newValue });
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, searchQuery: e.target.value });
    setPage(1);
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
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedElements([]);
    setSort('Newest First');
    setPage(1);
  };

  const toggleFilterExpansion = (filterType) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  // Effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: "instant"
      });
    }
  }, []);

  useEffect(() => {
    if (totalResults > 0) {
      setPage(1);
    }
  }, [totalResults]);

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

      if (loggedInUser && !loggedInUser.isAdmin) {
        finalFilters['user'] = true;
      }

      dispatch(fetchProductsAsync(finalFilters));
    }
  }, [filters, page, sort, dispatch, loggedInUser]);

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

      if (!loggedInUser.isAdmin) {
        finalFilters['user'] = true;
      }

      // Refresh the products list
      dispatch(fetchProductsAsync(finalFilters));
    }
  }, [productActionStatus, dispatch, loggedInUser, filters, page, sort]);

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
    if (fetchStatus === 'rejected') {
      toast.error("Error fetching products, please try again later");
    }
  }, [fetchStatus]);

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
    filters.searchQuery ? 1 : 0,
    filters.inStock ? 1 : 0,
    filters.onSale ? 1 : 0,
    filters.featured ? 1 : 0,
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  if (fetchStatus === 'pending') {
    return (
      <Stack 
        width={isMobile ? "35vh" : '25rem'} 
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
      {/* Enhanced Banner Section */}
      {!isMobile && (
        <Box sx={{ mb: 4 }}>
          <ProductBanner images={bannerImages} />
        </Box>
      )}

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
              Marketplace
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover amazing products from trusted sellers
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
          
          {/* Debug: Manual Refresh Button */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
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

              if (loggedInUser && !loggedInUser.isAdmin) {
                finalFilters['user'] = true;
              }

              dispatch(fetchProductsAsync(finalFilters));
            }}
          >
            Refresh Products
          </Button>
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
              <TextField
                fullWidth
                placeholder="Search products..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
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
            </Grid>

            {/* Sort Dropdown */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  label="Sort By"
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
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={() => setFilterDrawerOpen(true)}
                sx={{ 
                  borderRadius: 2,
                  py: 1.5,
                  position: 'relative'
                }}
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
            <Box sx={{ mt: 3 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Active filters:
                </Typography>
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
                      onDelete={() => handleCategoryChange({ target: { value: catId, checked: false } })}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : null;
                })}
                {filters.searchQuery && (
                  <Chip
                    label={`Search: ${filters.searchQuery}`}
                    onDelete={() => setFilters({ ...filters, searchQuery: '' })}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {filters.inStock && (
                  <Chip
                    label="In Stock"
                    onDelete={() => setFilters({ ...filters, inStock: false })}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
                {filters.onSale && (
                  <Chip
                    label="On Sale"
                    onDelete={() => setFilters({ ...filters, onSale: false })}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
                {filters.featured && (
                  <Chip
                    label="Featured"
                    onDelete={() => setFilters({ ...filters, featured: false })}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
                <Button
                  size="small"
                  onClick={clearAllFilters}
                  startIcon={<ClearIcon />}
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
          {console.log('ProductList - products:', safeProducts)}
          {console.log('ProductList - products.length:', safeProducts?.length)}
          {console.log('ProductList - productFetchStatus:', fetchStatus)}
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
                {safeProducts.map((product, index) => (
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
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search criteria or filters
              </Typography>
              <Button 
                variant="outlined" 
                onClick={clearAllFilters}
                startIcon={<ClearIcon />}
              >
                Clear All Filters
              </Button>
            </Box>
          )}
        </Box>

        {/* Pagination */}
        {totalResults > 0 && (
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
                count={Math.ceil(totalResults / ITEMS_PER_PAGE)} 
                variant="outlined" 
                shape="rounded"
                size={isMobile ? 'medium' : 'large'}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    mx: 0.5
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, totalResults)} of {totalResults} results
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
              <EnhancedCategoryFilter
                selectedCategories={selectedCategories}
                selectedSubcategories={selectedSubcategories}
                selectedElements={selectedElements}
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={handleSubcategoryChange}
                onElementChange={handleElementChange}
                onClearAll={clearAllCategoryFilters}
                showSearch={true}
                showStatistics={false}
              />
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
    </>
  );
};
