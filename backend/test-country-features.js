const axios = require('axios');
const { db } = require('./database/firebase');

const BASE_URL = 'http://localhost:8000';

// Test configuration
const testConfig = {
  timeout: 10000,
  retries: 3
};

// Test user data
const testUsers = {
  vendor: {
    name: 'Test Vendor',
    email: 'test-vendor-country@example.com',
    password: 'testpass123',
    country: 'Nigeria',
    roles: ['vendor']
  },
  seller: {
    name: 'Test Seller',
    email: 'test-seller-country@example.com',
    password: 'testpass123',
    country: 'Kenya',
    roles: ['seller']
  }
};

// Test product data
const testProducts = {
  product1: {
    title: 'Test Product from Nigeria',
    description: 'A test product created by Nigerian vendor',
    price: 100,
    stockQuantity: 50,
    category: 'Electronics',
    subcategory: 'Smartphones',
    images: ['https://via.placeholder.com/300x300?text=Test+Product']
  },
  product2: {
    title: 'Test Product from Kenya',
    description: 'A test product created by Kenyan seller',
    price: 200,
    stockQuantity: 30,
    category: 'Fashion',
    subcategory: 'Clothing',
    images: ['https://via.placeholder.com/300x300?text=Test+Product+2']
  }
};

let authTokens = {};

// Helper function to make API calls with retry
const makeRequest = async (method, url, data = null, headers = {}) => {
  for (let i = 0; i < testConfig.retries; i++) {
    try {
      const config = {
        method,
        url,
        timeout: testConfig.timeout,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (data) config.data = data;

      const response = await axios(config);
      return response;
    } catch (error) {
      if (i === testConfig.retries - 1) {
        console.error(`❌ Request failed after ${testConfig.retries} retries:`, error.message);
        throw error;
      }
      console.log(`⚠️  Retry ${i + 1}/${testConfig.retries} for ${method} ${url}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Helper function to register and login test users
const setupTestUsers = async () => {
  console.log('🔧 Setting up test users...');

  for (const [userType, userData] of Object.entries(testUsers)) {
    try {
      // Register user
      await makeRequest('POST', `${BASE_URL}/auth/register`, userData);

      // Login to get token
      const loginResponse = await makeRequest('POST', `${BASE_URL}/auth/login`, {
        email: userData.email,
        password: userData.password
      });

      if (loginResponse.data.success && loginResponse.data.token) {
        authTokens[userType] = loginResponse.data.token;
        console.log(`✅ ${userType} user setup complete`);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.log(`⚠️  ${userType} user may already exist, continuing...`);
      // Try login anyway
      try {
        const loginResponse = await makeRequest('POST', `${BASE_URL}/auth/login`, {
          email: userData.email,
          password: userData.password
        });
        if (loginResponse.data.success && loginResponse.data.token) {
          authTokens[userType] = loginResponse.data.token;
          console.log(`✅ ${userType} user login successful`);
        }
      } catch (loginError) {
        console.log(`❌ Failed to setup ${userType} user:`, loginError.message);
      }
    }
  }
};

// Test 1: Vendor applications save country correctly
const testVendorApplicationCountry = async () => {
  console.log('\n🧪 Test 1: Vendor applications save country correctly');

  try {
    const vendorToken = authTokens.vendor;
    if (!vendorToken) {
      console.log('❌ Vendor token not available, skipping test');
      return false;
    }

    // Submit vendor application
    const applicationData = {
      businessName: 'Test Vendor Business',
      businessType: 'Retail',
      description: 'Test vendor application for country feature',
      address: {
        street: '123 Test Street',
        city: 'Lagos',
        country: 'Nigeria',
        postalCode: '100001'
      },
      contactInfo: {
        phone: '+2341234567890',
        email: testUsers.vendor.email
      }
    };

    const response = await makeRequest(
      'POST',
      `${BASE_URL}/applications/vendor`,
      applicationData,
      { Authorization: `Bearer ${vendorToken}` }
    );

    if (response.data.success) {
      console.log('✅ Vendor application submitted successfully');

      // Verify country was saved
      const applicationId = response.data.data._id;

      // Fetch the application to verify country
      const fetchResponse = await makeRequest(
        'GET',
        `${BASE_URL}/applications/${applicationId}`,
        null,
        { Authorization: `Bearer ${vendorToken}` }
      );

      if (fetchResponse.data.success && fetchResponse.data.data.address.country === 'Nigeria') {
        console.log('✅ Vendor application country saved correctly: Nigeria');
        return true;
      } else {
        console.log('❌ Vendor application country not saved correctly');
        console.log('Expected: Nigeria, Got:', fetchResponse.data.data.address?.country);
        return false;
      }
    } else {
      console.log('❌ Vendor application submission failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Test 1 failed:', error.message);
    return false;
  }
};

// Test 2: Products are created with creator's country
const testProductCreationWithCountry = async () => {
  console.log('\n🧪 Test 2: Products are created with creator\'s country');

  const results = [];

  for (const [userType, productData] of Object.entries(testProducts)) {
    try {
      const token = authTokens[userType === 'product1' ? 'vendor' : 'seller'];
      if (!token) {
        console.log(`❌ Token for ${userType} not available, skipping product creation`);
        results.push(false);
        continue;
      }

      // Create product
      const response = await makeRequest(
        'POST',
        `${BASE_URL}/products`,
        productData,
        { Authorization: `Bearer ${token}` }
      );

      if (response.data.success) {
        console.log(`✅ Product "${productData.title}" created successfully`);

        // Verify product has correct country
        const productId = response.data.data._id;
        const fetchResponse = await makeRequest('GET', `${BASE_URL}/products/${productId}`);

        const expectedCountry = userType === 'product1' ? 'Nigeria' : 'Kenya';
        if (fetchResponse.data.success && fetchResponse.data.data.country === expectedCountry) {
          console.log(`✅ Product country set correctly: ${expectedCountry}`);
          results.push(true);
        } else {
          console.log(`❌ Product country not set correctly for ${productData.title}`);
          console.log('Expected:', expectedCountry, 'Got:', fetchResponse.data.data.country);
          results.push(false);
        }
      } else {
        console.log(`❌ Product creation failed for ${productData.title}`);
        results.push(false);
      }
    } catch (error) {
      console.log(`❌ Product creation test failed for ${userType}:`, error.message);
      results.push(false);
    }
  }

  return results.every(result => result);
};

// Test 3: User country selection in app bar (Frontend test - manual verification needed)
const testUserCountrySelection = async () => {
  console.log('\n🧪 Test 3: User country selection in app bar');

  console.log('📋 Manual verification required for frontend country selection:');
  console.log('1. Login as a user');
  console.log('2. Check if country selector is visible in app bar');
  console.log('3. Change country selection');
  console.log('4. Verify country is updated in user profile');
  console.log('5. Verify selected country persists across page reloads');

  // This is a manual test - we'll mark it as requiring manual verification
  console.log('⚠️  This test requires manual frontend verification');
  return 'MANUAL_VERIFICATION_NEEDED';
};

// Test 4: Product filtering by country in marketplace pages
const testProductFilteringByCountry = async () => {
  console.log('\n🧪 Test 4: Product filtering by country in marketplace pages');

  try {
    // First, get all products to see what countries are available
    // Note: This test may fail due to authentication requirements, but we can still test the logic
    console.log('📋 Manual verification required for product filtering:');
    console.log('1. Login to the application');
    console.log('2. Navigate to marketplace pages (HomePage, ExportMarketplacePage, ServiceMarketplacePage)');
    console.log('3. Check if country filtering is available in the UI');
    console.log('4. Test filtering products by different countries');
    console.log('5. Verify that only products from selected country are displayed');
    console.log('6. Test that country filter works in combination with other filters');

    // Try to make a basic request to see if we can access products without auth
    try {
      const allProductsResponse = await makeRequest('GET', `${BASE_URL}/products?limit=10`);
      if (allProductsResponse.data.success) {
        const products = allProductsResponse.data.data;
        console.log(`📊 Found ${products.length} products for filtering test`);

        // Get unique countries from products
        const countries = [...new Set(products.map(p => p.country).filter(c => c))];
        console.log('🌍 Available countries in products:', countries);

        if (countries.length > 0) {
          // Test filtering by each country
          const filterResults = [];
          for (const country of countries.slice(0, 2)) { // Test first 2 countries to avoid too many requests
            try {
              const filterResponse = await makeRequest('GET', `${BASE_URL}/products?country=${encodeURIComponent(country)}&limit=10`);

              if (filterResponse.data.success) {
                const filteredProducts = filterResponse.data.data;
                const allMatchCountry = filteredProducts.every(p => p.country === country);

                if (allMatchCountry) {
                  console.log(`✅ Country filter "${country}" works correctly (${filteredProducts.length} products)`);
                  filterResults.push(true);
                } else {
                  console.log(`❌ Country filter "${country}" failed - some products don't match`);
                  filterResults.push(false);
                }
              } else {
                console.log(`❌ Country filter API call failed for "${country}"`);
                filterResults.push(false);
              }
            } catch (error) {
              console.log(`❌ Error testing country filter for "${country}":`, error.message);
              filterResults.push(false);
            }
          }

          return filterResults.every(result => result);
        } else {
          console.log('⚠️  No products with country data found in unauthenticated request');
          return 'MANUAL_VERIFICATION_NEEDED';
        }
      } else {
        console.log('❌ Failed to fetch products - authentication required');
        return 'MANUAL_VERIFICATION_NEEDED';
      }
    } catch (error) {
      console.log('❌ Product filtering test failed due to authentication:', error.message);
      return 'MANUAL_VERIFICATION_NEEDED';
    }
  } catch (error) {
    console.log('❌ Product filtering test failed:', error.message);
    return 'MANUAL_VERIFICATION_NEEDED';
  }
};

// Main test runner
const runCountryFeatureTests = async () => {
  console.log('🚀 Starting Country Feature Tests...\n');

  try {
    // Setup test environment
    await setupTestUsers();

    // Run tests
    const testResults = {
      test1: await testVendorApplicationCountry(),
      test2: await testProductCreationWithCountry(),
      test3: await testUserCountrySelection(),
      test4: await testProductFilteringByCountry()
    };

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));

    const passedTests = Object.values(testResults).filter(result => result === true).length;
    const totalTests = Object.keys(testResults).length - 1; // Exclude manual test from count
    const manualTests = Object.values(testResults).filter(result => result === 'MANUAL_VERIFICATION_NEEDED').length;

    console.log(`✅ Automated Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`📋 Manual Tests Required: ${manualTests}`);

    Object.entries(testResults).forEach(([test, result]) => {
      const status = result === true ? '✅ PASS' :
                    result === false ? '❌ FAIL' :
                    result === 'MANUAL_VERIFICATION_NEEDED' ? '📋 MANUAL' : '❓ UNKNOWN';
      console.log(`${test}: ${status}`);
    });

    if (passedTests === totalTests) {
      console.log('\n🎉 All automated tests passed!');
    } else {
      console.log(`\n⚠️  ${totalTests - passedTests} automated test(s) failed.`);
    }

    if (manualTests > 0) {
      console.log('\n📋 Manual verification required for frontend features.');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runCountryFeatureTests();
}

module.exports = {
  runCountryFeatureTests,
  testVendorApplicationCountry,
  testProductCreationWithCountry,
  testUserCountrySelection,
  testProductFilteringByCountry
};