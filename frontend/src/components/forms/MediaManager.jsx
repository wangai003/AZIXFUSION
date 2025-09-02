import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Alert,
  Tooltip,
  Slider,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  DragIndicator,
  Visibility,
  VisibilityOff,
  Star,
  StarBorder,
  PhotoCamera,
  VideoLibrary,
  Description,
  AutoAwesome,
  CloudUpload,
  DragHandle
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

export const MediaManager = ({ 
  media, 
  onChange,
  onPortfolioChange,
  portfolio = []
}) => {
  const [editMedia, setEditMedia] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [editPortfolio, setEditPortfolio] = useState(null);
  const [editPortfolioIndex, setEditPortfolioIndex] = useState(-1);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mediaTypes = [
    { value: 'image', label: 'Image', icon: <PhotoCamera /> },
    { value: 'video', label: 'Video', icon: <VideoLibrary /> },
    { value: 'document', label: 'Document', icon: <Description /> }
  ];

  const defaultMedia = {
    file: null,
    url: '',
    type: 'image',
    title: '',
    description: '',
    altText: '',
    isPortfolio: false,
    isFeatured: false,
    order: 0
  };

  const defaultPortfolio = {
    title: '',
    description: '',
    category: '',
    tags: [],
    client: '',
    completionDate: '',
    isPublic: true
  };

  const portfolioCategories = [
    'Web Design',
    'Graphic Design',
    'Logo Design',
    'Branding',
    'UI/UX Design',
    'Print Design',
    'Illustration',
    'Photography',
    'Video Production',
    'Other'
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const newMedia = acceptedFiles.map((file, index) => ({
      ...defaultMedia,
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 'document',
      title: file.name.replace(/\.[^/.]+$/, ''),
      order: media.length + index
    }));

    onChange([...media, ...newMedia]);
  }, [media, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  const handleEditMedia = (index) => {
    setEditIndex(index);
    setEditMedia({ ...media[index] });
  };

  const handleSaveMedia = () => {
    if (editIndex >= 0) {
      const updatedMedia = [...media];
      updatedMedia[editIndex] = editMedia;
      onChange(updatedMedia);
    }
    setEditMedia(null);
    setEditIndex(-1);
  };

  const handleDeleteMedia = (index) => {
    const updatedMedia = media.filter((_, i) => i !== index);
    onChange(updatedMedia);
  };

  const handleMediaChange = (field, value) => {
    setEditMedia(prev => ({ ...prev, [field]: value }));
  };

  const handleReorderMedia = (fromIndex, toIndex) => {
    const updatedMedia = [...media];
    const [movedItem] = updatedMedia.splice(fromIndex, 1);
    updatedMedia.splice(toIndex, 0, movedItem);
    
    // Update order values
    updatedMedia.forEach((item, index) => {
      item.order = index;
    });
    
    onChange(updatedMedia);
  };

  const handleAddPortfolio = () => {
    setEditPortfolioIndex(-1);
    setEditPortfolio({ ...defaultPortfolio });
    setShowPortfolioDialog(true);
  };

  const handleEditPortfolio = (index) => {
    setEditPortfolioIndex(index);
    setEditPortfolio({ ...portfolio[index] });
    setShowPortfolioDialog(true);
  };

  const handleSavePortfolio = () => {
    if (editPortfolioIndex >= 0) {
      const updatedPortfolio = [...portfolio];
      updatedPortfolio[editPortfolioIndex] = editPortfolio;
      onPortfolioChange(updatedPortfolio);
    } else {
      onPortfolioChange([...portfolio, editPortfolio]);
    }
    setEditPortfolio(null);
    setEditPortfolioIndex(-1);
    setShowPortfolioDialog(false);
  };

  const handleDeletePortfolio = (index) => {
    const updatedPortfolio = portfolio.filter((_, i) => i !== index);
    onPortfolioChange(updatedPortfolio);
  };

  const handlePortfolioChange = (field, value) => {
    setEditPortfolio(prev => ({ ...prev, [field]: value }));
  };

  const handleTagChange = (tags) => {
    setEditPortfolio(prev => ({ ...prev, tags: tags.split(',').map(t => t.trim()).filter(t => t) }));
  };

  const renderMediaCard = (item, index) => (
    <Card 
      key={index} 
      sx={{ 
        height: '100%',
        position: 'relative',
        '&:hover': { boxShadow: 4 }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component={item.type === 'video' ? 'video' : 'img'}
          height="200"
          image={item.url}
          alt={item.altText || item.title}
          sx={{ objectFit: 'cover' }}
        />
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          display: 'flex', 
          gap: 0.5 
        }}>
          <Tooltip title="Edit Media">
            <IconButton 
              size="small" 
              onClick={() => handleEditMedia(index)}
              sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Media">
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => handleDeleteMedia(index)}
              sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          left: 8 
        }}>
          <Chip 
            icon={mediaTypes.find(t => t.value === item.type)?.icon}
            label={item.type} 
            size="small" 
            sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          />
        </Box>
        <Box sx={{ 
          position: 'absolute', 
          bottom: 8, 
          left: 8 
        }}>
          <DragHandle sx={{ color: 'white', filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }} />
        </Box>
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={600} noWrap>
          {item.title}
        </Typography>
        {item.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {item.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {item.isPortfolio && (
            <Chip 
              label="Portfolio" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
          {item.isFeatured && (
            <Chip 
              icon={<Star />}
              label="Featured" 
              size="small" 
              color="warning" 
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const renderMediaDialog = () => (
    <Dialog open={!!editMedia} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Media Details
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Title"
              value={editMedia?.title || ''}
              onChange={(e) => handleMediaChange('title', e.target.value)}
              placeholder="Enter media title"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Media Type</InputLabel>
              <Select
                value={editMedia?.type || 'image'}
                onChange={(e) => handleMediaChange('type', e.target.value)}
                label="Media Type"
              >
                {mediaTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={editMedia?.description || ''}
              onChange={(e) => handleMediaChange('description', e.target.value)}
              placeholder="Describe this media item"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Alt Text"
              value={editMedia?.altText || ''}
              onChange={(e) => handleMediaChange('altText', e.target.value)}
              placeholder="Alternative text for accessibility"
              helperText="Important for SEO and screen readers"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editMedia?.isPortfolio || false}
                    onChange={(e) => handleMediaChange('isPortfolio', e.target.checked)}
                  />
                }
                label="Add to Portfolio"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editMedia?.isFeatured || false}
                    onChange={(e) => handleMediaChange('isFeatured', e.target.checked)}
                  />
                }
                label="Mark as Featured"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditMedia(null)}>Cancel</Button>
        <Button onClick={handleSaveMedia} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderPortfolioDialog = () => (
    <Dialog open={showPortfolioDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {editPortfolioIndex >= 0 ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Project Title"
              value={editPortfolio?.title || ''}
              onChange={(e) => handlePortfolioChange('title', e.target.value)}
              placeholder="Enter project title"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editPortfolio?.category || ''}
                onChange={(e) => handlePortfolioChange('category', e.target.value)}
                label="Category"
              >
                {portfolioCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Description"
              multiline
              rows={4}
              value={editPortfolio?.description || ''}
              onChange={(e) => handlePortfolioChange('description', e.target.value)}
              placeholder="Describe the project, your role, and the outcome"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Client Name"
              value={editPortfolio?.client || ''}
              onChange={(e) => handlePortfolioChange('client', e.target.value)}
              placeholder="Client or company name"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Completion Date"
              type="date"
              value={editPortfolio?.completionDate || ''}
              onChange={(e) => handlePortfolioChange('completionDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tags (comma separated)"
              value={editPortfolio?.tags?.join(', ') || ''}
              onChange={(e) => handleTagChange(e.target.value)}
              placeholder="e.g., web design, responsive, modern"
              helperText="Add relevant tags to help clients find your work"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editPortfolio?.isPublic || true}
                  onChange={(e) => handlePortfolioChange('isPublic', e.target.checked)}
                />
              }
              label="Public Portfolio Item"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowPortfolioDialog(false)}>Cancel</Button>
        <Button 
          onClick={handleSavePortfolio} 
          variant="contained"
          disabled={!editPortfolio?.title || !editPortfolio?.description}
        >
          Save Portfolio Item
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      {/* Media Upload Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Media & Portfolio
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload images, videos, and documents to showcase your work
            </Typography>
          </Box>
          <Button
            startIcon={<AutoAwesome />}
            onClick={() => setShowPortfolioDialog(true)}
            variant="outlined"
            size="small"
          >
            Add Portfolio
          </Button>
        </Box>

        {/* Upload Area */}
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            backgroundColor: isDragActive ? 'primary.light' : 'background.paper',
            cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' }
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            or click to select files
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supports: Images (JPEG, PNG, GIF), Videos (MP4, AVI), Documents (PDF, DOC)
          </Typography>
        </Paper>

        {/* Media Grid */}
        {media.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Uploaded Media ({media.length})
            </Typography>
            <Grid container spacing={2}>
              {media.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  {renderMediaCard(item, index)}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Portfolio Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Portfolio Showcase
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Highlight your best work and projects for potential clients
            </Typography>
          </Box>
          <Button
            startIcon={<Add />}
            onClick={handleAddPortfolio}
            variant="contained"
            size="small"
          >
            Add Portfolio Item
          </Button>
        </Box>

        {portfolio.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <AutoAwesome sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No portfolio items yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start building your portfolio to showcase your skills and attract clients
            </Typography>
            <Button
              startIcon={<Add />}
              onClick={handleAddPortfolio}
              variant="contained"
            >
              Add Your First Portfolio Item
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {portfolio.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip 
                        label={item.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit Portfolio">
                          <IconButton size="small" onClick={() => handleEditPortfolio(index)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Portfolio">
                          <IconButton size="small" color="error" onClick={() => handleDeletePortfolio(index)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {item.tags?.map((tag, idx) => (
                        <Chip key={idx} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Client: {item.client}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.completionDate}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {renderMediaDialog()}
      {renderPortfolioDialog()}
    </Box>
  );
};
