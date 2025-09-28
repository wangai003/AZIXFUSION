const ExportProduct = require('../models/ExportProduct');
const User = require('../models/User');

// Create instance of the model class
const exportProductModel = new ExportProduct();

// Create a new export product
exports.createExportProduct = async (req, res) => {
  try {
    const productData = req.body;
    const exporterId = req.user._id;

    // Validate required fields
    if (!productData.title || !productData.description || !productData.category || !productData.wholesalePrice) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and wholesale price are required'
      });
    }

    // Get exporter info
    const exporter = await User.findById(exporterId);
    const exporterInfo = {
      name: exporter?.name || exporter?.username || 'Anonymous Exporter',
      companyName: exporter?.exporterProfile?.companyName || '',
      rating: exporter?.exporterProfile?.rating || 0,
      totalExports: exporter?.exporterProfile?.totalExports || 0
    };

    // Create product data
    const productPayload = {
      ...productData,
      exporterId,
      exporterInfo,
      createdBy: exporterId,
      status: 'active', // Export products are active by default
      visibility: 'public' // Public by default
    };

    const product = await exportProductModel.create(productPayload);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Export product created successfully'
    });

  } catch (error) {
    console.error('Error creating export product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating export product'
    });
  }
};

// Get all export products with filters
exports.getAllExportProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      targetMarket,
      minPrice,
      maxPrice,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filters = {
      status: 'active',
      visibility: 'public'
    };

    if (category) filters.category = category;
    if (subcategory) filters.subcategory = subcategory;
    if (targetMarket) filters.targetMarkets = { $in: [targetMarket] };

    if (minPrice || maxPrice) {
      filters.wholesalePrice = {};
      if (minPrice) filters.wholesalePrice.$gte = parseFloat(minPrice);
      if (maxPrice) filters.wholesalePrice.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await exportProductModel.find(filters, {
      sort: sortObj,
      limit: parseInt(limit),
      skip
    });

    const total = await exportProductModel.countDocuments(filters);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching export products:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching export products'
    });
  }
};

// Get export product by ID
exports.getExportProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await exportProductModel.getById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Export product not found'
      });
    }

    // Update view count
    await exportProductModel.updateAnalytics(id, 'views');

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching export product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching export product'
    });
  }
};

// Update export product
exports.updateExportProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    const product = await exportProductModel.getById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Export product not found'
      });
    }

    // Check if user is the exporter
    if (product.exporterId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Update product
    const updatedProduct = await exportProductModel.updateById(id, updates);

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Export product updated successfully'
    });

  } catch (error) {
    console.error('Error updating export product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating export product'
    });
  }
};

// Delete export product
exports.deleteExportProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const product = await exportProductModel.getById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Export product not found'
      });
    }

    // Check if user is the exporter
    if (product.exporterId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await exportProductModel.deleteById(id);

    res.json({
      success: true,
      message: 'Export product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting export product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting export product'
    });
  }
};

// Get exporter's products
exports.getExporterProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const filters = { exporterId: userId };
    if (status) filters.status = status;

    const products = await exportProductModel.find(filters, {
      sort: { createdAt: -1 }
    });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error fetching exporter products:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching exporter products'
    });
  }
};

// Get featured export products
exports.getFeaturedExportProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await exportProductModel.findFeatured({
      limit,
      sort: { createdAt: -1 }
    });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error fetching featured export products:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching featured export products'
    });
  }
};

// Get export products by category
exports.getExportProductsByCategory = async (req, res) => {
  try {
    const { category, subcategory } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const products = await exportProductModel.findByCategory(
      category,
      subcategory,
      {
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        sort: { createdAt: -1 }
      }
    );

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products by category'
    });
  }
};

// Search export products
exports.searchExportProducts = async (req, res) => {
  try {
    const { q: searchQuery } = req.query;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await exportProductModel.searchProducts(searchQuery);

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error searching export products:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching export products'
    });
  }
};

// Submit inquiry for export product
exports.submitProductInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, quantity, requirements } = req.body;
    const userId = req.user._id;

    const product = await exportProductModel.getById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Export product not found'
      });
    }

    // Update inquiry count
    await exportProductModel.updateAnalytics(id, 'inquiries');

    // Here you would typically send an email or create an inquiry record
    // For now, just return success

    res.json({
      success: true,
      message: 'Inquiry submitted successfully. The exporter will contact you soon.'
    });

  } catch (error) {
    console.error('Error submitting product inquiry:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting inquiry'
    });
  }
};

// Get export product analytics
exports.getProductAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const product = await exportProductModel.getById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Export product not found'
      });
    }

    // Check if user is the exporter
    if (product.exporterId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics'
      });
    }

    res.json({
      success: true,
      data: {
        views: product.views,
        inquiries: product.inquiries,
        orders: product.orders
      }
    });

  } catch (error) {
    console.error('Error fetching product analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching analytics'
    });
  }
};