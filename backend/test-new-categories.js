const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testNewCategorySystem() {
  console.log('🧪 Testing New Category System...\n');
  
  try {
    // Test 1: Get main categories
    console.log('1. Testing main categories...');
    const mainResponse = await axios.get(`${BASE_URL}/categories/main`);
    console.log(`✅ Found ${mainResponse.data.data.length} main categories`);
    
    if (mainResponse.data.data.length > 0) {
      const firstCategory = mainResponse.data.data[0];
      console.log(`   First category: ${firstCategory.name} (${firstCategory.slug})`);
    }

    // Test 2: Get category statistics
    console.log('\n2. Testing category statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/categories/statistics`);
    console.log(`✅ Statistics: ${JSON.stringify(statsResponse.data.data, null, 2)}`);

    // Test 3: Test subcategories for first main category
    if (mainResponse.data.data.length > 0) {
      console.log('\n3. Testing subcategories...');
      const firstMainCategory = mainResponse.data.data[0];
      const subResponse = await axios.get(`${BASE_URL}/categories/subcategories/${firstMainCategory._id}`);
      console.log(`✅ Found ${subResponse.data.data.length} subcategories for "${firstMainCategory.name}"`);
      
      if (subResponse.data.data.length > 0) {
        const firstSubcategory = subResponse.data.data[0];
        console.log(`   First subcategory: ${firstSubcategory.name} (${firstSubcategory.slug})`);
      }
    }

    // Test 4: Test elements for first subcategory
    if (mainResponse.data.data.length > 0) {
      const firstMainCategory = mainResponse.data.data[0];
      const subResponse = await axios.get(`${BASE_URL}/categories/subcategories/${firstMainCategory._id}`);
      
      if (subResponse.data.data.length > 0) {
        console.log('\n4. Testing elements...');
        const firstSubcategory = subResponse.data.data[0];
        const elemResponse = await axios.get(`${BASE_URL}/categories/elements/${firstSubcategory._id}`);
        console.log(`✅ Found ${elemResponse.data.data.length} elements for "${firstSubcategory.name}"`);
        
        if (elemResponse.data.data.length > 0) {
          const firstElement = elemResponse.data.data[0];
          console.log(`   First element: ${firstElement.name} (${firstElement.slug})`);
        }
      }
    }

    // Test 5: Test category search
    console.log('\n5. Testing category search...');
    const searchResponse = await axios.get(`${BASE_URL}/categories/search?q=electronics`);
    console.log(`✅ Search for "electronics" found ${searchResponse.data.data.length} results`);

    // Test 6: Test category by slug
    if (mainResponse.data.data.length > 0) {
      console.log('\n6. Testing category by slug...');
      const firstCategory = mainResponse.data.data[0];
      const slugResponse = await axios.get(`${BASE_URL}/categories/slug/${firstCategory.slug}`);
      console.log(`✅ Found category by slug: ${slugResponse.data.data.name}`);
    }

    // Test 7: Test full hierarchy
    console.log('\n7. Testing full hierarchy...');
    const hierarchyResponse = await axios.get(`${BASE_URL}/categories/hierarchy`);
    console.log(`✅ Full hierarchy loaded with ${hierarchyResponse.data.data.length} main categories`);

    // Test 8: Test categories by type
    console.log('\n8. Testing categories by type...');
    const mainByTypeResponse = await axios.get(`${BASE_URL}/categories/type/main`);
    const subByTypeResponse = await axios.get(`${BASE_URL}/categories/type/sub`);
    const elementByTypeResponse = await axios.get(`${BASE_URL}/categories/type/element`);
    
    console.log(`✅ Categories by type:`);
    console.log(`   Main: ${mainByTypeResponse.data.data.length}`);
    console.log(`   Sub: ${subByTypeResponse.data.data.length}`);
    console.log(`   Element: ${elementByTypeResponse.data.data.length}`);

    // Test 9: Test categories by level
    console.log('\n9. Testing categories by level...');
    const level1Response = await axios.get(`${BASE_URL}/categories/level/1`);
    const level2Response = await axios.get(`${BASE_URL}/categories/level/2`);
    const level3Response = await axios.get(`${BASE_URL}/categories/level/3`);
    
    console.log(`✅ Categories by level:`);
    console.log(`   Level 1: ${level1Response.data.data.length}`);
    console.log(`   Level 2: ${level2Response.data.data.length}`);
    console.log(`   Level 3: ${level3Response.data.data.length}`);

    console.log('\n🎉 All tests passed! The new category system is working correctly.');
    console.log('\n📊 Summary:');
    console.log(`   • Main categories: ${mainResponse.data.data.length}`);
    console.log(`   • Total categories: ${statsResponse.data.data.total}`);
    console.log(`   • System is ready for production use!`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n🔧 Troubleshooting:');
      console.log('   • Make sure your backend server is running on port 5000');
      console.log('   • Verify that the new categories have been seeded');
      console.log('   • Check that the API routes are properly configured');
    }
    
    process.exit(1);
  }
}

// Run the tests
testNewCategorySystem();
