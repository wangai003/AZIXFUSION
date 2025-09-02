import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Stack,
  FormHelperText,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubcategoryIcon,
  List as ElementIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMainCategories,
  fetchSubcategories,
  fetchElements,
  selectMainCategories,
  selectSubcategoriesByParent,
  selectElementsBySubcategory,
  selectCategoriesLoading
} from '../../categories/CategoriesSlice';

export const CategorySelector = ({
  value = {},
  onChange,
  error,
  helperText,
  required = false,
  disabled = false
}) => {
  const dispatch = useDispatch();
  const mainCategories = useSelector(selectMainCategories);
  const loading = useSelector(selectCategoriesLoading);
  
  const [selectedCategory, setSelectedCategory] = useState(value.category || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(value.subcategory || '');
  const [selectedElement, setSelectedElement] = useState(value.element || '');

  // Get subcategories and elements for selected items
  const subcategories = useSelector(state => 
    selectedCategory ? selectSubcategoriesByParent(state, selectedCategory) : []
  );
  const elements = useSelector(state => 
    selectedSubcategory ? selectElementsBySubcategory(state, selectedSubcategory) : []
  );

  // Fetch main categories on mount
  useEffect(() => {
    if (!mainCategories || mainCategories.length === 0) {
      dispatch(fetchMainCategories());
    }
  }, [dispatch, mainCategories]);

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    setSelectedElement('');
    
    // Fetch subcategories
    if (categoryId) {
      dispatch(fetchSubcategories(categoryId));
    }
    
    // Update parent form
    onChange({
      category: categoryId,
      subcategory: '',
      element: ''
    });
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    setSelectedElement('');
    
    // Fetch elements
    if (subcategoryId) {
      dispatch(fetchElements(subcategoryId));
    }
    
    // Update parent form
    onChange({
      category: selectedCategory,
      subcategory: subcategoryId,
      element: ''
    });
  };

  // Handle element selection
  const handleElementChange = (elementId) => {
    setSelectedElement(elementId);
    
    // Update parent form
    onChange({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      element: elementId
    });
  };

  // Get display names for selected items
  const getCategoryName = (id) => {
    return mainCategories.find(cat => cat._id === id)?.name || '';
  };

  const getSubcategoryName = (id) => {
    return subcategories.find(sub => sub._id === id)?.name || '';
  };

  const getElementName = (id) => {
    return elements.find(elem => elem._id === id)?.name || '';
  };

  // Check if we have a complete selection
  const hasCompleteSelection = selectedCategory && selectedSubcategory && selectedElement;

  if (loading && !mainCategories.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Product Categories
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select the appropriate category, subcategory, and element for your product
        </Typography>
      </Box>

      {/* Category Selection */}
      <Stack spacing={2}>
        {/* Main Category */}
        <FormControl fullWidth error={!!error && !selectedCategory} required={required}>
          <InputLabel>Main Category *</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            label="Main Category *"
            disabled={disabled}
            startAdornment={
              <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
            }
          >
            {mainCategories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  {category.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
          {!selectedCategory && error && (
            <FormHelperText>{error}</FormHelperText>
          )}
        </FormControl>

        {/* Subcategory */}
        <FormControl fullWidth disabled={!selectedCategory || disabled}>
          <InputLabel>Subcategory</InputLabel>
          <Select
            value={selectedSubcategory}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            label="Subcategory"
            startAdornment={
              <SubcategoryIcon sx={{ mr: 1, color: 'secondary.main' }} />
            }
          >
            {subcategories.length > 0 ? (
              subcategories.map((subcategory) => (
                <MenuItem key={subcategory._id} value={subcategory._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SubcategoryIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                    {subcategory.name}
                  </Box>
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                <em>Select a main category first</em>
              </MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Element */}
        <FormControl fullWidth disabled={!selectedSubcategory || disabled}>
          <InputLabel>Element</InputLabel>
          <Select
            value={selectedElement}
            onChange={(e) => handleElementChange(e.target.value)}
            label="Element"
            startAdornment={
              <ElementIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }
          >
            {elements.length > 0 ? (
              elements.map((element) => (
                <MenuItem key={element._id} value={element._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ElementIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    {element.name}
                  </Box>
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                <em>Select a subcategory first</em>
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Stack>

      {/* Selection Summary */}
      {hasCompleteSelection && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
          <Typography variant="subtitle2" color="success.main" gutterBottom>
            Category Selection Complete
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={getCategoryName(selectedCategory)}
              icon={<CategoryIcon />}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={getSubcategoryName(selectedSubcategory)}
              icon={<SubcategoryIcon />}
              color="secondary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={getElementName(selectedElement)}
              icon={<ElementIcon />}
              color="default"
              variant="outlined"
              size="small"
            />
          </Stack>
        </Box>
      )}

      {/* Helper Text */}
      {helperText && (
        <FormHelperText sx={{ mt: 1 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default CategorySelector;
