const createFirebaseAdapter = require('./utils/FirebaseAdapter');

async function testDatabaseConnection() {
  try {
    console.log('🧪 Testing Database Connection...\n');

    // Create a Firebase adapter for categories
    const categoriesAdapter = createFirebaseAdapter('categories');
    
    console.log('1. Testing direct database access...');
    
    // Try to find all categories
    const allCategories = await categoriesAdapter.find({});
    console.log(`✅ Found ${allCategories.length} categories in database`);
    
    if (allCategories.length > 0) {
      console.log('   Sample categories:', allCategories.slice(0, 3).map(c => ({ id: c._id, name: c.name, type: c.type })));
    } else {
      console.log('   No categories found in database');
    }
    
    console.log('\n2. Testing filtered queries...');
    
    // Try to find main categories
    const mainCategories = await categoriesAdapter.find({ type: 'main' });
    console.log(`✅ Found ${mainCategories.length} main categories`);
    
    if (mainCategories.length > 0) {
      console.log('   Main categories:', mainCategories.map(c => c.name));
    }
    
    // Try to find subcategories
    const subcategories = await categoriesAdapter.find({ type: 'sub' });
    console.log(`✅ Found ${subcategories.length} subcategories`);
    
    // Try to find elements
    const elements = await categoriesAdapter.find({ type: 'element' });
    console.log(`✅ Found ${elements.length} elements`);
    
    console.log('\n🎉 Database connection test completed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testDatabaseConnection();
