const mongoose = require("mongoose");

// Define the Conversation schema to match your existing data
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

async function checkDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI =
      process.env.MONGODB_URI ||
      "mongodb+srv://testw0455:i1XBuvM85wYkUd9G@cluster0.5vyqnjt.mongodb.net/chatbot_db";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all conversations
    const conversations = await Conversation.find({}).sort({ createdAt: -1 });
    console.log(`\nFound ${conversations.length} conversations in database:`);

    if (conversations.length === 0) {
      console.log("No conversations found in database.");
    } else {
      conversations.forEach((conversation, index) => {
        console.log(
          `${index + 1}. ID: ${conversation.conversationId} | ${
            conversation.region
          } (${conversation.country}) | ${conversation.duration} | Status: ${
            conversation.status
          }`
        );
      });
    }

    console.log("\nDatabase check completed!");
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the check function
checkDatabase();
