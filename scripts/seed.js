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

// Sample conversation data with state names and countries
const sampleConversations = [
  {
    conversationId: 3,
    totalConversation: "2m 34s",
    duration: "2m 34s",
    region: "New York",
    country: "United States",
    status: "active",
  },
  {
    conversationId: 7,
    totalConversation: "8m 12s",
    duration: "8m 12s",
    region: "London",
    country: "United Kingdom",
    status: "paused",
  },
  {
    conversationId: 5,
    totalConversation: "4m 56s",
    duration: "4m 56s",
    region: "Tokyo",
    country: "Japan",
    status: "active",
  },
  {
    conversationId: 12,
    totalConversation: "15m 30s",
    duration: "15m 30s",
    region: "California",
    country: "United States",
    status: "active",
  },
  {
    conversationId: 4,
    totalConversation: "3m 18s",
    duration: "3m 18s",
    region: "Berlin",
    country: "Germany",
    status: "active",
  },
  {
    conversationId: 8,
    totalConversation: "6m 45s",
    duration: "6m 45s",
    region: "Texas",
    country: "United States",
    status: "paused",
  },
  {
    conversationId: 15,
    totalConversation: "11m 22s",
    duration: "11m 22s",
    region: "Mumbai",
    country: "India",
    status: "active",
  },
  {
    conversationId: 9,
    totalConversation: "7m 8s",
    duration: "7m 8s",
    region: "Paris",
    country: "France",
    status: "active",
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI =
      process.env.MONGODB_URI ||
      "mongodb+srv://testw0455:i1XBuvM85wYkUd9G@cluster0.5vyqnjt.mongodb.net/chatbot_db";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Conversation.deleteMany({});
    console.log("Cleared existing conversations");

    // Insert sample data
    const conversations = await Conversation.insertMany(sampleConversations);
    console.log(`Inserted ${conversations.length} sample conversations`);

    // Display the inserted conversations
    console.log("\nSample conversations added:");
    conversations.forEach((conversation) => {
      console.log(
        `- ID: ${conversation.conversationId} | ${conversation.region} (${conversation.country}) | ${conversation.duration} | Status: ${conversation.status}`
      );
    });

    console.log("\nDatabase seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seed function
seedDatabase();
