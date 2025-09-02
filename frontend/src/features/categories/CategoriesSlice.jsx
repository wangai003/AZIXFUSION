import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosi } from '../../config/axios';

// Async thunks
export const fetchMainCategories = createAsyncThunk(
  'categories/fetchMainCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosi.get('/categories/main');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch main categories');
    }
  }
);

export const fetchSubcategories = createAsyncThunk(
  'categories/fetchSubcategories',
  async (parentId, { rejectWithValue }) => {
    try {
      const response = await axiosi.get(`/categories/subcategories/${parentId}`);
      return { parentId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subcategories');
    }
  }
);

export const fetchElements = createAsyncThunk(
  'categories/fetchElements',
  async (subcategoryId, { rejectWithValue }) => {
    try {
      const response = await axiosi.get(`/categories/elements/${subcategoryId}`);
      return { subcategoryId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch elements');
    }
  }
);

export const fetchFullHierarchy = createAsyncThunk(
  'categories/fetchFullHierarchy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosi.get('/categories/hierarchy');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category hierarchy');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosi.get('/categories');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await axiosi.post('/categories', categoryData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await axiosi.put(`/categories/${id}`, updateData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await axiosi.delete(`/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

// New async thunks for enhanced category system
export const searchCategories = createAsyncThunk(
  'categories/searchCategories',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axiosi.get(`/categories/search?q=${encodeURIComponent(query)}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search categories');
    }
  }
);

export const getCategoryStatistics = createAsyncThunk(
  'categories/getCategoryStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosi.get('/categories/statistics');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category statistics');
    }
  }
);

export const getCategoryBySlug = createAsyncThunk(
  'categories/getCategoryBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axiosi.get(`/categories/slug/${slug}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category by slug');
    }
  }
);

export const getCategoriesByType = createAsyncThunk(
  'categories/getCategoriesByType',
  async (type, { rejectWithValue }) => {
    try {
      const response = await axiosi.get(`/categories/type/${type}`);
      return { type, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories by type');
    }
  }
);

export const getCategoriesByLevel = createAsyncThunk(
  'categories/getCategoriesByLevel',
  async (level, { rejectWithValue }) => {
    try {
      const response = await axiosi.get(`/categories/level/${level}`);
      return { level, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories by level');
    }
  }
);

const initialState = {
  mainCategories: [],
  subcategories: {}, // Keyed by parentId
  elements: {}, // Keyed by subcategoryId
  fullHierarchy: [],
  categories: [], // Flat list for backward compatibility
  loading: false,
  error: null,
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
  // New state properties for enhanced features
  searchResults: [],
  statistics: null,
  categoryBySlug: {},
  categoriesByType: {},
  categoriesByLevel: {}
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCreateStatus: (state) => {
      state.createStatus = 'idle';
    },
    clearUpdateStatus: (state) => {
      state.updateStatus = 'idle';
    },
    clearDeleteStatus: (state) => {
      state.deleteStatus = 'idle';
    },
    clearSubcategories: (state, action) => {
      const parentId = action.payload;
      delete state.subcategories[parentId];
    },
    clearElements: (state, action) => {
      const subcategoryId = action.payload;
      delete state.elements[subcategoryId];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch main categories
      .addCase(fetchMainCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMainCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.mainCategories = action.payload;
      })
      .addCase(fetchMainCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch subcategories
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        const { parentId, data } = action.payload;
        state.subcategories[parentId] = data;
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch elements
      .addCase(fetchElements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchElements.fulfilled, (state, action) => {
        state.loading = false;
        const { subcategoryId, data } = action.payload;
        state.elements[subcategoryId] = data;
      })
      .addCase(fetchElements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch full hierarchy
      .addCase(fetchFullHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFullHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.fullHierarchy = action.payload;
      })
      .addCase(fetchFullHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch categories (backward compatibility)
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.createStatus = 'pending';
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.createStatus = 'fulfilled';
        const newCategory = action.payload;
        
        // Add to appropriate arrays based on type
        if (newCategory.type === 'main') {
          state.mainCategories.push(newCategory);
        } else if (newCategory.type === 'sub') {
          if (!state.subcategories[newCategory.parentId]) {
            state.subcategories[newCategory.parentId] = [];
          }
          state.subcategories[newCategory.parentId].push(newCategory);
        } else if (newCategory.type === 'element') {
          if (!state.elements[newCategory.parentId]) {
            state.elements[newCategory.parentId] = [];
          }
          state.elements[newCategory.parentId].push(newCategory);
        }
        
        // Also add to flat categories array
        state.categories.push(newCategory);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.createStatus = 'rejected';
        state.error = action.payload;
      })
      
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.updateStatus = 'pending';
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.updateStatus = 'fulfilled';
        const updatedCategory = action.payload;
        
        // Update in appropriate arrays
        if (updatedCategory.type === 'main') {
          const index = state.mainCategories.findIndex(cat => cat._id === updatedCategory._id);
          if (index !== -1) {
            state.mainCategories[index] = updatedCategory;
          }
        } else if (updatedCategory.type === 'sub') {
          if (state.subcategories[updatedCategory.parentId]) {
            const index = state.subcategories[updatedCategory.parentId].findIndex(cat => cat._id === updatedCategory._id);
            if (index !== -1) {
              state.subcategories[updatedCategory.parentId][index] = updatedCategory;
            }
          }
        } else if (updatedCategory.type === 'element') {
          if (state.elements[updatedCategory.parentId]) {
            const index = state.elements[updatedCategory.parentId].findIndex(cat => cat._id === updatedCategory._id);
            if (index !== -1) {
              state.elements[updatedCategory.parentId][index] = updatedCategory;
            }
          }
        }
        
        // Update in flat categories array
        const flatIndex = state.categories.findIndex(cat => cat._id === updatedCategory._id);
        if (flatIndex !== -1) {
          state.categories[flatIndex] = updatedCategory;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.updateStatus = 'rejected';
        state.error = action.payload;
      })
      
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.deleteStatus = 'pending';
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.deleteStatus = 'fulfilled';
        const deletedId = action.payload;
        
        // Remove from all arrays
        state.mainCategories = state.mainCategories.filter(cat => cat._id !== deletedId);
        state.categories = state.categories.filter(cat => cat._id !== deletedId);
        
        // Remove from subcategories and elements
        Object.keys(state.subcategories).forEach(parentId => {
          state.subcategories[parentId] = state.subcategories[parentId].filter(cat => cat._id !== deletedId);
        });
        
        Object.keys(state.elements).forEach(subcategoryId => {
          state.elements[subcategoryId] = state.elements[subcategoryId].filter(cat => cat._id !== deletedId);
        });
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.deleteStatus = 'rejected';
        state.error = action.payload;
      })
      
      // Search categories
      .addCase(searchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get category statistics
      .addCase(getCategoryStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoryStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(getCategoryStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get category by slug
      .addCase(getCategoryBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoryBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryBySlug[action.payload.slug] = action.payload;
      })
      .addCase(getCategoryBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get categories by type
      .addCase(getCategoriesByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoriesByType.fulfilled, (state, action) => {
        state.loading = false;
        const { type, data } = action.payload;
        state.categoriesByType[type] = data;
      })
      .addCase(getCategoriesByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get categories by level
      .addCase(getCategoriesByLevel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategoriesByLevel.fulfilled, (state, action) => {
        state.loading = false;
        const { level, data } = action.payload;
        state.categoriesByLevel[level] = data;
      })
      .addCase(getCategoriesByLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearError, 
  clearCreateStatus, 
  clearUpdateStatus, 
  clearDeleteStatus,
  clearSubcategories,
  clearElements
} = categoriesSlice.actions;

// Selectors
export const selectMainCategories = (state) => state.CategoriesSlice.mainCategories;
export const selectSubcategories = (state) => state.CategoriesSlice.subcategories;
export const selectElements = (state) => state.CategoriesSlice.elements;
export const selectFullHierarchy = (state) => state.CategoriesSlice.fullHierarchy;
export const selectCategories = (state) => state.CategoriesSlice.categories;
export const selectCategoriesLoading = (state) => state.CategoriesSlice.loading;
export const selectCategoriesError = (state) => state.CategoriesSlice.error;
export const selectCreateStatus = (state) => state.CategoriesSlice.createStatus;
export const selectUpdateStatus = (state) => state.CategoriesSlice.updateStatus;
export const selectDeleteStatus = (state) => state.CategoriesSlice.deleteStatus;

// Helper selectors - these return the entire objects for use with useSelector
export const selectSubcategoriesByParent = (state, parentId) => state.CategoriesSlice.subcategories[parentId] || [];
export const selectElementsBySubcategory = (state, subcategoryId) => state.CategoriesSlice.elements[subcategoryId] || [];

// Parameterized selectors for specific lookups
export const selectSubcategoriesForParent = (state, parentId) => 
  state.CategoriesSlice.subcategories[parentId] || [];

export const selectElementsForSubcategory = (state, subcategoryId) => 
  state.CategoriesSlice.elements[subcategoryId] || [];

export const selectCategoryById = (state, categoryId) => {
  const allCategories = [
    ...state.CategoriesSlice.mainCategories,
    ...Object.values(state.CategoriesSlice.subcategories).flat(),
    ...Object.values(state.CategoriesSlice.elements).flat()
  ];
  return allCategories.find(cat => cat._id === categoryId);
};

// New selectors for enhanced features
export const selectSearchResults = (state) => state.CategoriesSlice.searchResults;
export const selectCategoryStatistics = (state) => state.CategoriesSlice.statistics;
export const selectCategoryBySlug = (state, slug) => state.CategoriesSlice.categoryBySlug[slug];
export const selectCategoriesByType = (state, type) => state.CategoriesSlice.categoriesByType[type] || [];
export const selectCategoriesByLevel = (state, level) => state.CategoriesSlice.categoriesByLevel[level] || [];

export default categoriesSlice.reducer;