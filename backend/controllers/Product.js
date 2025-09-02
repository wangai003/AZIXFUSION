const Product = require('../models/Product');

// Create a Product instance
const productModel = new Product();

// Get all products with filters
exports.getAll = async (req, res) => {
  try {
    const filters = {};
    
    // Apply goods seller filter
    if (req.query.isGoodsSellerProduct === 'true') {
      filters['isGoodsSellerProduct'] = true;
    }
    
    // Apply seller filter - this is for fetchSellerProducts
    if (req.query.seller) {
      filters['creatorId'] = req.query.seller;
      console.log('🔍 Product controller - seller filter applied:', req.query.seller);
    }
    
    // Apply user filter - this is for showing user's own products
    if (req.query.user === 'true' && req.user && req.user._id) {
      filters['creatorId'] = req.user._id;
      console.log('🔍 Product controller - user filter applied:', req.user._id);
    }
    
    // Apply search filter
    if (req.query.search) {
      filters['title'] = { $regex: req.query.search, $options: 'i' };
    }
    
    // Apply category filters
    if (req.query.category) {
      filters['category'] = req.query.category;
    }
    
    if (req.query.subcategory) {
      filters['subcategory'] = req.query.subcategory;
    }
    
    if (req.query.element) {
      filters['element'] = req.query.element;
    }
    
    // Apply brand filter
    if (req.query.brand) {
      filters['brand'] = req.query.brand;
    }
    
    // Apply price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filters['price'] = {};
      if (req.query.minPrice) filters['price']['$gte'] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filters['price']['$lte'] = parseFloat(req.query.maxPrice);
    }
    
    // Apply other filters
    if (req.query.inStock === 'true') {
      filters['stockQuantity'] = { $gt: 0 };
    }
    
    if (req.query.onSale === 'true') {
      filters['onSale'] = true;
    }
    
    if (req.query.featured === 'true') {
      filters['featured'] = true;
    }
    
    // Apply pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Apply sorting
    let sort = {};
    if (req.query.sort) {
      const sortData = JSON.parse(req.query.sort);
      sort[sortData.sort] = sortData.order === 'asc' ? 1 : -1;
    } else {
      sort = { createdAt: -1 }; // Default sort by newest first
    }
    
    console.log('🔍 Product controller - filters:', JSON.stringify(filters, null, 2));
    console.log('🔍 Product controller - options:', JSON.stringify({ sort, skip, limit }, null, 2));
    console.log('🔍 Product controller - query params:', req.query);
    
    const products = await productModel.find(filters, { 
      sort, 
      skip, 
      limit 
    });
    
    console.log('🔍 Product controller - products found:', products ? products.length : 'null');
    if (products && products.length > 0) {
      console.log('🔍 Product controller - first product creatorId:', products[0].creatorId);
    }
    
    const totalResults = await productModel.countDocuments(filters);
    
    console.log('🔍 Product controller - total results:', totalResults);
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        totalResults,
        totalPages: Math.ceil(totalResults / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured products with highest ratings
exports.getFeatured = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    // Get products that are either featured or have high ratings
    const featuredProducts = await productModel.find({
      $or: [
        { featured: true, isDeleted: false },
        { rating: { $gte: 4 } }, // Products with 4+ star rating
        { reviewCount: { $gte: 5 } } // Products with at least 5 reviews
      ]
    }, {
      sort: { 
        rating: -1,           // Sort by highest rating first
        reviewCount: -1,      // Then by number of reviews
        featured: -1,         // Then by featured status
        createdAt: -1         // Finally by newest
      },
      limit: limit
    });
    
    res.status(200).json({
      success: true,
      data: featuredProducts,
      totalResults: featuredProducts.length
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by main category
exports.getByMainCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await productModel.getProductsByCategory(categoryId, 'main');
    
    res.status(200).json({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by subcategory
exports.getBySubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const products = await productModel.getProductsByCategory(subcategoryId, 'sub');
    
    res.status(200).json({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by element
exports.getByElement = async (req, res) => {
  try {
    const { elementId } = req.params;
    const products = await productModel.getProductsByCategory(elementId, 'element');
    
    res.status(200).json({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new product
exports.create = async (req, res) => {
  try {
    const productData = req.body;
    
    // Set goods seller flags - accept any authenticated user creating a product
    if (req.user && req.user._id) {
      productData.isGoodsSellerProduct = true;
      productData.creatorId = req.user._id;
      productData.creatorName = req.user.name || req.user.username || 'Unknown';
      productData.creatorType = 'goods_seller';
      
      console.log('🔍 Product controller - create - setting creatorId:', req.user._id);
      console.log('🔍 Product controller - create - setting isGoodsSellerProduct: true');
    }
    
    console.log('🔍 Product controller - create - final productData:', JSON.stringify(productData, null, 2));
    
    const product = await productModel.create(productData);
    
    console.log('🔍 Product controller - create - created product:', JSON.stringify(product, null, 2));
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Product controller - getById - requested ID:', id);
    
    const product = await productModel.getById(id);
    console.log('🔍 Product controller - getById - product found:', product ? 'Yes' : 'No');
    
    if (!product) {
      console.log('🔍 Product controller - getById - product not found');
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log('🔍 Product controller - getById - product data:', {
      id: product._id,
      title: product.title,
      images: product.images,
      imagesCount: product.images ? product.images.length : 0
    });
    
    res.status(200).json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Product controller - getById - error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product
exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const product = await productModel.updateById(id, updateData);
    
    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product
exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    await productModel.deleteById(id);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search products
exports.search = async (req, res) => {
  try {
    const { q: searchQuery } = req.query;
    
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const products = await productModel.searchProducts(searchQuery);
    
    res.status(200).json({
      success: true,
      data: products,
      message: 'Products found successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


