const { generateCategoryData } = require('../new-category-structure');
const createFirebaseAdapter = require('../utils/FirebaseAdapter');

async function seedNewCategories() {
  console.log('🌱 Starting new category seeding process...');
  
  try {
    const categoriesAdapter = createFirebaseAdapter('categories');
    
    // Clear existing categories
    console.log('🗑️ Clearing existing categories...');
    const existingCategories = await categoriesAdapter.find({});
    for (const category of existingCategories) {
      await categoriesAdapter.deleteById(category._id);
    }
    console.log(`✅ Cleared ${existingCategories.length} existing categories`);
    
    // Generate new category data
    console.log('📝 Generating new category structure...');
    const newCategories = generateCategoryData();
    console.log(`📊 Generated ${newCategories.length} categories`);
    
    // Create categories in the correct order (main -> sub -> elements)
    const mainCategories = newCategories.filter(cat => cat.type === 'main');
    const subcategories = newCategories.filter(cat => cat.type === 'sub');
    const elements = newCategories.filter(cat => cat.type === 'element');
    
    // Create main categories first
    console.log('🏗️ Creating main categories...');
    const createdMainCategories = {};
    for (const mainCat of mainCategories) {
      const created = await categoriesAdapter.create(mainCat);
      createdMainCategories[mainCat.slug] = created._id;
      console.log(`✅ Created main category: ${mainCat.name} (ID: ${created._id})`);
    }
    
    // Create subcategories with proper parent IDs
    console.log('📂 Creating subcategories...');
    const createdSubcategories = {};
    for (const subCat of subcategories) {
      // Extract main category slug from the temporary parentId
      const mainSlug = subCat.parentId.replace('main_', '');
      const actualParentId = createdMainCategories[mainSlug];
      
      if (actualParentId) {
        const subcategoryData = {
          ...subCat,
          parentId: actualParentId
        };
        const created = await categoriesAdapter.create(subcategoryData);
        createdSubcategories[subCat.slug] = created._id;
        console.log(`✅ Created subcategory: ${subCat.name} (ID: ${created._id})`);
      } else {
        console.log(`❌ Could not find parent for subcategory: ${subCat.name}`);
      }
    }
    
    // Create elements with proper parent IDs
    console.log('🔧 Creating elements...');
    for (const element of elements) {
      // Extract subcategory slug from the temporary parentId
      const subSlug = element.parentId.replace('sub_', '');
      const actualParentId = createdSubcategories[subSlug];
      
      if (actualParentId) {
        const elementData = {
          ...element,
          parentId: actualParentId
        };
        const created = await categoriesAdapter.create(elementData);
        console.log(`✅ Created element: ${element.name} (ID: ${created._id})`);
      } else {
        console.log(`❌ Could not find parent for element: ${element.name}`);
      }
    }
    
    console.log('🎉 New category seeding completed successfully!');
    console.log(`📊 Total categories created: ${newCategories.length}`);
    console.log(`🏗️ Main categories: ${mainCategories.length}`);
    console.log(`📂 Subcategories: ${subcategories.length}`);
    console.log(`🔧 Elements: ${elements.length}`);
    
    return {
      success: true,
      totalCreated: newCategories.length,
      mainCategories: mainCategories.length,
      subcategories: subcategories.length,
      elements: elements.length
    };
    
  } catch (error) {
    console.error('❌ Error seeding new categories:', error);
    throw error;
  }
}

// Export the function
module.exports = { seedNewCategories };

// If this file is run directly, execute the seeding
if (require.main === module) {
  seedNewCategories()
    .then((result) => {
      console.log('✅ Seeding completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
