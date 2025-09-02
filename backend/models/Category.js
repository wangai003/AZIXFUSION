const createFirebaseAdapter = require('../utils/FirebaseAdapter');

class Category {
  constructor() {
    this.adapter = createFirebaseAdapter('categories');
  }

  // Create a new category
  async create(categoryData) {
    try {
      const category = {
        slug: categoryData.slug || this.generateSlug(categoryData.name),
        name: categoryData.name,
        description: categoryData.description || '',
        type: categoryData.type || 'main', // 'main', 'sub', 'element'
        parentId: categoryData.parentId || null, // For subcategories and elements
        level: categoryData.level || 1, // 1: main category, 2: subcategory, 3: element
        icon: categoryData.icon || 'category',
        image: categoryData.image || '',
        isActive: categoryData.isActive !== false,
        sortOrder: categoryData.sortOrder || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate category data
      this.validateCategory(category);

      return await this.adapter.create(category);
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  // Generate slug from name
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Validate category data
  validateCategory(category) {
    if (!category.name || category.name.trim().length === 0) {
      throw new Error('Category name is required');
    }

    if (category.type === 'sub' && !category.parentId) {
      throw new Error('Subcategory must have a parent category');
    }

    if (category.type === 'element' && !category.parentId) {
      throw new Error('Element must have a parent subcategory');
    }

    if (category.level < 1 || category.level > 3) {
      throw new Error('Category level must be between 1 and 3');
    }

    // Validate level matches type
    if (category.type === 'main' && category.level !== 1) {
      throw new Error('Main category must have level 1');
    }
    if (category.type === 'sub' && category.level !== 2) {
      throw new Error('Subcategory must have level 2');
    }
    if (category.type === 'element' && category.level !== 3) {
      throw new Error('Element must have level 3');
    }
  }

  // Get all main categories
  async getMainCategories() {
    try {
      const categories = await this.adapter.find({ type: 'main', isActive: true });
      // Sort in JavaScript to avoid composite index requirement
      return categories.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        }
        return (a.name || '').localeCompare(b.name || '');
      });
    } catch (error) {
      throw new Error(`Error fetching main categories: ${error.message}`);
    }
  }

  // Get subcategories by parent category ID
  async getSubcategories(parentId) {
    try {
      const categories = await this.adapter.find({ parentId, type: 'sub', isActive: true });
      // Sort in JavaScript to avoid composite index requirement
      return categories.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        }
        return (a.name || '').localeCompare(b.name || '');
      });
    } catch (error) {
      throw new Error(`Error fetching subcategories: ${error.message}`);
    }
  }

  // Get elements by subcategory ID
  async getElements(subcategoryId) {
    try {
      const categories = await this.adapter.find({ parentId: subcategoryId, type: 'element', isActive: true });
      // Sort in JavaScript to avoid composite index requirement
      return categories.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        }
        return (a.name || '').localeCompare(b.name || '');
      });
    } catch (error) {
      throw new Error(`Error fetching elements: ${error.message}`);
    }
  }

  // Get category by slug
  async getBySlug(slug) {
    try {
      const categories = await this.adapter.find({ slug, isActive: true });
      return categories.length > 0 ? categories[0] : null;
    } catch (error) {
      throw new Error(`Error fetching category by slug: ${error.message}`);
    }
  }

  // Get full category hierarchy
  async getFullHierarchy() {
    try {
      const mainCategories = await this.getMainCategories();
      const hierarchy = [];

      for (const mainCat of mainCategories) {
        const subcategories = await this.getSubcategories(mainCat._id);
        const mainCategoryWithSubs = {
          ...mainCat,
          subcategories: []
        };

        for (const subCat of subcategories) {
          const elements = await this.getElements(subCat._id);
          mainCategoryWithSubs.subcategories.push({
            ...subCat,
            elements
          });
        }

        hierarchy.push(mainCategoryWithSubs);
      }

      return hierarchy;
    } catch (error) {
      throw new Error(`Error fetching category hierarchy: ${error.message}`);
    }
  }

  // Get category path (breadcrumb)
  async getCategoryPath(categoryId) {
    try {
      const category = await this.findById(categoryId);
      if (!category) return [];

      const path = [category];

      if (category.parentId) {
        const parent = await this.findById(category.parentId);
        if (parent) {
          const parentPath = await this.getCategoryPath(parent._id);
          path.unshift(...parentPath);
        }
      }

      return path;
    } catch (error) {
      throw new Error(`Error fetching category path: ${error.message}`);
    }
  }

  // Get categories by type
  async getByType(type) {
    try {
      const categories = await this.adapter.find({ type, isActive: true });
      return categories.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        }
        return (a.name || '').localeCompare(b.name || '');
      });
    } catch (error) {
      throw new Error(`Error fetching categories by type: ${error.message}`);
    }
  }

  // Get categories by level
  async getByLevel(level) {
    try {
      const categories = await this.adapter.find({ level, isActive: true });
      return categories.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        }
        return (a.name || '').localeCompare(b.name || '');
      });
    } catch (error) {
      throw new Error(`Error fetching categories by level: ${error.message}`);
    }
  }

  // Update category
  async updateById(id, updateData) {
    try {
      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      // Validate updated data if it includes structural changes
      if (updateData.type || updateData.level || updateData.parentId) {
        const existingCategory = await this.findById(id);
        if (existingCategory) {
          const updatedCategory = { ...existingCategory, ...update };
          this.validateCategory(updatedCategory);
        }
      }

      return await this.adapter.updateById(id, update);
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  }

  // Delete category and all its children
  async deleteById(id) {
    try {
      // First, get all subcategories and elements
      const subcategories = await this.getSubcategories(id);
      const elements = await this.getElements(id);

      // Delete all elements
      for (const element of elements) {
        await this.adapter.deleteById(element._id);
      }

      // Delete all subcategories
      for (const subcategory of subcategories) {
        await this.adapter.deleteById(subcategory._id);
      }

      // Finally, delete the main category
      return await this.adapter.deleteById(id);
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }

  // Find by ID
  async findById(id) {
    try {
      return await this.adapter.findById(id);
    } catch (error) {
      throw new Error(`Error finding category: ${error.message}`);
    }
  }

  // Find with filters
  async find(filters = {}, options = {}) {
    try {
      const categories = await this.adapter.find(filters);
      
      // Sort in JavaScript to avoid composite index requirement
      if (options.sort) {
        categories.sort((a, b) => {
          for (const [field, order] of Object.entries(options.sort)) {
            if (a[field] !== b[field]) {
              const aVal = a[field] || 0;
              const bVal = b[field] || 0;
              return order === 1 ? aVal - bVal : bVal - aVal;
            }
          }
          return 0;
        });
      }
      
      return categories;
    } catch (error) {
      throw new Error(`Error finding categories: ${error.message}`);
    }
  }

  // Count documents
  async countDocuments(filters = {}) {
    try {
      const results = await this.adapter.find(filters);
      return results.length;
    } catch (error) {
      throw new Error(`Error counting categories: ${error.message}`);
    }
  }

  // Search categories by name or description
  async search(query) {
    try {
      const allCategories = await this.adapter.find({ isActive: true });
      const searchTerm = query.toLowerCase();
      
      return allCategories.filter(category => 
        category.name.toLowerCase().includes(searchTerm) ||
        category.description.toLowerCase().includes(searchTerm) ||
        category.slug.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      throw new Error(`Error searching categories: ${error.message}`);
    }
  }

  // Get category statistics
  async getStatistics() {
    try {
      const mainCategories = await this.getByType('main');
      const subcategories = await this.getByType('sub');
      const elements = await this.getByType('element');
      
      return {
        total: mainCategories.length + subcategories.length + elements.length,
        mainCategories: mainCategories.length,
        subcategories: subcategories.length,
        elements: elements.length
      };
    } catch (error) {
      throw new Error(`Error fetching category statistics: ${error.message}`);
    }
  }
}

module.exports = new Category();