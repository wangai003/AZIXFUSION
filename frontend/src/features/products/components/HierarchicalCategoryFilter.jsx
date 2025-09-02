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
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
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

export const HierarchicalCategoryFilter = ({ 
  selectedCategories, 
  selectedSubcategories, 
  selectedElements,
  onCategoryChange, 
  onSubcategoryChange, 
  onElementChange,
  onClearAll 
}) => {
  const dispatch = useDispatch();
  const mainCategories = useSelector(selectMainCategories);
  const loading = useSelector(selectCategoriesLoading);
  
  // Debug logging to check for duplicates
  console.log('HierarchicalCategoryFilter - mainCategories:', mainCategories);
  console.log('HierarchicalCategoryFilter - mainCategories.length:', mainCategories?.length);
  
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});

  // Fetch main categories on component mount
  useEffect(() => {
    // Only fetch if we don't have categories and we're not already loading
    if (!loading && (!mainCategories || mainCategories.length === 0)) {
      console.log('Fetching main categories...');
      dispatch(fetchMainCategories());
    }
  }, [dispatch, loading, mainCategories]);

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

  // Get selected items count for display
  const getSelectedCount = () => {
    return selectedCategories.length + selectedSubcategories.length + selectedElements.length;
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading categories...
        </Typography>
      </Box>
    );
  }

  // Ensure mainCategories is an array and has no duplicates
  if (!Array.isArray(mainCategories)) {
    console.log('mainCategories is not an array:', mainCategories);
    return (
              <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Error loading categories
        </Typography>
      </Box>
    );
  }

  // Remove duplicates based on _id
  const uniqueMainCategories = mainCategories.filter((category, index, self) => 
    index === self.findIndex(c => c._id === category._id)
  );

  if (uniqueMainCategories.length !== mainCategories.length) {
    console.log('Found duplicate categories:', {
      original: mainCategories.length,
      unique: uniqueMainCategories.length,
      duplicates: mainCategories.length - uniqueMainCategories.length
    });
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600} display="flex" alignItems="center" gap={1}>
          <CategoryIcon color="primary" />
          Categories
        </Typography>
        {getSelectedCount() > 0 && (
          <Chip 
            label={`${getSelectedCount()} selected`} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Categories List */}
      {uniqueMainCategories.map((category) => (
        <Accordion
          key={category._id}
          expanded={expandedCategories[category._id] || false}
          onChange={() => handleCategoryExpansion(category._id)}
          sx={{
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            mb: 1,
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
            {/* Subcategories */}
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

      {/* Clear All Button */}
      {getSelectedCount() > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Chip
            label="Clear All Categories"
            onClick={onClearAll}
            color="secondary"
            variant="outlined"
            clickable
            sx={{ cursor: 'pointer' }}
          />
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
  // Ensure subcategories is always an array to prevent "not iterable" errors
  const safeSubcategories = Array.isArray(subcategories) ? subcategories : [];
  
  // Debug logging
  console.log(`SubcategoriesList - categoryId: ${categoryId}, subcategories:`, subcategories);
  console.log(`SubcategoriesList - safeSubcategories:`, safeSubcategories);

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
          {/* Subcategory Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedSubcategories.includes(subcategory._id)}
                  onChange={(e) => onSubcategorySelection(subcategory._id, e.target.checked)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SubcategoryIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                  <Typography variant="body2" fontWeight={500}>
                    {subcategory.name}
                  </Typography>
                </Box>
              }
            />
            
            <Tooltip title="Toggle elements">
              <IconButton
                size="small"
                onClick={() => onSubcategoryExpansion(subcategory._id)}
                sx={{ ml: 'auto' }}
              >
                {expandedSubcategories[subcategory._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Elements */}
          <Collapse in={expandedSubcategories[subcategory._id]}>
            <ElementsList
              subcategoryId={subcategory._id}
              selectedElements={selectedElements}
              onElementSelection={onElementSelection}
            />
          </Collapse>
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
  // Ensure elements is always an array to prevent "not iterable" errors
  const safeElements = Array.isArray(elements) ? elements : [];
  
  // Debug logging
  console.log(`ElementsList - subcategoryId: ${subcategoryId}, elements:`, elements);
  console.log(`ElementsList - safeElements:`, safeElements);

  useEffect(() => {
    if (safeElements.length === 0) {
      dispatch(fetchElements(subcategoryId));
    }
  }, [dispatch, subcategoryId, safeElements.length]);

  if (!safeElements || safeElements.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ pl: 2, fontStyle: 'italic' }}>
        No elements available
      </Typography>
    );
  }

  return (
    <Box sx={{ pl: 2 }}>
      <FormGroup>
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
                <Typography variant="body2">
                  {element.name}
                </Typography>
              </Box>
            }
            sx={{ ml: 0 }}
          />
        ))}
      </FormGroup>
    </Box>
  );
};
