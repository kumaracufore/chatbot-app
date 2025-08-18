import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function PUT(request: NextRequest) {
  try {
    const mongoose = await connectDB();
    const { sessionId, flagStatus } = await request.json();
    
    console.log('PUT request received:', { sessionId, flagStatus });
    
    if (!sessionId || !flagStatus) {
      return NextResponse.json(
        { error: 'Session ID and flag status are required' },
        { status: 400 }
      );
    }
    
    if (!['pending', 'incomplete', 'complete'].includes(flagStatus)) {
      return NextResponse.json(
        { error: 'Invalid flag status' },
        { status: 400 }
      );
    }
    
    // Use direct collection access like sessions API
    const collection = mongoose.connection.db?.collection('conversation_flags');
    
    if (!collection) {
      throw new Error('Database connection not available');
    }
    
    // Update or insert flag status
    const result = await collection.updateOne(
      { sessionId },
      { 
        $set: { 
          sessionId,
          flagStatus,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log('Database update result:', result);
    
    return NextResponse.json({
      success: true,
      sessionId,
      flagStatus,
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    });
    
  } catch (error) {
    console.error('Error updating conversation status:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation status' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const mongoose = await connectDB();
    const collection = mongoose.connection.db?.collection('conversation_flags');
    
    if (!collection) {
      throw new Error('Database connection not available');
    }
    
    const flags = await collection.find({}).toArray();
    console.log('Retrieved flags from DB:', flags);
    
    const statusMap = flags.reduce((acc, flag) => {
      acc[flag.sessionId] = flag.flagStatus;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json(statusMap);
    
  } catch (error) {
    console.error('Error fetching conversation statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation statuses' },
      { status: 500 }
    );
  }
}
