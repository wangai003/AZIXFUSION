const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testHierarchicalCategories() {
  try {
    console.log('🧪 Testing Hierarchical Category System...\n');

    // Test 1: Fetch main categories
    console.log('1. Testing main categories endpoint...');
    const mainResponse = await axios.get(`${BASE_URL}/categories/main`);
    console.log(`✅ Main categories: ${mainResponse.data.data.length} found`);
    console.log('   Sample categories:', mainResponse.data.data.slice(0, 3).map(c => c.name));
    console.log('');

    // Test 2: Fetch subcategories for first main category
    if (mainResponse.data.data.length > 0) {
      const firstMainCategory = mainResponse.data.data[0];
      console.log(`2. Testing subcategories for "${firstMainCategory.name}"...`);
      const subResponse = await axios.get(`${BASE_URL}/categories/subcategories/${firstMainCategory._id}`);
      console.log(`✅ Subcategories: ${subResponse.data.data.length} found`);
      console.log('   Sample subcategories:', subResponse.data.data.slice(0, 3).map(c => c.name));
      console.log('');

      // Test 3: Fetch elements for first subcategory
      if (subResponse.data.data.length > 0) {
        const firstSubcategory = subResponse.data.data[0];
        console.log(`3. Testing elements for "${firstSubcategory.name}"...`);
        const elemResponse = await axios.get(`${BASE_URL}/categories/elements/${firstSubcategory._id}`);
        console.log(`✅ Elements: ${elemResponse.data.data.length} found`);
        console.log('   Sample elements:', elemResponse.data.data.slice(0, 3).map(c => c.name));
        console.log('');
      }
    }

    // Test 4: Test full hierarchy
    console.log('4. Testing full hierarchy endpoint...');
    const hierarchyResponse = await axios.get(`${BASE_URL}/categories/hierarchy`);
    console.log(`✅ Full hierarchy: ${hierarchyResponse.data.data.length} total categories`);
    console.log('');

    // Test 5: Test category path
    if (mainResponse.data.data.length > 0) {
      const firstMainCategory = mainResponse.data.data[0];
      console.log(`5. Testing category path for "${firstMainCategory.name}"...`);
      const pathResponse = await axios.get(`${BASE_URL}/categories/path/${firstMainCategory._id}`);
      console.log(`✅ Category path: ${pathResponse.data.data.length} levels`);
      console.log('   Path:', pathResponse.data.data.map(c => c.name).join(' > '));
      console.log('');
    }

    console.log('🎉 All tests passed! The hierarchical category system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 8000');
    }
  }
}

// Run the test
testHierarchicalCategories();
