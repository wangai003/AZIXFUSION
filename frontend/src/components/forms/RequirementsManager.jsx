import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
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
  Paper,
  Alert,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  ContentCopy,
  AutoAwesome,
  Help,
  Info,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { SERVICE_TEMPLATES } from '../../config/serviceCategories';

export const RequirementsManager = ({ 
  requirements, 
  onChange, 
  category,
  faq,
  onFaqChange 
}) => {
  const [editRequirement, setEditRequirement] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const [editFaq, setEditFaq] = useState(null);
  const [editFaqIndex, setEditFaqIndex] = useState(-1);

  const requirementTypes = [
    { value: 'text', label: 'Text Input', description: 'Free text response' },
    { value: 'file', label: 'File Upload', description: 'Document or image upload' },
    { value: 'choice', label: 'Multiple Choice', description: 'Select from options' },
    { value: 'number', label: 'Number Input', description: 'Numeric value' },
    { value: 'date', label: 'Date Selection', description: 'Calendar date picker' }
  ];

  const defaultRequirement = {
    question: '',
    description: '',
    type: 'text',
    required: true,
    placeholder: '',
    options: [],
    validation: ''
  };

  const defaultFaq = {
    question: '',
    answer: '',
    category: 'general'
  };

  const faqCategories = [
    { value: 'general', label: 'General Questions' },
    { value: 'pricing', label: 'Pricing & Payment' },
    { value: 'delivery', label: 'Delivery & Timeline' },
    { value: 'revisions', label: 'Revisions & Changes' },
    { value: 'technical', label: 'Technical Details' },
    { value: 'support', label: 'Support & Communication' }
  ];

  // Smart requirement suggestions based on category
  const getSmartSuggestions = (category) => {
    const suggestions = {
      'Graphic Design': [
        'Project description and goals',
        'Target audience information',
        'Brand guidelines (if applicable)',
        'Reference examples or inspiration',
        'Preferred color scheme',
        'File format requirements',
        'Dimensions and specifications',
        'Timeline and deadlines'
      ],
      'Web Development': [
        'Project scope and requirements',
        'Design preferences and mockups',
        'Content and copy',
        'Hosting and domain information',
        'Third-party integrations needed',
        'Performance requirements',
        'Browser compatibility needs',
        'Mobile responsiveness requirements'
      ],
      'Writing & Translation': [
        'Topic or subject matter',
        'Target audience',
        'Tone and style preferences',
        'Word count requirements',
        'Reference materials',
        'Deadline requirements',
        'Format specifications',
        'SEO requirements (if applicable)'
      ]
    };

    // Find matching category
    for (const [key, value] of Object.entries(suggestions)) {
      if (category?.includes(key)) {
        return value;
      }
    }
    return [];
  };

  const handleAddRequirement = () => {
    const newRequirement = { ...defaultRequirement };
    onChange([...requirements, newRequirement]);
  };

  const handleEditRequirement = (index) => {
    setEditIndex(index);
    setEditRequirement({ ...requirements[index] });
  };

  const handleSaveRequirement = () => {
    if (editIndex >= 0) {
      const updatedRequirements = [...requirements];
      updatedRequirements[editIndex] = editRequirement;
      onChange(updatedRequirements);
    } else {
      onChange([...requirements, editRequirement]);
    }
    setEditRequirement(null);
    setEditIndex(-1);
  };

  const handleDeleteRequirement = (index) => {
    const updatedRequirements = requirements.filter((_, i) => i !== index);
    onChange(updatedRequirements);
  };

  const handleRequirementChange = (field, value) => {
    setEditRequirement(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOption = () => {
    setEditRequirement(prev => ({ 
      ...prev, 
      options: [...(prev.options || []), ''] 
    }));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...editRequirement.options];
    updatedOptions[index] = value;
    setEditRequirement(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = editRequirement.options.filter((_, i) => i !== index);
    setEditRequirement(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleTemplateSelect = (template) => {
    setShowTemplateDialog(false);
    
    // Apply template requirements
    if (template.requirements) {
      const templateRequirements = template.requirements.map(req => ({
        question: req,
        description: `Please provide: ${req}`,
        type: 'text',
        required: true,
        placeholder: `Enter ${req.toLowerCase()}`,
        options: [],
        validation: ''
      }));
      onChange(templateRequirements);
    }
  };

  const handleAddFaq = () => {
    setEditFaqIndex(-1);
    setEditFaq({ ...defaultFaq });
    setShowFaqDialog(true);
  };

  const handleEditFaq = (index) => {
    setEditFaqIndex(index);
    setEditFaq({ ...faq[index] });
    setShowFaqDialog(true);
  };

  const handleSaveFaq = () => {
    if (editFaqIndex >= 0) {
      const updatedFaq = [...faq];
      updatedFaq[editFaqIndex] = editFaq;
      onFaqChange(updatedFaq);
    } else {
      onFaqChange([...faq, editFaq]);
    }
    setEditFaq(null);
    setEditFaqIndex(-1);
    setShowFaqDialog(false);
  };

  const handleDeleteFaq = (index) => {
    const updatedFaq = faq.filter((_, i) => i !== index);
    onFaqChange(updatedFaq);
  };

  const handleFaqChange = (field, value) => {
    setEditFaq(prev => ({ ...prev, [field]: value }));
  };

  const renderRequirementCard = (req, index) => (
    <Card key={index} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {req.question}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {req.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={req.type} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              {req.required && (
                <Chip 
                  label="Required" 
                  size="small" 
                  color="error" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit Requirement">
              <IconButton size="small" onClick={() => handleEditRequirement(index)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Requirement">
              <IconButton size="small" color="error" onClick={() => handleDeleteRequirement(index)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {req.type === 'choice' && req.options && req.options.length > 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Options:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {req.options.map((option, idx) => (
                <Chip key={idx} label={option} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderRequirementDialog = () => (
    <Dialog open={!!editRequirement} maxWidth="md" fullWidth>
      <DialogTitle>
        {editIndex >= 0 ? 'Edit Requirement' : 'Add New Requirement'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Question *"
              value={editRequirement?.question || ''}
              onChange={(e) => handleRequirementChange('question', e.target.value)}
              placeholder="e.g., What is your project about?"
              helperText="Ask a clear, specific question to get the information you need"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={editRequirement?.description || ''}
              onChange={(e) => handleRequirementChange('description', e.target.value)}
              placeholder="Additional context or instructions for the client"
              helperText="Provide helpful context to guide the client's response"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Input Type *</InputLabel>
              <Select
                value={editRequirement?.type || 'text'}
                onChange={(e) => handleRequirementChange('type', e.target.value)}
                label="Input Type *"
              >
                {requirementTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box>
                      <Typography variant="body1">{type.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={editRequirement?.required || false}
                  onChange={(e) => handleRequirementChange('required', e.target.checked)}
                />
              }
              label="Required Field"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Placeholder Text"
              value={editRequirement?.placeholder || ''}
              onChange={(e) => handleRequirementChange('placeholder', e.target.value)}
              placeholder="e.g., Describe your project goals..."
              helperText="Text that appears in the input field to guide the client"
            />
          </Grid>
          {editRequirement?.type === 'choice' && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Choice Options
                </Typography>
                <Button startIcon={<Add />} onClick={handleAddOption} size="small">
                  Add Option
                </Button>
              </Box>
              {editRequirement.options?.map((option, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Option ${idx + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder="Enter option text"
                  />
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleRemoveOption(idx)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditRequirement(null)}>Cancel</Button>
        <Button 
          onClick={handleSaveRequirement} 
          variant="contained"
          disabled={!editRequirement?.question || !editRequirement?.type}
        >
          Save Requirement
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderTemplateDialog = () => (
    <Dialog open={showTemplateDialog} maxWidth="md" fullWidth>
      <DialogTitle>Choose a Requirements Template</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select a template to get started with pre-configured requirements
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
                    {template.requirements?.length || 0} pre-configured requirements
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {template.requirements?.slice(0, 3).map((req, idx) => (
                      <Chip 
                        key={idx} 
                        label={req} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    ))}
                    {template.requirements?.length > 3 && (
                      <Chip 
                        label={`+${template.requirements.length - 3} more`} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    )}
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

  const renderFaqDialog = () => (
    <Dialog open={showFaqDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {editFaqIndex >= 0 ? 'Edit FAQ' : 'Add New FAQ'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>FAQ Category</InputLabel>
              <Select
                value={editFaq?.category || 'general'}
                onChange={(e) => handleFaqChange('category', e.target.value)}
                label="FAQ Category"
              >
                {faqCategories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Question *"
              value={editFaq?.question || ''}
              onChange={(e) => handleFaqChange('question', e.target.value)}
              placeholder="What clients commonly ask about..."
              helperText="Write a clear, specific question that clients often ask"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Answer *"
              multiline
              rows={4}
              value={editFaq?.answer || ''}
              onChange={(e) => handleFaqChange('answer', e.target.value)}
              placeholder="Provide a helpful, detailed answer..."
              helperText="Give a comprehensive answer that addresses the question fully"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowFaqDialog(false)}>Cancel</Button>
        <Button 
          onClick={handleSaveFaq} 
          variant="contained"
          disabled={!editFaq?.question || !editFaq?.answer}
        >
          Save FAQ
        </Button>
      </DialogActions>
    </Dialog>
  );

  const smartSuggestions = getSmartSuggestions(category);

  return (
    <Box>
      {/* Requirements Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Client Requirements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define what information you need from clients to deliver their project
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
              onClick={handleAddRequirement}
              variant="contained"
              size="small"
            >
              Add Requirement
            </Button>
          </Box>
        </Box>

        {smartSuggestions.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              💡 Smart Suggestions for {category}:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {smartSuggestions.slice(0, 4).map((suggestion, idx) => (
                <Chip
                  key={idx}
                  label={suggestion}
                  size="small"
                  onClick={() => {
                    const newReq = {
                      ...defaultRequirement,
                      question: suggestion,
                      description: `Please provide: ${suggestion}`,
                      placeholder: `Enter ${suggestion.toLowerCase()}`
                    };
                    onChange([...requirements, newReq]);
                  }}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Alert>
        )}

        {requirements.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Help sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No requirements defined yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start by adding requirements or use a professional template
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
                onClick={handleAddRequirement}
                variant="contained"
              >
                Add Requirement
              </Button>
            </Box>
          </Paper>
        ) : (
          requirements.map((req, index) => renderRequirementCard(req, index))
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* FAQ Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Help clients by answering common questions upfront
            </Typography>
          </Box>
          <Button
            startIcon={<Add />}
            onClick={handleAddFaq}
            variant="outlined"
            size="small"
          >
            Add FAQ
          </Button>
        </Box>

        {faq.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No FAQs added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add common questions and answers to help clients understand your service
            </Typography>
            <Button
              startIcon={<Add />}
              onClick={handleAddFaq}
              variant="contained"
            >
              Add Your First FAQ
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {faq.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip 
                        label={faqCategories.find(c => c.value === item.category)?.label || 'General'} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit FAQ">
                          <IconButton size="small" onClick={() => handleEditFaq(index)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete FAQ">
                          <IconButton size="small" color="error" onClick={() => handleDeleteFaq(index)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {item.question}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.answer}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {renderRequirementDialog()}
      {renderTemplateDialog()}
      {renderFaqDialog()}
    </Box>
  );
};
