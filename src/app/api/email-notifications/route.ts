import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmailSubscription from '@/models/EmailSubscription';

export async function GET() {
  try {
    await connectDB();
    const subscriptions = await EmailSubscription.find({}).sort({ createdAt: -1 });
    return NextResponse.json(subscriptions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email, isSubscribed } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const existingSubscription = await EmailSubscription.findOne({ email });
    
    if (existingSubscription) {
      existingSubscription.isSubscribed = isSubscribed !== undefined ? isSubscribed : true;
      await existingSubscription.save();
      return NextResponse.json(existingSubscription);
    } else {
      const newSubscription = new EmailSubscription({
        email,
        isSubscribed: isSubscribed !== undefined ? isSubscribed : true,
      });
      await newSubscription.save();
      return NextResponse.json(newSubscription, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
