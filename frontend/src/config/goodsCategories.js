// Goods categories configuration for Retail & Consumer Goods marketplace
export const GOODS_CATEGORIES = {
  'Retail & Consumer Goods': {
    icon: '🛍️',
    subcategories: [
      'Groceries',
      'Clothing & Apparel',
      'Electronics & Gadgets',
      'Home Appliances',
      'Beauty & Personal Care',
      'Health & Wellness'
    ]
  },
  'Agriculture': {
    icon: '🌾',
    subcategories: [
      'Fresh Produce',
      'Livestock & Poultry',
      'Farming Tools & Equipment',
      'Fertilizers & Pesticides',
      'Seeds & Nurseries'
    ]
  },
  'Artisanal & Handicrafts': {
    icon: '🎨',
    subcategories: [
      'Jewelry',
      'Textiles & Fashion',
      'Pottery & Ceramics',
      'Cultural Artifacts & Home Decor',
      'Handmade Furniture'
    ]
  },
  'Food & Beverage': {
    icon: '🍽️',
    subcategories: [
      'Local Food Vendors',
      'Bakeries & Confectionery',
      'Beverage Suppliers',
      'Packaged & Processed Foods',
      'Organic & Specialty Foods'
    ]
  },
  'Construction & Building Materials': {
    icon: '🏗️',
    subcategories: [
      'Raw Materials',
      'Structural Components',
      'Finishing Materials',
      'Construction Tools & Equipment'
    ]
  },
  'Education & Learning': {
    icon: '📚',
    subcategories: [
      'School Supplies',
      'Libraries & Bookstores'
    ]
  },
  'Automotive & Transportation': {
    icon: '🚗',
    subcategories: [
      'Vehicles & Motorcycles',
      'Auto Parts & Accessories'
    ]
  },
  'Technology & Software': {
    icon: '💻',
    subcategories: [
      'Computers & Accessories',
      'Software & Digital Solutions'
    ]
  }
};

// Helper function to get all goods category names
export const getGoodsCategoryNames = () => {
  return Object.keys(GOODS_CATEGORIES);
};

// Helper function to get all goods subcategories
export const getAllGoodsSubcategories = () => {
  return Object.values(GOODS_CATEGORIES).flatMap(cat => cat.subcategories);
};

// Helper function to check if a category is a goods category
export const isGoodsCategory = (categoryName) => {
  return getGoodsCategoryNames().includes(categoryName);
};

// Helper function to check if a subcategory belongs to goods
export const isGoodsSubcategory = (subcategoryName) => {
  return getAllGoodsSubcategories().includes(subcategoryName);
};