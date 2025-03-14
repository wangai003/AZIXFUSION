require('dotenv').config();
const mongoose = require("mongoose");

exports.connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });

        console.log("MongoDB Connected Successfully ✅");
    } catch (error) {
        console.error("MongoDB Connection Error ❌:", error);
        process.exit(1);  // Exit process on failure
    }
};
