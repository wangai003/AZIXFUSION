import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Skeleton,
  Alert,
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubcategoryIcon,
  List as ElementIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMainCategories,
  fetchSubcategories,
  fetchElements,
  selectMainCategories,
  selectSubcategoriesByParent,
  selectElementsBySubcategory,
  selectCategoriesLoading,
  selectCategoriesError
} from '../features/categories/CategoriesSlice';

const CategoryNavigation = ({ 
  onCategorySelect, 
  onSubcategorySelect, 
  onElementSelect,
  selectedCategory = null,
  selectedSubcategory = null,
  selectedElement = null,
  showElements = true,
  compact = false
}) => {
  const dispatch = useDispatch();
  const mainCategories = useSelector(selectMainCategories);
  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);
  
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});

  // Fetch main categories on component mount
  useEffect(() => {
    if (!loading && (!mainCategories || mainCategories.length === 0)) {
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
    if (!expandedSubcategories[subcategoryId] && showElements) {
      dispatch(fetchElements(subcategoryId));
    }
  };

  // Handle category selection
  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  // Handle subcategory selection
  const handleSubcategoryClick = (subcategory) => {
    if (onSubcategorySelect) {
      onSubcategorySelect(subcategory);
    }
  };

  // Handle element selection
  const handleElementClick = (element) => {
    if (onElementSelect) {
      onElementSelect(element);
    }
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={16} />
                  <Skeleton variant="text" width="80%" height={16} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading categories: {error}
      </Alert>
    );
  }

  if (!mainCategories || mainCategories.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No categories available
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => dispatch(fetchMainCategories())}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (compact) {
    return (
      <Box>
        <List dense>
          {mainCategories.map((category) => (
            <React.Fragment key={category._id}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={selectedCategory?._id === category._id}
                  onClick={() => handleCategoryClick(category)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemIcon>
                    <CategoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={category.name}
                    secondary={category.description}
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {mainCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
            <Card 
              sx={{ 
                height: '100%',
                border: selectedCategory?._id === category._id ? 2 : 1,
                borderColor: selectedCategory?._id === category._id ? 'primary.main' : 'divider',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <CardContent>
                {/* Category Header */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon color="primary" />
                    <Typography variant="h6" component="h3">
                      {category.name}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleCategoryExpansion(category._id)}
                  >
                    {expandedCategories[category._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                {/* Category Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>

                {/* Category Actions */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label="Select"
                    size="small"
                    color={selectedCategory?._id === category._id ? "primary" : "default"}
                    onClick={() => handleCategoryClick(category)}
                    clickable
                  />
                  <Chip
                    label="View Details"
                    size="small"
                    variant="outlined"
                    onClick={() => handleCategoryExpansion(category._id)}
                    clickable
                  />
                </Box>

                {/* Subcategories Collapse */}
                <Collapse in={expandedCategories[category._id]}>
                  <SubcategoriesList
                    categoryId={category._id}
                    expandedSubcategories={expandedSubcategories}
                    selectedSubcategory={selectedSubcategory}
                    selectedElement={selectedElement}
                    onSubcategoryExpansion={handleSubcategoryExpansion}
                    onSubcategoryClick={handleSubcategoryClick}
                    onElementClick={handleElementClick}
                    showElements={showElements}
                  />
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Subcategories List Component
const SubcategoriesList = ({
  categoryId,
  expandedSubcategories,
  selectedSubcategory,
  selectedElement,
  onSubcategoryExpansion,
  onSubcategoryClick,
  onElementClick,
  showElements
}) => {
  const dispatch = useDispatch();
  const subcategories = useSelector(state => selectSubcategoriesByParent(state, categoryId));
  
  if (!subcategories || subcategories.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No subcategories available
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Subcategories
      </Typography>
      <List dense>
        {subcategories.map((subcategory) => (
          <ListItem key={subcategory._id} disablePadding sx={{ mb: 1 }}>
            <Box sx={{ width: '100%' }}>
              {/* Subcategory Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <ListItemButton
                  selected={selectedSubcategory?._id === subcategory._id}
                  onClick={() => onSubcategoryClick(subcategory)}
                  sx={{ borderRadius: 1, flex: 1 }}
                >
                  <ListItemIcon>
                    <SubcategoryIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={subcategory.name}
                    secondary={subcategory.description}
                  />
                </ListItemButton>
                {showElements && (
                  <IconButton
                    size="small"
                    onClick={() => onSubcategoryExpansion(subcategory._id)}
                  >
                    {expandedSubcategories[subcategory._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
              </Box>

              {/* Elements Collapse */}
              {showElements && (
                <Collapse in={expandedSubcategories[subcategory._id]}>
                  <ElementsList
                    subcategoryId={subcategory._id}
                    selectedElement={selectedElement}
                    onElementClick={onElementClick}
                  />
                </Collapse>
              )}
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

// Elements List Component
const ElementsList = ({
  subcategoryId,
  selectedElement,
  onElementClick
}) => {
  const dispatch = useDispatch();
  const elements = useSelector(state => selectElementsBySubcategory(state, subcategoryId));

  useEffect(() => {
    if (elements.length === 0) {
      dispatch(fetchElements(subcategoryId));
    }
  }, [dispatch, subcategoryId, elements.length]);

  if (!elements || elements.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ pl: 4, fontStyle: 'italic' }}>
        No elements available
      </Typography>
    );
  }

  return (
    <Box sx={{ pl: 4, mt: 1 }}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Elements
      </Typography>
      <List dense>
        {elements.map((element) => (
          <ListItem key={element._id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={selectedElement?._id === element._id}
              onClick={() => onElementClick(element)}
              sx={{ borderRadius: 1 }}
              size="small"
            >
              <ListItemIcon>
                <ElementIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary={element.name}
                secondary={element.description}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CategoryNavigation;
