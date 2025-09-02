const axios = require('axios');

const testProductEndpoint = async () => {
  try {
    console.log('🔍 Testing Product Endpoint...');
    
    // Test 1: Get a specific product by ID
    console.log('\n🔍 Test 1: GET /products/[product-id]');
    try {
      // You'll need to replace this with an actual product ID from your database
      const productId = 'admin'; // This is probably not a valid product ID
      const response = await axios.get(`http://localhost:5000/products/${productId}`);
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const product = response.data.data;
        console.log('✅ Product found:', {
          id: product._id,
          title: product.title,
          images: product.images,
          imagesCount: product.images ? product.images.length : 0
        });
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data);
    }
    
    // Test 2: Get all products to find a valid ID
    console.log('\n🔍 Test 2: GET /products (to find valid product IDs)');
    try {
      const response = await axios.get('http://localhost:5000/products');
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', response.data);
      
      if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
        const firstProduct = response.data.data[0];
        console.log('✅ First product:', {
          id: firstProduct._id,
          title: firstProduct.title,
          images: firstProduct.images,
          imagesCount: firstProduct.images ? firstProduct.images.length : 0
        });
        
        // Test 3: Get this specific product
        console.log('\n🔍 Test 3: GET /products/[first-product-id]');
        try {
          const productResponse = await axios.get(`http://localhost:5000/products/${firstProduct._id}`);
          console.log('✅ Product response status:', productResponse.status);
          console.log('✅ Product response data:', productResponse.data);
        } catch (error) {
          console.log('❌ Product error:', error.response?.status, error.response?.data);
        }
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testProductEndpoint();
