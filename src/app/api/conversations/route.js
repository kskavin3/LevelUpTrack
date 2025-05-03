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

// Helper function to get a safe preview of the last message content
const getLastMessagePreview = (messages) => {
  if (!messages || messages.length === 0) return '';
  
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content;
  
  // Handle different types of content
  if (typeof content === 'string') {
    // If content is a string, use substring
    return content.substring(0, 50) + (content.length > 50 ? '...' : '');
  } else if (typeof content === 'object') {
    // If content is an object (like playlist data), use the message type
    return lastMessage.type ? `${lastMessage.type} data` : 'Complex message';
  } else {
    // Fallback for any other content type
    return 'New message';
  }
};

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
      lastMessage: getLastMessagePreview(messages)
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