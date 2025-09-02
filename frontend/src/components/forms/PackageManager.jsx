import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Star,
  StarBorder,
  ContentCopy,
  AutoAwesome,
  TrendingUp,
  Speed,
  Support
} from '@mui/icons-material';
import { SERVICE_TEMPLATES, DELIVERY_TIME_OPTIONS, PRICING_MODELS, SERVICE_LEVELS } from '../../config/serviceCategories';

export const PackageManager = ({ 
  packages, 
  onChange, 
  category,
  pricingModel = 'fixed',
  onPricingModelChange 
}) => {
  const [editPackage, setEditPackage] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const defaultPackage = {
    name: '',
    price: '',
    description: '',
    deliveryTime: '',
    revisions: '',
    features: [''],
    isPopular: false,
    isRecommended: false
  };

  const handleAddPackage = () => {
    const newPackage = { ...defaultPackage };
    onChange([...packages, newPackage]);
  };

  const handleEditPackage = (index) => {
    setEditIndex(index);
    setEditPackage({ ...packages[index] });
  };

  const handleSavePackage = () => {
    if (editIndex >= 0) {
      const updatedPackages = [...packages];
      updatedPackages[editIndex] = editPackage;
      onChange(updatedPackages);
    } else {
      onChange([...packages, editPackage]);
    }
    setEditPackage(null);
    setEditIndex(-1);
  };

  const handleDeletePackage = (index) => {
    const updatedPackages = packages.filter((_, i) => i !== index);
    onChange(updatedPackages);
  };

  const handlePackageChange = (field, value) => {
    setEditPackage(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...editPackage.features];
    updatedFeatures[index] = value;
    setEditPackage(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleAddFeature = () => {
    setEditPackage(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = editPackage.features.filter((_, i) => i !== index);
    setEditPackage(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowTemplateDialog(false);
    
    // Apply template to packages
    const templatePackages = template.packages.map(pkg => ({
      ...pkg,
      features: pkg.features || []
    }));
    onChange(templatePackages);
  };

  const getPopularityIcon = (isPopular, isRecommended) => {
    if (isRecommended) return <Star sx={{ color: 'warning.main' }} />;
    if (isPopular) return <StarBorder sx={{ color: 'warning.main' }} />;
    return null;
  };

  const getPackageColor = (index) => {
    if (index === 0) return 'primary.main';
    if (index === 1) return 'secondary.main';
    if (index === 2) return 'success.main';
    return 'grey.500';
  };

  const renderPackageCard = (pkg, index) => (
    <Card 
      key={index} 
      sx={{ 
        mb: 2, 
        border: `2px solid ${getPackageColor(index)}`,
        position: 'relative',
        '&:hover': { boxShadow: 4 }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} color={getPackageColor(index)}>
              {pkg.name}
            </Typography>
            {getPopularityIcon(pkg.isPopular, pkg.isRecommended)}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit Package">
              <IconButton size="small" onClick={() => handleEditPackage(index)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Package">
              <IconButton size="small" color="error" onClick={() => handleDeletePackage(index)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700} color={getPackageColor(index)}>
            ${pkg.price}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pricingModel === 'hourly' ? 'per hour' : 'one-time'}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          {pkg.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Chip 
            icon={<Speed />} 
            label={`${pkg.deliveryTime} day${pkg.deliveryTime > 1 ? 's' : ''}`} 
            size="small" 
            sx={{ mr: 1 }}
          />
          <Chip 
            icon={<ContentCopy />} 
            label={`${pkg.revisions} revision${pkg.revisions > 1 ? 's' : ''}`} 
            size="small" 
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            What's included:
          </Typography>
          {pkg.features && pkg.features.map((feature, idx) => (
            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
              • {feature}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const renderEditDialog = () => (
    <Dialog open={!!editPackage} maxWidth="md" fullWidth>
      <DialogTitle>
        {editIndex >= 0 ? 'Edit Package' : 'Add New Package'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Package Name"
              value={editPackage?.name || ''}
              onChange={(e) => handlePackageChange('name', e.target.value)}
              placeholder="e.g., Basic, Standard, Premium"
              helperText="Choose a memorable name for your package"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={editPackage?.price || ''}
              onChange={(e) => handlePackageChange('price', e.target.value)}
              placeholder="0"
              helperText={`Price in USD ${pricingModel === 'hourly' ? 'per hour' : ''}`}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={editPackage?.description || ''}
              onChange={(e) => handlePackageChange('description', e.target.value)}
              placeholder="Describe what's included in this package"
              helperText="Be specific about what clients will receive"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Delivery Time</InputLabel>
              <Select
                value={editPackage?.deliveryTime || ''}
                onChange={(e) => handlePackageChange('deliveryTime', e.target.value)}
                label="Delivery Time"
              >
                {DELIVERY_TIME_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Revisions"
              type="number"
              value={editPackage?.revisions || ''}
              onChange={(e) => handlePackageChange('revisions', e.target.value)}
              placeholder="0"
              helperText="Number of free revisions included"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Package Features
              </Typography>
              <Button startIcon={<Add />} onClick={handleAddFeature} size="small">
                Add Feature
              </Button>
            </Box>
            {editPackage?.features?.map((feature, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Feature ${idx + 1}`}
                  value={feature}
                  onChange={(e) => handleFeatureChange(idx, e.target.value)}
                  placeholder="e.g., Source files included"
                />
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => handleRemoveFeature(idx)}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editPackage?.isPopular || false}
                    onChange={(e) => handlePackageChange('isPopular', e.target.checked)}
                  />
                }
                label="Mark as Popular"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editPackage?.isRecommended || false}
                    onChange={(e) => handlePackageChange('isRecommended', e.target.checked)}
                  />
                }
                label="Mark as Recommended"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditPackage(null)}>Cancel</Button>
        <Button 
          onClick={handleSavePackage} 
          variant="contained"
          disabled={!editPackage?.name || !editPackage?.price || !editPackage?.description}
        >
          Save Package
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderTemplateDialog = () => (
    <Dialog open={showTemplateDialog} maxWidth="md" fullWidth>
      <DialogTitle>Choose a Service Template</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select a template to get started with pre-configured packages and requirements
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(SERVICE_TEMPLATES).map(([name, template]) => (
            <Grid item xs={12} md={6} key={name}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
                  border: '2px solid transparent'
                }}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.packages.length} packages with professional pricing
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {template.packages.map((pkg, idx) => (
                      <Chip 
                        key={idx} 
                        label={`${pkg.name}: $${pkg.price}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Service Packages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create different service tiers with varying features and pricing
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<AutoAwesome />}
            onClick={() => setShowTemplateDialog(true)}
            variant="outlined"
            size="small"
          >
            Use Template
          </Button>
          <Button
            startIcon={<Add />}
            onClick={handleAddPackage}
            variant="contained"
            size="small"
          >
            Add Package
          </Button>
        </Box>
      </Box>

      {packages.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AutoAwesome sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No packages created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start by adding your first package or use a professional template
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              startIcon={<AutoAwesome />}
              onClick={() => setShowTemplateDialog(true)}
              variant="outlined"
            >
              Use Template
            </Button>
            <Button
              startIcon={<Add />}
              onClick={handleAddPackage}
              variant="contained"
            >
              Create Package
            </Button>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {packages.map((pkg, index) => (
            <Grid item xs={12} md={4} key={index}>
              {renderPackageCard(pkg, index)}
            </Grid>
          ))}
        </Grid>
      )}

      {renderEditDialog()}
      {renderTemplateDialog()}
    </Box>
  );
};
