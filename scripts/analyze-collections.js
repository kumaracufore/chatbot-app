const mongoose = require("mongoose");

async function analyzeCollections() {
  try {
    // Connect to MongoDB
    const MONGODB_URI =
      process.env.MONGODB_URI ||
      "mongodb+srv://testw0455:i1XBuvM85wYkUd9G@cluster0.5vyqnjt.mongodb.net/chatbot_db";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collections = [
      "Chatbot Logs",
      "chat_history",
      "conversations",
      "sessions",
      "users",
    ];

    console.log("\n=== DATABASE COLLECTION ANALYSIS ===\n");

    for (const collectionName of collections) {
      try {
        console.log(`📊 Collection: ${collectionName}`);
        console.log("=".repeat(50));

        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`📈 Total Documents: ${count}`);

        if (count > 0) {
          // Get a sample document to analyze structure
          const sampleDoc = await collection.findOne({});
          console.log("\n📋 Document Structure:");
          console.log(JSON.stringify(sampleDoc, null, 2));

          // Get all unique field names from the collection
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
          if (result.length > 0) {
            console.log("\n🔍 All Fields Found:");
            result[0].allkeys.forEach((field, index) => {
              console.log(`  ${index + 1}. ${field}`);
            });
          }
        } else {
          console.log("❌ No documents found in this collection");
        }

        console.log("\n" + "=".repeat(50) + "\n");
      } catch (error) {
        console.log(
          `❌ Error analyzing collection '${collectionName}':`,
          error.message
        );
        console.log("\n" + "=".repeat(50) + "\n");
      }
    }

    console.log("✅ Database analysis completed!");
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the analysis
analyzeCollections();
