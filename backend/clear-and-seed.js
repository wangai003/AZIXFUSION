const { seedCategory } = require("./seed/Category");
const { connectToDatabase } = require("./database/db");

const clearAndSeed = async () => {
  try {
    console.log("🚀 Starting database clear and seed process...");
    
    // Connect to database
    await connectToDatabase();
    console.log("✅ Connected to database");
    
    // Run the category seed
    await seedCategory();
    
    console.log("\n🎉 Database has been successfully cleared and reseeded!");
    console.log("✨ Your new hierarchical category structure is now ready!");
    
  } catch (error) {
    console.error("❌ Error during clear and seed:", error);
  } finally {
    process.exit(0);
  }
};

clearAndSeed();
