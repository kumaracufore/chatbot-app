import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    const mongoose = await connectDB();
    const collection = mongoose.connection.db?.collection('sessions');
    
    if (!collection) {
      throw new Error('Database connection not available');
    }
    
    const sessions = await collection.find({}).sort({ created_at: -1 }).toArray();
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}