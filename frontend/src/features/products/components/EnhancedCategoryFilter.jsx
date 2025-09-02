import React, { useState, useEffect } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  Stack,
  Divider,
  Collapse,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Badge,
  Paper,
  Fade,
  Zoom
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubcategoryIcon,
  List as ElementIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMainCategories,
  fetchSubcategories,
  fetchElements,
  searchCategories,
  selectMainCategories,
  selectSubcategoriesByParent,
  selectElementsBySubcategory,
  selectCategoriesLoading,
  selectSearchResults
} from '../../categories/CategoriesSlice';

export const EnhancedCategoryFilter = ({ 
  selectedCategories, 
  selectedSubcategories, 
  selectedElements,
  onCategoryChange, 
  onSubcategoryChange, 
  onElementChange,
  onClearAll,
  showSearch = true,
  showStatistics = true
}) => {
  const dispatch = useDispatch();
  const mainCategories = useSelector(selectMainCategories);
  const loading = useSelector(selectCategoriesLoading);
  const searchResults = useSelector(selectSearchResults);
  
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch main categories on component mount
  useEffect(() => {
    if (!loading && (!mainCategories || mainCategories.length === 0)) {
      dispatch(fetchMainCategories());
    }
  }, [dispatch, loading, mainCategories]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      dispatch(searchCategories(query));
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  // Handle category expansion
  const handleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
    
    // Fetch subcategories when expanding
    if (!expandedCategories[categoryId]) {
      dispatch(fetchSubcategories(categoryId));
    }
  };

  // Handle subcategory expansion
  const handleSubcategoryExpansion = (subcategoryId) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
    
    // Fetch elements when expanding
    if (!expandedSubcategories[subcategoryId]) {
      dispatch(fetchElements(subcategoryId));
    }
  };

  // Handle category selection
  const handleCategorySelection = (categoryId, checked) => {
    if (checked) {
      onCategoryChange([...selectedCategories, categoryId]);
    } else {
      onCategoryChange(selectedCategories.filter(id => id !== categoryId));
    }
  };

  // Handle subcategory selection
  const handleSubcategorySelection = (subcategoryId, checked) => {
    if (checked) {
      onSubcategoryChange([...selectedSubcategories, subcategoryId]);
    } else {
      onSubcategoryChange(selectedSubcategories.filter(id => id !== subcategoryId));
    }
  };

  // Handle element selection
  const handleElementSelection = (elementId, checked) => {
    if (checked) {
      onElementChange([...selectedElements, elementId]);
    } else {
      onElementChange(selectedElements.filter(id => id !== elementId));
    }
  };

  // Check if category is selected
  const isCategorySelected = (categoryId) => {
    return selectedCategories.includes(categoryId);
  };

  // Check if subcategory is selected
  const isSubcategorySelected = (subcategoryId) => {
    return selectedSubcategories.includes(subcategoryId);
  };

  // Check if element is selected
  const isElementSelected = (elementId) => {
    return selectedElements.includes(elementId);
  };

  // Get selected count
  const getSelectedCount = () => {
    return selectedCategories.length + selectedSubcategories.length + selectedElements.length;
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FilterIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Categories
        </Typography>
        {getSelectedCount() > 0 && (
          <Badge badgeContent={getSelectedCount()} color="primary" />
        )}
      </Box>

      {/* Search Bar */}
      {showSearch && (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Box>
      )}

      {/* Search Results */}
      {showSearchResults && searchResults.length > 0 && (
        <Fade in={showSearchResults}>
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Search Results
            </Typography>
            <Stack spacing={1}>
              {searchResults.map((result) => (
                <Chip
                  key={result._id}
                  label={`${result.name} (${result.type})`}
                  size="small"
                  variant="outlined"
                  icon={<CategoryIcon />}
                  onClick={() => {
                    // Handle search result click - could navigate or select
                    console.log('Search result clicked:', result);
                  }}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Paper>
        </Fade>
      )}

      {/* Main Categories */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Loading categories...
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {mainCategories.map((category) => (
            <Accordion
              key={category._id}
              expanded={expandedCategories[category._id]}
              onChange={() => handleCategoryExpansion(category._id)}
              sx={{
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    gap: 1
                  }
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCategorySelected(category._id)}
                      onChange={(e) => handleCategorySelection(category._id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight={500}>
                        {category.name}
                      </Typography>
                    </Box>
                  }
                />
              </AccordionSummary>
              
              <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                <SubcategoriesList
                  categoryId={category._id}
                  expandedSubcategories={expandedSubcategories}
                  selectedSubcategories={selectedSubcategories}
                  selectedElements={selectedElements}
                  onSubcategoryExpansion={handleSubcategoryExpansion}
                  onSubcategorySelection={handleSubcategorySelection}
                  onElementSelection={handleElementSelection}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      {/* Clear All Button */}
      {getSelectedCount() > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={onClearAll}
            startIcon={<ClearIcon />}
            sx={{ borderRadius: 2 }}
          >
            Clear All Filters
          </Button>
        </Box>
      )}
    </Box>
  );
};

// Subcategories List Component
const SubcategoriesList = ({
  categoryId,
  expandedSubcategories,
  selectedSubcategories,
  selectedElements,
  onSubcategoryExpansion,
  onSubcategorySelection,
  onElementSelection
}) => {
  const dispatch = useDispatch();
  const subcategories = useSelector(state => selectSubcategoriesByParent(state, categoryId));
  const safeSubcategories = Array.isArray(subcategories) ? subcategories : [];

  if (!safeSubcategories || safeSubcategories.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ pl: 2, fontStyle: 'italic' }}>
        No subcategories available
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {safeSubcategories.map((subcategory) => (
        <Box key={subcategory._id} sx={{ pl: 2 }}>
          <Accordion
            expanded={expandedSubcategories[subcategory._id]}
            onChange={() => onSubcategoryExpansion(subcategory._id)}
            sx={{
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 1,
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                minHeight: 'auto',
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 1
                }
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedSubcategories.includes(subcategory._id)}
                    onChange={(e) => onSubcategorySelection(subcategory._id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SubcategoryIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                    <Typography variant="body2">
                      {subcategory.name}
                    </Typography>
                  </Box>
                }
              />
            </AccordionSummary>
            
            <AccordionDetails sx={{ pt: 0, pb: 1 }}>
              <ElementsList
                subcategoryId={subcategory._id}
                selectedElements={selectedElements}
                onElementSelection={onElementSelection}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      ))}
    </Stack>
  );
};

// Elements List Component
const ElementsList = ({
  subcategoryId,
  selectedElements,
  onElementSelection
}) => {
  const dispatch = useDispatch();
  const elements = useSelector(state => selectElementsBySubcategory(state, subcategoryId));
  const safeElements = Array.isArray(elements) ? elements : [];

  if (!safeElements || safeElements.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ pl: 2, fontStyle: 'italic' }}>
        No elements available
      </Typography>
    );
  }

  return (
    <Stack spacing={0.5} sx={{ pl: 2 }}>
      {safeElements.map((element) => (
        <FormControlLabel
          key={element._id}
          control={
            <Checkbox
              checked={selectedElements.includes(element._id)}
              onChange={(e) => onElementSelection(element._id, e.target.checked)}
              size="small"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ElementIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" fontSize="0.875rem">
                {element.name}
              </Typography>
            </Box>
          }
        />
      ))}
    </Stack>
  );
};

export default EnhancedCategoryFilter;
