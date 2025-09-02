const Category = require('./models/Category');

async function debugCategories() {
  try {
    console.log('🔍 Debugging Category Model...\n');

    // Test 1: Check if Category model is working
    console.log('1. Testing Category model instance...');
    console.log('Category model type:', typeof Category);
    console.log('Category model methods:', Object.getOwnPropertyNames(Category));
    console.log('');

    // Test 2: Test getMainCategories method
    console.log('2. Testing getMainCategories method...');
    try {
      const mainCategories = await Category.getMainCategories();
      console.log(`✅ getMainCategories returned: ${mainCategories.length} categories`);
      if (mainCategories.length > 0) {
        console.log('   Sample:', mainCategories[0]);
      }
    } catch (error) {
      console.log('❌ getMainCategories failed:', error.message);
    }
    console.log('');

    // Test 3: Test direct adapter access
    console.log('3. Testing direct adapter access...');
    try {
      const allCategories = await Category.adapter.find({ type: 'main' });
      console.log(`✅ Direct adapter access returned: ${allCategories.length} main categories`);
      if (allCategories.length > 0) {
        console.log('   Sample:', allCategories[0]);
      }
    } catch (error) {
      console.log('❌ Direct adapter access failed:', error.message);
    }
    console.log('');

    // Test 4: Test with different filters
    console.log('4. Testing different filters...');
    try {
      const allCategories = await Category.adapter.find({});
      console.log(`✅ Total categories: ${allCategories.length}`);
      
      const mainCategories = allCategories.filter(c => c.type === 'main');
      console.log(`✅ Main categories (filtered): ${mainCategories.length}`);
      
      const subCategories = allCategories.filter(c => c.type === 'sub');
      console.log(`✅ Sub categories (filtered): ${subCategories.length}`);
      
      const elementCategories = allCategories.filter(c => c.type === 'element');
      console.log(`✅ Element categories (filtered): ${elementCategories.length}`);
      
      const undefinedType = allCategories.filter(c => c.type === undefined);
      console.log(`⚠️ Categories with undefined type: ${undefinedType.length}`);
      
    } catch (error) {
      console.log('❌ Filter test failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugCategories();
