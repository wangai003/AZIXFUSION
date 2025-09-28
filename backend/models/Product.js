const createFirebaseAdapter = require('../utils/FirebaseAdapter');

class Product {
  constructor() {
    this.adapter = createFirebaseAdapter('products');
  }

  // Create a new product
  async create(productData) {
    try {
      const product = {
        title: productData.title,
        description: productData.description || '',
        price: productData.price || 0,
        stockQuantity: productData.stockQuantity || 0,
        thumbnail: productData.thumbnail || '',
        images: productData.images || [],
        brand: productData.brand || null,
        category: productData.category || null, // Main category ID
        subcategory: productData.subcategory || null, // Subcategory ID
        element: productData.element || null, // Element ID
        seller: productData.seller || null,
        sellerType: productData.sellerType || 'product', // 'product' or 'service'
        isGoodsSellerProduct: productData.isGoodsSellerProduct || false,
        creatorId: productData.creatorId || null,
        creatorName: productData.creatorName || null,
        creatorType: productData.creatorType || null,
        onSale: productData.onSale || false,
        salePrice: productData.salePrice || null,
        featured: productData.featured || false,
        rating: productData.rating || 0,
        reviewCount: productData.reviewCount || 0,
        isDeleted: productData.isDeleted || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.adapter.create(product);
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  // Get products by category hierarchy
  async getProductsByCategory(categoryId, type = 'main') {
    try {
      let filter = {};
      
      switch (type) {
        case 'main':
          filter = { category: categoryId, isDeleted: false };
          break;
        case 'sub':
          filter = { subcategory: categoryId, isDeleted: false };
          break;
        case 'element':
          filter = { element: categoryId, isDeleted: false };
          break;
        default:
          filter = { category: categoryId, isDeleted: false };
      }

      return await this.adapter.find(filter);
    } catch (error) {
      throw new Error(`Error fetching products by category: ${error.message}`);
    }
  }

  // Get products with full category information
  async getProductsWithCategories(filters = {}) {
    try {
      const products = await this.adapter.find(filters);
      
      // Populate category information if needed
      // This would require additional logic to fetch category details
      
      return products;
    } catch (error) {
      throw new Error(`Error fetching products with categories: ${error.message}`);
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
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Get all products (for backward compatibility)
  async getAll(filters = {}) {
    try {
      return await this.adapter.find(filters);
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  // Get product by ID
  async getById(id) {
    try {
      console.log('🔍 Product model - getById - requested ID:', id);
      const product = await this.adapter.findById(id);
      console.log('🔍 Product model - getById - product found:', product ? 'Yes' : 'No');
      if (product) {
        console.log('🔍 Product model - getById - product data:', {
          id: product._id,
          title: product.title,
          images: product.images,
          imagesCount: product.images ? product.images.length : 0
        });

        // Include seller social media information if available
        if (product.creatorId) {
          try {
            const User = require('./User');
            const userModel = new User();
            const seller = await userModel.getById(product.creatorId);
            if (seller && seller.socialMedia) {
              product.sellerSocialMedia = seller.socialMedia;
            }
          } catch (sellerError) {
            console.warn('Could not fetch seller social media for product:', id, sellerError.message);
          }
        }
      }
      return product;
    } catch (error) {
      console.error('❌ Product model - getById - error:', error);
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  // Delete product (soft delete)
  async deleteById(id) {
    try {
      return await this.updateById(id, { isDeleted: true });
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Search products
  async searchProducts(searchQuery, filters = {}) {
    try {
      const searchFilter = {
        title: { $regex: searchQuery, $options: 'i' },
        isDeleted: false,
        ...filters
      };

      return await this.adapter.find(searchFilter);
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }

  // Find with filters, sorting, pagination
  async find(filters = {}, options = {}) {
    try {
      const { sort = {}, limit = 0, skip = 0 } = options;
      return await this.adapter.find(filters, sort, limit, skip);
    } catch (error) {
      throw new Error(`Error finding products: ${error.message}`);
    }
  }

  // Count documents
  async countDocuments(filters = {}) {
    try {
      const results = await this.adapter.find(filters);
      return results.length;
    } catch (error) {
      throw new Error(`Error counting products: ${error.message}`);
    }
  }
}

// Export the class, not an instance
module.exports = Product;