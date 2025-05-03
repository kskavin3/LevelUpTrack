import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Conversation } from '@/lib/models';

// GET all conversations
export async function GET() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Fetch all conversations, sorted by most recent
    const conversations = await Conversation.find({})
      .sort({ updatedAt: -1 })
      .select('title lastMessage createdAt updatedAt');
    
    return NextResponse.json({
      success: true,
      conversations: conversations.map(conv => ({
        id: conv._id.toString(),
        title: conv.title,
        lastMessage: conv.lastMessage,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST to create a new conversation
export async function POST(request) {
  try {
    const { title, messages } = await request.json();
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Create a new conversation
    const newConversation = new Conversation({
      title,
      messages,
      lastMessage: messages.length > 0 ? 
        (messages[messages.length - 1].content.substring(0, 50) + 
        (messages[messages.length - 1].content.length > 50 ? '...' : '')) : 
        ''
    });
    
    // Save to database
    const savedConversation = await newConversation.save();
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: savedConversation._id.toString(),
        title: savedConversation.title,
        lastMessage: savedConversation.lastMessage,
        createdAt: savedConversation.createdAt,
        updatedAt: savedConversation.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
} 