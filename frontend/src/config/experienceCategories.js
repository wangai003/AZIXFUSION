export const EXPERIENCE_CATEGORIES = {
  'City Life & Urban Tours': [
    'Neighborhood walkthroughs',
    'Nightlife explorations',
    'Historical site tours',
    'Food crawls and culinary tours'
  ],
  'Cultural Craft & Market Walks': [
    'Artisan market explorations',
    'Handmade goods discovery',
    'Traditional art & craft tours'
  ],
  'Eco & Adventure Tourism': [
    'Cave explorations',
    'Natural park adventures',
    'Scenic hiking trails',
    'Outdoor photography tours'
  ],
  'Forest Trails & Waterfall Hikes': [
    'Guided forest walks',
    'Nature trekking experiences',
    'Hidden waterfall discoveries'
  ],
  'Mountain & Highland Explorations': [
    'Mountain hiking adventures',
    'Climbing experiences',
    'Nature photography in highlands'
  ],
  'Wildlife Encounters & Safaris': [
    'Game reserve safaris',
    'Birdwatching tours',
    'Community-managed animal sanctuaries'
  ],
  'Hands-On Cultural Experiences': [
    'Local cooking classes',
    'Language immersion sessions',
    'Traditional dance workshops',
    'Drumming and music lessons',
    'Cultural storytelling sessions'
  ],
  'Balloon & Aerial View Experiences': [
    'Hot air balloon rides',
    'Aerial drone-view tours',
    'Paragliding adventures'
  ],
  'Water-Based Adventures': [
    'Boat cruise experiences',
    'Fishing tour adventures',
    'Lakeside retreat explorations'
  ],
  'Horseback & Offbeat Riding Tours': [
    'Rural exploration on horseback',
    'Camel riding adventures',
    'Motorbike rural tours'
  ],
  'Agro & Farm Stay Experiences': [
    'Farming technique learning',
    'Sustainable agriculture tours',
    'Rural life immersion experiences'
  ]
};

// Helper function to get all categories as array
export const getExperienceCategoriesArray = () => {
  return Object.keys(EXPERIENCE_CATEGORIES);
};

// Helper function to get subcategories for a category
export const getExperienceSubcategories = (category) => {
  return EXPERIENCE_CATEGORIES[category] || [];
};

// Helper function to get all subcategories as flat array
export const getAllExperienceSubcategories = () => {
  return Object.values(EXPERIENCE_CATEGORIES).flat();
};

// Helper function to find category for a subcategory
export const findExperienceCategoryForSubcategory = (subcategory) => {
  for (const [category, subcategories] of Object.entries(EXPERIENCE_CATEGORIES)) {
    if (subcategories.includes(subcategory)) {
      return category;
    }
  }
  return null;
};

export default EXPERIENCE_CATEGORIES;