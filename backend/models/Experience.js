const createFirebaseAdapter = require('../utils/FirebaseAdapter');

class Experience {
  constructor() {
    this.adapter = createFirebaseAdapter('experiences');
  }

  // Create a new experience
  async create(experienceData) {
    try {
      const experience = {
        // Basic Information
        title: experienceData.title,
        description: experienceData.description,
        category: experienceData.category,
        subcategory: experienceData.subcategory,

        // Host Information
        hostId: experienceData.hostId,
        hostName: experienceData.hostName || '',
        hostRating: experienceData.hostRating || 0,
        totalBookings: experienceData.totalBookings || 0,

        // Experience Details
        duration: experienceData.duration, // in hours
        maxParticipants: experienceData.maxParticipants || 10,
        minParticipants: experienceData.minParticipants || 1,
        ageRestriction: experienceData.ageRestriction || null,
        difficulty: experienceData.difficulty || 'easy', // easy, moderate, challenging
        languages: experienceData.languages || ['English'],

        // Pricing
        basePrice: experienceData.basePrice,
        currency: experienceData.currency || 'USD',
        pricingType: experienceData.pricingType || 'per_person', // per_person, fixed_group
        priceIncludes: experienceData.priceIncludes || [],
        priceExcludes: experienceData.priceExcludes || [],

        // Location & Logistics
        location: {
          country: experienceData.location?.country || 'Kenya',
          city: experienceData.location?.city || '',
          address: experienceData.location?.address || '',
          coordinates: experienceData.location?.coordinates || null,
          meetingPoint: experienceData.location?.meetingPoint || ''
        },
        transportation: experienceData.transportation || 'not_included', // included, not_included, optional
        accessibility: experienceData.accessibility || [],

        // Schedule & Availability
        availability: experienceData.availability || {
          daysOfWeek: ['saturday', 'sunday'],
          timeSlots: ['09:00', '14:00'],
          blackoutDates: [],
          seasonalAvailability: 'year_round'
        },

        // Media
        images: experienceData.images || [],
        videos: experienceData.videos || [],
        featuredImage: experienceData.featuredImage || '',

        // What to Bring & Requirements
        whatToBring: experienceData.whatToBring || [],
        requirements: experienceData.requirements || [],
        cancellationPolicy: experienceData.cancellationPolicy || 'flexible',
        bookingDeadline: experienceData.bookingDeadline || 24, // hours before

        // Experience Content
        itinerary: experienceData.itinerary || [],
        highlights: experienceData.highlights || [],
        includedActivities: experienceData.includedActivities || [],

        // Tags & SEO
        tags: experienceData.tags || [],
        seoKeywords: experienceData.seoKeywords || [],

        // Status & Settings
        isActive: experienceData.isActive !== undefined ? experienceData.isActive : true,
        isFeatured: experienceData.isFeatured || false,
        verificationStatus: experienceData.verificationStatus || 'pending',

        // Metadata
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: experienceData.createdBy || experienceData.hostId
      };

      return await this.adapter.create(experience);
    } catch (error) {
      throw new Error(`Error creating experience: ${error.message}`);
    }
  }

  // Get experience by ID
  async getById(id) {
    try {
      const experience = await this.adapter.findById(id);
      if (!experience) return null;

      // Add virtual properties
      experience.isAvailable = this.isAvailable(experience);
      experience.averageRating = await this.calculateAverageRating(id);

      return experience;
    } catch (error) {
      throw new Error(`Error fetching experience: ${error.message}`);
    }
  }

  // Update experience
  async updateById(id, updateData) {
    try {
      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      return await this.adapter.updateById(id, update);
    } catch (error) {
      throw new Error(`Error updating experience: ${error.message}`);
    }
  }

  // Find experiences with filters
  async find(filters = {}, options = {}) {
    try {
      const { sort = { createdAt: -1 }, limit = 0, skip = 0 } = options;

      // Add default filter for active experiences
      const searchFilters = {
        isActive: true,
        ...filters
      };

      return await this.adapter.find(searchFilters, sort, limit, skip);
    } catch (error) {
      throw new Error(`Error finding experiences: ${error.message}`);
    }
  }

  // Find experiences by host
  async findByHost(hostId, options = {}) {
    try {
      const filters = {
        hostId,
        isActive: true
      };

      return await this.find(filters, options);
    } catch (error) {
      throw new Error(`Error finding experiences by host: ${error.message}`);
    }
  }

  // Find experiences by category
  async findByCategory(category, subcategory = null, options = {}) {
    try {
      const filters = {
        category,
        isActive: true
      };

      if (subcategory) {
        filters.subcategory = subcategory;
      }

      return await this.find(filters, options);
    } catch (error) {
      throw new Error(`Error finding experiences by category: ${error.message}`);
    }
  }

  // Search experiences
  async searchExperiences(searchQuery, filters = {}) {
    try {
      const searchFilters = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { tags: { $in: [new RegExp(searchQuery, 'i')] } },
          { highlights: { $in: [new RegExp(searchQuery, 'i')] } }
        ],
        isActive: true,
        ...filters
      };

      return await this.find(searchFilters);
    } catch (error) {
      throw new Error(`Error searching experiences: ${error.message}`);
    }
  }

  // Get featured experiences
  async findFeatured(options = {}) {
    try {
      const filters = {
        isFeatured: true,
        isActive: true,
        verificationStatus: 'verified'
      };

      return await this.find(filters, options);
    } catch (error) {
      throw new Error(`Error finding featured experiences: ${error.message}`);
    }
  }

  // Check if experience is available for booking
  isAvailable(experience) {
    const now = new Date();
    // Add logic to check availability based on schedule, capacity, etc.
    return experience.isActive && experience.verificationStatus === 'verified';
  }

  // Calculate average rating (placeholder - would need reviews system)
  async calculateAverageRating(experienceId) {
    // Placeholder - would calculate from reviews collection
    return 4.5;
  }

  // Count documents
  async countDocuments(filters = {}) {
    try {
      return await this.adapter.countDocuments(filters);
    } catch (error) {
      throw new Error(`Error counting experiences: ${error.message}`);
    }
  }
}

module.exports = Experience;