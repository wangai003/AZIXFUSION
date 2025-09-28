const Experience = require('../models/Experience');
const User = require('../models/User');

// Create instance of the model class
const experienceModel = new Experience();

// Create a new experience
exports.createExperience = async (req, res) => {
  try {
    const experienceData = req.body;
    const hostId = req.user._id;

    // Validate experience data
    if (!experienceData.title || !experienceData.description || !experienceData.category ||
        !experienceData.subcategory || !experienceData.basePrice) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, subcategory, and base price are required'
      });
    }

    // Validate pricing
    if (parseFloat(experienceData.basePrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Base price must be greater than 0'
      });
    }

    // Validate duration
    if (!experienceData.duration || parseFloat(experienceData.duration) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid duration is required'
      });
    }

    // Get host info
    const host = await User.findById(hostId);
    const hostInfo = {
      name: host?.name || host?.username || 'Anonymous Host',
      rating: host?.hostRating || host?.rating || 0,
      totalBookings: host?.totalBookings || host?.totalSales || 0
    };

    // Create experience data
    const experiencePayload = {
      ...experienceData,
      hostId,
      hostName: hostInfo.name,
      hostRating: hostInfo.rating,
      totalBookings: hostInfo.totalBookings,
      createdBy: hostId,
      basePrice: parseFloat(experienceData.basePrice),
      duration: parseFloat(experienceData.duration),
      maxParticipants: parseInt(experienceData.maxParticipants) || 10,
      minParticipants: parseInt(experienceData.minParticipants) || 1,
      verificationStatus: 'pending', // All new experiences start as pending verification
      isActive: false // Not active until verified
    };

    console.log('Creating experience with payload:', experiencePayload);

    const experience = await experienceModel.create(experiencePayload);

    res.status(201).json({
      success: true,
      data: experience,
      message: 'Experience created successfully and is pending verification'
    });

  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating experience'
    });
  }
};

// Get all experiences with filters
exports.getAllExperiences = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      minPrice,
      maxPrice,
      difficulty,
      duration,
      search,
      sort = 'createdAt',
      order = 'desc',
      verified = true
    } = req.query;

    // Build filter object
    const filters = {};

    if (category) filters.category = category;
    if (subcategory) filters.subcategory = subcategory;
    if (difficulty) filters.difficulty = difficulty;
    if (verified === 'true') filters.verificationStatus = 'verified';

    if (minPrice || maxPrice) {
      filters.basePrice = {};
      if (minPrice) filters.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) filters.basePrice.$lte = parseFloat(maxPrice);
    }

    if (duration) {
      filters.duration = { $lte: parseFloat(duration) };
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const experiences = await experienceModel.find(filters, {
      sort: sortObj,
      limit: parseInt(limit),
      skip
    });

    const total = await experienceModel.countDocuments(filters);

    res.json({
      success: true,
      data: experiences,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching experiences'
    });
  }
};

// Get experience by ID
exports.getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await experienceModel.getById(id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    res.json({
      success: true,
      data: experience
    });

  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching experience'
    });
  }
};

// Update experience
exports.updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    const experience = await experienceModel.getById(id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Check if user is the host
    if (experience.hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this experience'
      });
    }

    // Prevent updates if experience is verified and active
    if (experience.verificationStatus === 'verified' && experience.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update verified and active experiences. Please contact support.'
      });
    }

    const updatedExperience = await experienceModel.updateById(id, updates);

    res.json({
      success: true,
      data: updatedExperience,
      message: 'Experience updated successfully'
    });

  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating experience'
    });
  }
};

// Delete experience
exports.deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const experience = await experienceModel.getById(id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Check if user is the host
    if (experience.hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this experience'
      });
    }

    // Prevent deletion if experience has bookings
    if (experience.totalBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete experience with existing bookings'
      });
    }

    await experienceModel.updateById(id, { isActive: false });

    res.json({
      success: true,
      message: 'Experience deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting experience'
    });
  }
};

// Get experiences by host
exports.getHostExperiences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const filters = { hostId: userId };
    if (status) filters.verificationStatus = status;

    const experiences = await experienceModel.find(filters, {
      sort: { createdAt: -1 }
    });

    res.json({
      success: true,
      data: experiences
    });

  } catch (error) {
    console.error('Error fetching host experiences:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching host experiences'
    });
  }
};

// Get featured experiences
exports.getFeaturedExperiences = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const experiences = await experienceModel.findFeatured({
      sort: { totalBookings: -1, createdAt: -1 },
      limit
    });

    res.json({
      success: true,
      data: experiences
    });

  } catch (error) {
    console.error('Error fetching featured experiences:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching featured experiences'
    });
  }
};

// Get experiences by category
exports.getExperiencesByCategory = async (req, res) => {
  try {
    const { category, subcategory } = req.params;

    const experiences = await experienceModel.findByCategory(category, subcategory, {
      sort: { isFeatured: -1, totalBookings: -1 }
    });

    res.json({
      success: true,
      data: experiences
    });

  } catch (error) {
    console.error('Error fetching experiences by category:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching experiences by category'
    });
  }
};

// Search experiences
exports.searchExperiences = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const experiences = await experienceModel.searchExperiences(q);

    res.json({
      success: true,
      data: experiences
    });

  } catch (error) {
    console.error('Error searching experiences:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching experiences'
    });
  }
};