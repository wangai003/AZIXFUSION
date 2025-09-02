import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  Divider,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubcategoryIcon,
  List as ElementIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchMainCategories,
  fetchSubcategories,
  fetchElements,
  selectMainCategories,
  selectSubcategoriesByParent,
  selectElementsBySubcategory,
  selectCategoriesLoading
} from '../../categories/CategoriesSlice';

export const CategoryNavigation = ({ 
  showSubcategories = true,
  showElements = false,
  maxCategories = 8,
  onCategoryClick,
  compact = false
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mainCategories = useSelector(selectMainCategories);
  const loading = useSelector(selectCategoriesLoading);
  
  const [expandedCategories, setExpandedCategories] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Fetch main categories on mount
  useEffect(() => {
    if (!mainCategories || mainCategories.length === 0) {
      dispatch(fetchMainCategories());
    }
  }, [dispatch, mainCategories]);

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

  // Handle category click
  const handleCategoryClick = (category, type = 'main') => {
    if (onCategoryClick) {
      onCategoryClick(category, type);
    } else {
      // Default navigation
      navigate(`/products?category=${category.slug || category._id}`);
    }
  };

  // Handle mouse events for hover effects
  const handleMouseEnter = (categoryId) => {
    setHoveredCategory(categoryId);
  };

  const handleMouseLeave = () => {
    setHoveredCategory(null);
  };

  if (loading && !mainCategories.length) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h5" gutterBottom>
          Browse Categories
        </Typography>
        <Grid container spacing={2}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={16} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!mainCategories || mainCategories.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="info">
          No categories available at the moment.
        </Alert>
      </Box>
    );
  }

  const displayCategories = mainCategories.slice(0, maxCategories);

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Browse Categories
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Discover products organized by category
      </Typography>

      <Grid container spacing={2}>
        {displayCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
            <Zoom in={true} style={{ transitionDelay: `${Math.random() * 300}ms` }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  transform: hoveredCategory === category._id ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredCategory === category._id ? 4 : 1,
                  '&:hover': {
                    boxShadow: 6
                  }
                }}
                onMouseEnter={() => handleMouseEnter(category._id)}
                onMouseLeave={handleMouseLeave}
              >
                <CardActionArea
                  onClick={() => handleCategoryClick(category, 'main')}
                  sx={{ height: '100%', p: 2 }}
                >
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    {/* Category Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CategoryIcon color="primary" />
                      <Typography variant="h6" fontWeight={600} noWrap>
                        {category.name}
                      </Typography>
                    </Box>
                    
                    {/* Category Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {category.description || 'Explore this category'}
                    </Typography>

                    {/* Expand/Collapse Button */}
                    {showSubcategories && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={`${category.subcategoryCount || 0} subcategories`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryExpansion(category._id);
                          }}
                        >
                          {expandedCategories[category._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>

                {/* Subcategories (if expanded) */}
                {showSubcategories && expandedCategories[category._id] && (
                  <Fade in={expandedCategories[category._id]}>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Divider sx={{ my: 1 }} />
                      <SubcategoriesList
                        categoryId={category._id}
                        onSubcategoryClick={handleCategoryClick}
                        showElements={showElements}
                      />
                    </Box>
                  </Fade>
                )}
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* View All Categories Button */}
      {mainCategories.length > maxCategories && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Chip
            label={`View All ${mainCategories.length} Categories`}
            color="primary"
            variant="outlined"
            clickable
            onClick={() => navigate('/categories')}
            icon={<NavigateNextIcon />}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      )}
    </Box>
  );
};

// Subcategories List Component
const SubcategoriesList = ({ categoryId, onSubcategoryClick, showElements }) => {
  const dispatch = useDispatch();
  const subcategories = useSelector(state => selectSubcategoriesByParent(state, categoryId));
  const safeSubcategories = Array.isArray(subcategories) ? subcategories : [];

  if (!safeSubcategories || safeSubcategories.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No subcategories available
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {safeSubcategories.slice(0, 5).map((subcategory) => (
        <Box key={subcategory._id}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
            onClick={() => onSubcategoryClick(subcategory, 'sub')}
          >
            <SubcategoryIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {subcategory.name}
            </Typography>
            {showElements && (
              <Chip
                label={`${subcategory.elementCount || 0} items`}
                size="small"
                variant="outlined"
                color="secondary"
              />
            )}
          </Box>
          
          {/* Elements (if enabled) */}
          {showElements && (
            <ElementsList
              subcategoryId={subcategory._id}
              onElementClick={onSubcategoryClick}
            />
          )}
        </Box>
      ))}
      
      {safeSubcategories.length > 5 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
          +{safeSubcategories.length - 5} more subcategories
        </Typography>
      )}
    </Stack>
  );
};

// Elements List Component
const ElementsList = ({ subcategoryId, onElementClick }) => {
  const dispatch = useDispatch();
  const elements = useSelector(state => selectElementsBySubcategory(state, subcategoryId));
  const safeElements = Array.isArray(elements) ? elements : [];

  useEffect(() => {
    if (subcategoryId && (!safeElements || safeElements.length === 0)) {
      dispatch(fetchElements(subcategoryId));
    }
  }, [dispatch, subcategoryId, safeElements]);

  if (!safeElements || safeElements.length === 0) {
    return null;
  }

  return (
    <Box sx={{ pl: 2, mt: 1 }}>
      {safeElements.slice(0, 3).map((element) => (
        <Box
          key={element._id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 0.5,
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          onClick={() => onElementClick(element, 'element')}
        >
          <ElementIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {element.name}
          </Typography>
        </Box>
      ))}
      
      {safeElements.length > 3 && (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', pl: 2 }}>
          +{safeElements.length - 3} more items
        </Typography>
      )}
    </Box>
  );
};

export default CategoryNavigation;
