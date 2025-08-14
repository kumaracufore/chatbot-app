const mongoose = require("mongoose");

// Define the Conversation schema
const conversationSchema = new mongoose.Schema({
  conversationId: {
    type: Number,
    required: true,
    unique: true,
  },
  totalConversation: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "paused"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Conversation = mongoose.model("Conversation", conversationSchema);

async function clearDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI =
      process.env.MONGODB_URI ||
      "mongodb+srv://testw0455:i1XBuvM85wYkUd9G@cluster0.5vyqnjt.mongodb.net/chatbot_db";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear all conversations
    const result = await Conversation.deleteMany({});
    console.log(
      `\nCleared ${result.deletedCount} conversations from database.`
    );
    console.log("Database is now empty and ready for your real data!");

    console.log("\nDatabase cleared successfully!");
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the clear function
clearDatabase();
