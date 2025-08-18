import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    const mongoose = await connectDB();
    const collection = mongoose.connection.db?.collection('chat_history');
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // If sessionId is provided, filter by session_id
    if (sessionId) {
      const chatHistory = await collection
        .find({ session_id: sessionId })
        .sort({ timestamp: 1 })
        .toArray();
      
      return NextResponse.json(chatHistory);
    }
    
    // Otherwise, return all chat history
    const chatHistory = await collection.find({}).sort({ timestamp: -1 }).toArray();
    
    return NextResponse.json(chatHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

