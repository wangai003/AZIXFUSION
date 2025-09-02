import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubcategoryIcon,
  List as ElementIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMainCategories,
  fetchSubcategories,
  fetchElements,
  createCategory,
  updateCategory,
  deleteCategory,
  selectMainCategories,
  selectSubcategoriesByParent,
  selectElementsBySubcategory,
  selectCategoriesLoading,
  selectCategoriesError,
  clearError
} from '../features/categories/CategoriesSlice';
import CategoryNavigation from '../components/CategoryNavigation';

const CategoryManagementPage = () => {
  const dispatch = useDispatch();
  const mainCategories = useSelector(selectMainCategories);
  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'main',
    parentId: '',
    level: 1,
    icon: 'category',
    sortOrder: 0
  });

  // Fetch categories on component mount
  useEffect(() => {
    if (!loading && (!mainCategories || mainCategories.length === 0)) {
      dispatch(fetchMainCategories());
    }
  }, [dispatch, loading, mainCategories]);

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-update level based on type
    if (field === 'type') {
      const level = value === 'main' ? 1 : value === 'sub' ? 2 : 3;
      setFormData(prev => ({ ...prev, level }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'main',
      parentId: '',
      level: 1,
      icon: 'category',
      sortOrder: 0
    });
    setEditingCategory(null);
  };

  // Open dialog for creating/editing
  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        type: category.type,
        parentId: category.parentId || '',
        level: category.level,
        icon: category.icon,
        sortOrder: category.sortOrder
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory._id, updateData: formData })).unwrap();
      } else {
        await dispatch(createCategory(formData)).unwrap();
      }
      
      handleCloseDialog();
      // Refresh categories
      dispatch(fetchMainCategories());
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Handle category deletion
  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all its children.`)) {
      try {
        await dispatch(deleteCategory(category._id)).unwrap();
        // Refresh categories
        dispatch(fetchMainCategories());
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSelectedElement(null);
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedElement(null);
  };

  const handleElementSelect = (element) => {
    setSelectedElement(element);
  };

  // Get available parent categories for the selected type
  const getAvailableParents = () => {
    if (formData.type === 'main') return [];
    if (formData.type === 'sub') return mainCategories;
    if (formData.type === 'element') {
      // Return subcategories of the selected main category
      return selectedCategory ? 
        useSelector(state => selectSubcategoriesByParent(state, selectedCategory._id)) : [];
    }
    return [];
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Category Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage the hierarchical category system for your e-commerce platform
        </Typography>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => dispatch(clearError())}
      >
        <Alert severity="error" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        {/* Left Panel - Category Navigation */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2">
                Category Structure
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Category
              </Button>
            </Box>
            
            <CategoryNavigation
              onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
              onElementSelect={handleElementSelect}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              selectedElement={selectedElement}
              showElements={true}
            />
          </Paper>
        </Grid>

        {/* Right Panel - Category Details & Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Category Details
            </Typography>
            
            {selectedCategory ? (
              <Box>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {selectedCategory.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {selectedCategory.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={selectedCategory.type} size="small" />
                      <Chip label={`Level ${selectedCategory.level}`} size="small" />
                      <Chip label={`Order: ${selectedCategory.sortOrder}`} size="small" />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(selectedCategory)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(selectedCategory)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>

                {selectedSubcategory && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {selectedSubcategory.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {selectedSubcategory.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={selectedSubcategory.type} size="small" />
                        <Chip label={`Level ${selectedSubcategory.level}`} size="small" />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(selectedSubcategory)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(selectedSubcategory)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                )}

                {selectedElement && (
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {selectedElement.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {selectedElement.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={selectedElement.type} size="small" />
                        <Chip label={`Level ${selectedElement.level}`} size="small" />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(selectedElement)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(selectedElement)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Select a category to view details and manage it.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Category Name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="main">Main Category</MenuItem>
                    <MenuItem value="sub">Subcategory</MenuItem>
                    <MenuItem value="element">Element</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Sort Order"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => handleFormChange('sortOrder', parseInt(e.target.value))}
                />
              </Grid>
              
              {formData.type !== 'main' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Parent Category</InputLabel>
                    <Select
                      value={formData.parentId}
                      onChange={(e) => handleFormChange('parentId', e.target.value)}
                      label="Parent Category"
                      required
                    >
                      {getAvailableParents().map((parent) => (
                        <MenuItem key={parent._id} value={parent._id}>
                          {parent.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Icon (Material-UI icon name)"
                  value={formData.icon}
                  onChange={(e) => handleFormChange('icon', e.target.value)}
                  helperText="Enter a Material-UI icon name (e.g., 'shopping_cart', 'home')"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!formData.name || (formData.type !== 'main' && !formData.parentId)}
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Quick Add */}
      <Fab
        color="primary"
        aria-label="add category"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default CategoryManagementPage;
