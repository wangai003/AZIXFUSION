const createFirebaseAdapter = require('./utils/FirebaseAdapter');
const { connectToDatabase } = require('./database/db');

const checkCategories = async () => {
  try {
    await connectToDatabase();
    console.log('✅ Connected to database');
    
    const Category = createFirebaseAdapter('categories');
    
    // Get all categories
    const allCategories = await Category.find({});
    console.log('\n📊 Total categories in database:', allCategories.length);
    
    // Group by type
    const mainCategories = allCategories.filter(cat => cat.type === 'main');
    const subcategories = allCategories.filter(cat => cat.type === 'sub');
    const elements = allCategories.filter(cat => cat.type === 'element');
    const untyped = allCategories.filter(cat => !cat.type);
    
    console.log('\n🏷️  Main Categories:', mainCategories.length);
    mainCategories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id})`);
    });
    
    console.log('\n📁 Subcategories:', subcategories.length);
    subcategories.forEach(cat => {
      console.log(`  - ${cat.name} (Parent: ${cat.parentId})`);
    });
    
    console.log('\n🔧 Elements:', elements.length);
    elements.forEach(cat => {
      console.log(`  - ${cat.name} (Parent: ${cat.parentId})`);
    });
    
    if (untyped.length > 0) {
      console.log('\n⚠️  Untyped Categories:', untyped.length);
      untyped.forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat._id})`);
      });
    }
    
    // Check for duplicates
    const names = allCategories.map(cat => cat.name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      console.log('\n🚨 Duplicate names found:', [...new Set(duplicates)]);
    }
    
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    process.exit(0);
  }
};

checkCategories();
