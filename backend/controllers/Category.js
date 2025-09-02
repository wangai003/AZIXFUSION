const Category = require('../models/Category');

// Get all main categories
exports.getMainCategories = async (req, res) => {
  try {
    const categories = await Category.getMainCategories();
    res.status(200).json({
      success: true,
      data: categories,
      message: 'Main categories retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get subcategories by parent category ID
exports.getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;
    const subcategories = await Category.getSubcategories(parentId);
    res.status(200).json({
      success: true,
      data: subcategories,
      message: 'Subcategories retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get elements by subcategory ID
exports.getElements = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const elements = await Category.getElements(subcategoryId);
    res.status(200).json({
      success: true,
      data: elements,
      message: 'Elements retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get full category hierarchy
exports.getFullHierarchy = async (req, res) => {
  try {
    const hierarchy = await Category.getFullHierarchy();
    res.status(200).json({
      success: true,
      data: hierarchy,
      message: 'Category hierarchy retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get category path (breadcrumb)
exports.getCategoryPath = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const path = await Category.getCategoryPath(categoryId);
    res.status(200).json({
      success: true,
      data: path,
      message: 'Category path retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get category by slug
exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.getBySlug(slug);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category,
      message: 'Category retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get categories by type
exports.getByType = async (req, res) => {
  try {
    const { type } = req.params;
    const categories = await Category.getByType(type);
    res.status(200).json({
      success: true,
      data: categories,
      message: `${type} categories retrieved successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get categories by level
exports.getByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const categories = await Category.getByLevel(parseInt(level));
    res.status(200).json({
      success: true,
      data: categories,
      message: `Level ${level} categories retrieved successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search categories
exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const results = await Category.search(q.trim());
    res.status(200).json({
      success: true,
      data: results,
      message: `Found ${results.length} categories matching "${q}"`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get category statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = await Category.getStatistics();
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Category statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new category
exports.create = async (req, res) => {
  try {
    const categoryData = req.body;
    const category = await Category.create(categoryData);
    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a category
exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const category = await Category.updateById(id, updateData);
    res.status(200).json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a category
exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.deleteById(id);
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all categories (for backward compatibility)
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }, { sort: { sortOrder: 1, name: 1 } });
    res.status(200).json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get category by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    res.status(200).json({
      success: true,
      data: category,
      message: 'Category retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk create categories (for seeding)
exports.bulkCreate = async (req, res) => {
  try {
    const { categories } = req.body;
    
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Categories array is required'
      });
    }
    
    const createdCategories = [];
    for (const categoryData of categories) {
      try {
        const category = await Category.create(categoryData);
        createdCategories.push(category);
      } catch (error) {
        console.error(`Error creating category ${categoryData.name}:`, error.message);
      }
    }
    
    res.status(201).json({
      success: true,
      data: createdCategories,
      message: `Successfully created ${createdCategories.length} out of ${categories.length} categories`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Clear all categories (for resetting)
exports.clearAll = async (req, res) => {
  try {
    const existingCategories = await Category.find({});
    let deletedCount = 0;
    
    for (const category of existingCategories) {
      try {
        await Category.deleteById(category._id);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting category ${category.name}:`, error.message);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCount} categories`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};