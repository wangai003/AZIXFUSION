import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import {
  Search,
  ExpandMore,
  ExpandLess,
  Category as CategoryIcon
} from '@mui/icons-material';
import { SERVICE_CATEGORIES } from '../../config/serviceCategories';

export const CategorySelector = ({ 
  value, 
  onChange, 
  error, 
  helperText,
  required = false,
  label = "Service Category *",
  placeholder = "Search and select your service category"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Flatten categories for search
  const allCategories = useMemo(() => {
    const flat = [];
    Object.entries(SERVICE_CATEGORIES).forEach(([mainCat, { icon, subcategories }]) => {
      flat.push({
        type: 'main',
        name: mainCat,
        icon,
        fullPath: mainCat
      });
      subcategories.forEach(subCat => {
        flat.push({
          type: 'sub',
          name: subCat,
          icon,
          fullPath: `${mainCat} > ${subCat}`,
          parent: mainCat
        });
      });
    });
    return flat;
  }, []);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return allCategories;
    
    return allCategories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.fullPath.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCategories, searchTerm]);

  // Group filtered categories by main category
  const groupedCategories = useMemo(() => {
    const grouped = {};
    filteredCategories.forEach(cat => {
      if (cat.type === 'main') {
        grouped[cat.name] = {
          ...cat,
          subcategories: []
        };
      } else if (cat.type === 'sub' && grouped[cat.parent]) {
        grouped[cat.parent].subcategories.push(cat);
      }
    });
    return grouped;
  }, [filteredCategories]);

  const handleCategorySelect = (category) => {
    onChange(category.fullPath);
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const renderCategoryOption = (category) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <span style={{ fontSize: '1.2em' }}>{category.icon}</span>
      <Box>
        <Typography variant="body1" fontWeight={500}>
          {category.name}
        </Typography>
        {category.type === 'sub' && (
          <Typography variant="caption" color="text.secondary">
            {category.parent}
          </Typography>
        )}
      </Box>
    </Box>
  );

  const renderCategoryGroup = (mainCat, categoryData) => (
    <Paper key={mainCat} sx={{ mb: 1, overflow: 'hidden' }}>
      <Button
        fullWidth
        onClick={() => toggleCategory(mainCat)}
        sx={{
          justifyContent: 'space-between',
          p: 2,
          textTransform: 'none',
          color: 'text.primary',
          '&:hover': { backgroundColor: 'action.hover' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: '1.5em' }}>{categoryData.icon}</span>
          <Typography variant="h6" fontWeight={600}>
            {mainCat}
          </Typography>
        </Box>
        {expandedCategories.has(mainCat) ? <ExpandLess /> : <ExpandMore />}
      </Button>
      
      <Collapse in={expandedCategories.has(mainCat)}>
        <Box sx={{ p: 2, pt: 0 }}>
          {categoryData.subcategories.map((subCat) => (
            <Button
              key={subCat.fullPath}
              fullWidth
              onClick={() => handleCategorySelect(subCat)}
              sx={{
                justifyContent: 'flex-start',
                p: 1.5,
                mb: 0.5,
                textTransform: 'none',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { 
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  borderColor: 'primary.main'
                }
              }}
            >
              <Typography variant="body2">
                {subCat.name}
              </Typography>
            </Button>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        required={required}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <CategoryIcon color="action" />
            </InputAdornment>
          )
        }}
        sx={{ mb: 2 }}
      />

      {value && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selected Category:
          </Typography>
          <Chip
            label={value}
            color="primary"
            variant="outlined"
            onDelete={() => onChange('')}
            deleteIcon={<ExpandLess />}
          />
        </Box>
      )}

      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {Object.entries(groupedCategories).map(([mainCat, categoryData]) =>
          renderCategoryGroup(mainCat, categoryData)
        )}
      </Box>

      {filteredCategories.length === 0 && searchTerm && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No categories found matching "{searchTerm}"
          </Typography>
          <Button
            onClick={() => setSearchTerm('')}
            sx={{ mt: 1 }}
            variant="outlined"
            size="small"
          >
            Clear Search
          </Button>
        </Box>
      )}
    </Box>
  );
};
