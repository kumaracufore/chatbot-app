import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function GET() {
  try {
    await connectDB();
    
    // Group conversations by sessionId using MongoDB aggregation
    const groupedConversations = await Conversation.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$sessionId',
          sessionId: { $first: '$sessionId' },
          conversations: { 
            $push: {
              conversationId: '$conversationId',
              totalConversation: '$totalConversation',
              duration: '$duration',
              region: '$region',
              country: '$country',
              status: '$status',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt'
            }
          },
          totalConversations: { $sum: 1 },
          latestConversation: { $first: '$createdAt' },
          totalDuration: { $sum: { $toInt: { $substr: ['$duration', 0, -1] } } } // Assuming duration is like "5m"
        }
      },
      {
        $sort: { latestConversation: -1 }
      },
      {
        $project: {
          _id: 0,
          sessionId: 1,
          conversations: 1,
          totalConversations: 1,
          latestConversation: 1,
          totalDuration: { $concat: [{ $toString: '$totalDuration' }, 'm'] }
        }
      }
    ]);
    
    return NextResponse.json(groupedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { conversationId, sessionId, totalConversation, duration, region, country, status } = body;
    
    // Validate required fields
    if (!conversationId || !sessionId || !totalConversation || !duration || !region || !country) {
      return NextResponse.json(
        { error: 'All fields including sessionId are required' },
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
      sessionId,
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
