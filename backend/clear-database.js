const createFirebaseAdapter = require('./utils/FirebaseAdapter');
const { connectToDatabase } = require('./database/db');

const clearAllData = async () => {
  try {
    console.log('🗑️  Starting database cleanup...');
    
    // Connect to database
    await connectToDatabase();
    console.log('✅ Connected to database');
    
    // Get all collections that might have seed data
    const collections = [
      'categories',
      'products', 
      'services',
      'users',
      'orders',
      'reviews',
      'applications',
      'otps',
      'passwordresettokens'
    ];
    
    console.log('\n🧹 Clearing all collections...');
    
    for (const collectionName of collections) {
      try {
        const collection = createFirebaseAdapter(collectionName);
        const items = await collection.find({});
        
        if (items.length > 0) {
          console.log(`🗑️  Clearing ${items.length} items from ${collectionName}...`);
          
          // Delete each item individually
          for (const item of items) {
            await collection.deleteById(item._id);
          }
          
          console.log(`✅ Cleared ${collectionName}`);
        } else {
          console.log(`ℹ️  ${collectionName} is already empty`);
        }
      } catch (error) {
        console.log(`⚠️  Could not clear ${collectionName}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Database cleanup completed!');
    console.log('✨ All seed data has been removed');
    console.log('\n🚀 Ready to add new clean category structure');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    process.exit(0);
  }
};

clearAllData();
