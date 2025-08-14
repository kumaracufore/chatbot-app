import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

// Define the conversation schema inline for this API
const conversationSchema = {
  conversationId: Number,
  totalConversation: String,
  duration: String,
  region: String,
  country: String,
  status: String,
  createdAt: Date,
};

export async function GET() {
  try {
    const db = await connectDB();
    const collection = db.connection.db.collection('conversations');
    
    const conversations = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST new conversation
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { conversationId, totalConversation, duration, region, country, status } = body;
    
    // Validate required fields
    if (!conversationId || !totalConversation || !duration || !region || !country) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({ conversationId });
    if (existingConversation) {
      return NextResponse.json(
        { error: 'Conversation with this ID already exists' },
        { status: 400 }
      );
    }
    
    const conversation = new Conversation({
      conversationId,
      totalConversation,
      duration,
      region,
      country,
      status: status || 'active',
    });
    
    await conversation.save();
    
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
