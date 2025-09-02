import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Button,
  Chip,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Category as CategoryIcon,
  TrendingUp as PricingIcon,
  Star as LevelIcon
} from '@mui/icons-material';
import { SERVICE_CATEGORIES, PRICING_MODELS, SERVICE_LEVELS } from '../../config/serviceCategories';

export const ServiceSearchFilter = ({ 
  onSearch, 
  onClear,
  initialFilters = {},
  showAdvancedFilters = true 
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters.q || '');
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    subcategory: initialFilters.subcategory || '',
    pricingModel: initialFilters.pricingModel || '',
    serviceLevel: initialFilters.serviceLevel || '',
    minPrice: initialFilters.minPrice || 0,
    maxPrice: initialFilters.maxPrice || 10000,
    isFeatured: initialFilters.isFeatured || false,
    ...initialFilters
  });

  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  // Update subcategories when category changes
  useEffect(() => {
    if (filters.category && SERVICE_CATEGORIES[filters.category]) {
      setAvailableSubcategories(SERVICE_CATEGORIES[filters.category].subcategories);
      // Reset subcategory if it's not available in the new category
      if (!SERVICE_CATEGORIES[filters.category].subcategories.includes(filters.subcategory)) {
        setFilters(prev => ({ ...prev, subcategory: '' }));
      }
    } else {
      setAvailableSubcategories([]);
      setFilters(prev => ({ ...prev, subcategory: '' }));
    }
  }, [filters.category]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    const searchFilters = {
      q: searchQuery,
      ...filters
    };
    onSearch(searchFilters);
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilters({
      category: '',
      subcategory: '',
      pricingModel: '',
      serviceLevel: '',
      minPrice: 0,
      maxPrice: 10000,
      isFeatured: false
    });
    onClear();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const priceRangeMarks = [
    { value: 0, label: '$0' },
    { value: 2500, label: '$2.5k' },
    { value: 5000, label: '$5k' },
    { value: 7500, label: '$7.5k' },
    { value: 10000, label: '$10k+' }
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon />
          Search Services
        </Typography>
        
        {/* Search Bar */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                fullWidth
              >
                Search
              </Button>
              <Button
                variant="outlined"
                onClick={handleClear}
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {showAdvancedFilters && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon />
              <Typography variant="subtitle1">Advanced Filters</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Category & Subcategory */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {Object.entries(SERVICE_CATEGORIES).map(([category, { icon }]) => (
                      <MenuItem key={category} value={category}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{icon}</span>
                          {category}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!filters.category}>
                  <InputLabel>Subcategory</InputLabel>
                  <Select
                    value={filters.subcategory}
                    onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    label="Subcategory"
                  >
                    <MenuItem value="">All Subcategories</MenuItem>
                    {availableSubcategories.map((sub) => (
                      <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Pricing Model & Service Level */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Pricing Model</InputLabel>
                  <Select
                    value={filters.pricingModel}
                    onChange={(e) => handleFilterChange('pricingModel', e.target.value)}
                    label="Pricing Model"
                  >
                    <MenuItem value="">All Pricing Models</MenuItem>
                    {PRICING_MODELS.map((model) => (
                      <MenuItem key={model} value={model}>{model}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Service Level</InputLabel>
                  <Select
                    value={filters.serviceLevel}
                    onChange={(e) => handleFilterChange('serviceLevel', e.target.value)}
                    label="Service Level"
                  >
                    <MenuItem value="">All Service Levels</MenuItem>
                    {SERVICE_LEVELS.map((level) => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Price Range */}
              <Grid item xs={12}>
                <Typography gutterBottom>Price Range</Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onChange={(_, newValue) => {
                      handleFilterChange('minPrice', newValue[0]);
                      handleFilterChange('maxPrice', newValue[1]);
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={10000}
                    step={100}
                    marks={priceRangeMarks}
                    valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Min: ${filters.minPrice.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max: ${filters.maxPrice.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>

              {/* Featured Services */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.isFeatured}
                      onChange={(e) => handleFilterChange('isFeatured', e.target.checked)}
                    />
                  }
                  label="Featured Services Only"
                />
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Active Filters:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {filters.category && (
                  <Chip
                    label={`Category: ${filters.category}`}
                    onDelete={() => handleFilterChange('category', '')}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filters.subcategory && (
                  <Chip
                    label={`Subcategory: ${filters.subcategory}`}
                    onDelete={() => handleFilterChange('subcategory', '')}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filters.pricingModel && (
                  <Chip
                    label={`Pricing: ${filters.pricingModel}`}
                    onDelete={() => handleFilterChange('pricingModel', '')}
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {filters.serviceLevel && (
                  <Chip
                    label={`Level: ${filters.serviceLevel}`}
                    onDelete={() => handleFilterChange('serviceLevel', '')}
                    color="info"
                    variant="outlined"
                  />
                )}
                {(filters.minPrice > 0 || filters.maxPrice < 10000) && (
                  <Chip
                    label={`Price: $${filters.minPrice.toLocaleString()} - $${filters.maxPrice.toLocaleString()}`}
                    onDelete={() => {
                      handleFilterChange('minPrice', 0);
                      handleFilterChange('maxPrice', 10000);
                    }}
                    color="warning"
                    variant="outlined"
                  />
                )}
                {filters.isFeatured && (
                  <Chip
                    label="Featured Only"
                    onDelete={() => handleFilterChange('isFeatured', false)}
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
};
