const mongoose = require("mongoose");

async function getDBSchema() {
  try {
    // Connect to MongoDB
    const MONGODB_URI =
      process.env.MONGODB_URI ||
      "mongodb+srv://testw0455:i1XBuvM85wYkUd9G@cluster0.5vyqnjt.mongodb.net/chatbot_db";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log("\n=== DATABASE SCHEMA INFORMATION ===\n");
    console.log(`Found ${collections.length} collections in the database:\n`);

    // Process each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`📊 Collection: ${collectionName}`);
      console.log("==".repeat(25));

      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(`📈 Total Documents: ${count}`);

      if (count > 0) {
        // Get a sample document to analyze structure
        const sampleDoc = await collection.findOne({});
        
        // Extract field names and types
        console.log("\n📋 Fields and Types:");
        const fields = Object.keys(sampleDoc);
        fields.forEach(field => {
          const value = sampleDoc[field];
          const type = Array.isArray(value) ? 
            `Array[${value.length > 0 ? typeof value[0] : 'empty'}]` : 
            typeof value;
          console.log(`  - ${field}: ${type}${field === '_id' ? ' (Primary Key)' : ''}`);
        });

        // Get all unique field names from the collection (in case some documents have different fields)
        const pipeline = [
          { $sample: { size: Math.min(100, count) } },
          { $project: { arrayofkeyvalue: { $objectToArray: "$$ROOT" } } },
          { $unwind: "$arrayofkeyvalue" },
          {
            $group: {
              _id: null,
              allkeys: { $addToSet: "$arrayofkeyvalue.k" },
            },
          },
        ];

        const result = await collection.aggregate(pipeline).toArray();
        if (result.length > 0 && result[0].allkeys.length > fields.length) {
          console.log("\n🔍 Additional Fields Found in Other Documents:");
          const additionalFields = result[0].allkeys.filter(field => !fields.includes(field));
          additionalFields.forEach(field => {
            console.log(`  - ${field}: unknown type (not present in sample document)`);
          });
        }

        // Show sample document
        console.log("\n📝 Sample Document:");
        console.log(JSON.stringify(sampleDoc, null, 2));
      } else {
        console.log("❌ No documents found in this collection");
      }

      console.log("\n" + "==".repeat(25) + "\n");
    }

    // Show Mongoose models and their schemas if available
    console.log("\n=== MONGOOSE MODELS ===\n");
    
    // These are the models we know exist based on the codebase
    const knownModels = ['Conversation', 'User'];
    
    console.log("Defined Mongoose Models and Schemas:\n");
    
    // Conversation Model
    console.log("📘 Model: Conversation");
    console.log("==".repeat(25));
    console.log("Fields:");
    console.log("  - conversationId: Number (required, unique)");
    console.log("  - totalConversation: String (required)");
    console.log("  - duration: String (required)");
    console.log("  - region: String (required)");
    console.log("  - country: String (required)");
    console.log("  - status: String (enum: ['active', 'paused'], default: 'active')");
    console.log("  - createdAt: Date (default: Date.now)");
    console.log("  - updatedAt: Date (default: Date.now)");
    console.log("\n" + "==".repeat(25) + "\n");
    
    // User Model
    console.log("📘 Model: User");
    console.log("==".repeat(25));
    console.log("Fields:");
    console.log("  - name: String (required, trim)");
    console.log("  - email: String (required, unique, trim, lowercase)");
    console.log("  - age: Number (min: 0, max: 120)");
    console.log("  - occupation: String (trim)");
    console.log("  - createdAt: Date (default: Date.now)");
    console.log("  - updatedAt: Date (default: Date.now)");
    console.log("\n" + "==".repeat(25) + "\n");

    console.log("✅ Database schema analysis completed!");
  } catch (error) {
    console.error("❌ Error analyzing database schema:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the schema analysis
getDBSchema();