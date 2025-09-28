export const AUCTION_CATEGORIES = {
  'Music & media': [
    'Afrobeat, Amapiano, Cultural Sounds',
    'Royalty-Free Beats & Instrumentals',
    'Voiceovers & Jingles'
  ],
  'Apps': [
    'African-Themed Games',
    'Utility & Culture-Based Apps'
  ],
  'Event Access': [
    'Concerts & Festivals',
    'Sports & Competitions',
    'Art & Cultural Events'
  ],
  'Art & design': [
    'Logos & Brand Design',
    'Photos & Animation',
    'Oil on Canvas',
    'Surreal & Cultural Art',
    'Artworks'
  ],
  'Advertising Content': [
    'Promo Videos',
    'Marketing Scripts & Concepts'
  ],
  'Vintage & Antiques': [
    'Historical Artifacts',
    'Collector\'s Items'
  ],
  'Travel Vouchers': [
    'Cultural Heritage Tours',
    'Safari & Nature Adventures',
    'Island & Beach Getaways',
    'City Escapes & Urban Experiences',
    'Health & Wellness Retreats',
    'Romantic & Honeymoon Escapes',
    'Family-Friendly Packages',
    'Business & Luxury Travel',
    'Eco & Agro-Tourism'
  ]
};

// Helper function to get all categories as array
export const getCategoriesArray = () => {
  return Object.keys(AUCTION_CATEGORIES);
};

// Helper function to get subcategories for a category
export const getSubcategories = (category) => {
  return AUCTION_CATEGORIES[category] || [];
};

// Helper function to get all subcategories as flat array
export const getAllSubcategories = () => {
  return Object.values(AUCTION_CATEGORIES).flat();
};

// Helper function to find category for a subcategory
export const findCategoryForSubcategory = (subcategory) => {
  for (const [category, subcategories] of Object.entries(AUCTION_CATEGORIES)) {
    if (subcategories.includes(subcategory)) {
      return category;
    }
  }
  return null;
};

export default AUCTION_CATEGORIES;