const createFirebaseAdapter = require('../utils/FirebaseAdapter');

class ExportProduct {
  constructor() {
    this.adapter = createFirebaseAdapter('export_products');
  }

  // Create a new export product
  async create(productData) {
    try {
      const product = {
        // Basic Information
        title: productData.title,
        description: productData.description,
        category: productData.category,
        subcategory: productData.subcategory,

        // Exporter Information
        exporterId: productData.exporterId,
        exporterInfo: productData.exporterInfo,

        // Product Details
        sku: productData.sku,
        brand: productData.brand,
        model: productData.model,
        specifications: productData.specifications || {},

        // Pricing & Trade
        wholesalePrice: productData.wholesalePrice,
        minimumOrderQuantity: productData.minimumOrderQuantity || 1,
        unit: productData.unit || 'pieces',
        currency: productData.currency || 'USD',
        pricingTiers: productData.pricingTiers || [],

        // Export Information
        targetMarkets: productData.targetMarkets || [],
        certifications: productData.certifications || [],
        complianceStandards: productData.complianceStandards || [],
        shippingTerms: productData.shippingTerms || 'FOB',
        paymentTerms: productData.paymentTerms || 'LC',

        // Logistics
        packaging: productData.packaging,
        weight: productData.weight,
        dimensions: productData.dimensions,
        originCountry: productData.originCountry || 'Kenya',
        portOfOrigin: productData.portOfOrigin,

        // Supply Chain
        leadTime: productData.leadTime,
        productionCapacity: productData.productionCapacity,
        stockAvailability: productData.stockAvailability || 'available',

        // Media
        images: productData.images || [],
        videos: productData.videos || [],
        documents: productData.documents || [],

        // Status & Visibility
        status: productData.status || 'active',
        visibility: productData.visibility || 'public',
        featured: productData.featured || false,

        // Analytics
        views: 0,
        inquiries: 0,
        orders: 0,

        // Metadata
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: productData.createdBy || productData.exporterId,
        isDeleted: false
      };

      return await this.adapter.create(product);
    } catch (error) {
      throw new Error(`Error creating export product: ${error.message}`);
    }
  }

  // Get product by ID
  async getById(id) {
    try {
      const product = await this.adapter.findById(id);
      if (!product) return null;

      // Add computed properties
      product.averageRating = await this.calculateAverageRating(id);
      product.totalReviews = await this.getTotalReviews(id);

      return product;
    } catch (error) {
      throw new Error(`Error fetching export product: ${error.message}`);
    }
  }

  // Update product
  async updateById(id, updateData) {
    try {
      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      return await this.adapter.updateById(id, update);
    } catch (error) {
      throw new Error(`Error updating export product: ${error.message}`);
    }
  }

  // Delete product (soft delete)
  async deleteById(id) {
    try {
      return await this.updateById(id, { isDeleted: true });
    } catch (error) {
      throw new Error(`Error deleting export product: ${error.message}`);
    }
  }

  // Find products with filters
  async find(filters = {}, options = {}) {
    try {
      const { sort = { createdAt: -1 }, limit = 0, skip = 0 } = options;

      // Add default filter for non-deleted products
      const searchFilters = {
        isDeleted: false,
        ...filters
      };

      return await this.adapter.find(searchFilters, sort, limit, skip);
    } catch (error) {
      throw new Error(`Error finding export products: ${error.message}`);
    }
  }

  // Find products by exporter
  async findByExporter(exporterId, options = {}) {
    try {
      const filters = {
        exporterId,
        isDeleted: false
      };

      return await this.find(filters, options);
    } catch (error) {
      throw new Error(`Error finding products by exporter: ${error.message}`);
    }
  }

  // Find featured products
  async findFeatured(options = {}) {
    try {
      const filters = {
        featured: true,
        status: 'active',
        isDeleted: false
      };

      return await this.find(filters, options);
    } catch (error) {
      throw new Error(`Error finding featured products: ${error.message}`);
    }
  }

  // Find products by category
  async findByCategory(category, subcategory = null, options = {}) {
    try {
      const filters = {
        category,
        status: 'active',
        isDeleted: false
      };

      if (subcategory) {
        filters.subcategory = subcategory;
      }

      return await this.find(filters, options);
    } catch (error) {
      throw new Error(`Error finding products by category: ${error.message}`);
    }
  }

  // Search products
  async searchProducts(searchQuery, filters = {}) {
    try {
      const searchFilters = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { brand: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } },
          { subcategory: { $regex: searchQuery, $options: 'i' } }
        ],
        status: 'active',
        isDeleted: false,
        ...filters
      };

      return await this.find(searchFilters);
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }

  // Update product analytics
  async updateAnalytics(productId, field, increment = 1) {
    try {
      const updateData = {};
      updateData[field] = { $inc: increment };
      return await this.updateById(productId, updateData);
    } catch (error) {
      throw new Error(`Error updating product analytics: ${error.message}`);
    }
  }

  // Helper methods
  async calculateAverageRating(productId) {
    // This would require a reviews collection
    // For now, return a placeholder
    return 4.5;
  }

  async getTotalReviews(productId) {
    // This would require a reviews collection
    // For now, return a placeholder
    return 12;
  }

  // Count documents
  async countDocuments(filters = {}) {
    try {
      return await this.adapter.countDocuments(filters);
    } catch (error) {
      throw new Error(`Error counting export products: ${error.message}`);
    }
  }
}

// Export the class, not an instance
module.exports = ExportProduct;