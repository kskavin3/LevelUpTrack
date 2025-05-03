import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Conversation } from '@/lib/models';
import mongoose from 'mongoose';

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

// GET a specific conversation with all messages
export async function GET(request, context) {
  try {
    // Await params before accessing its properties
    const { params } = context;
    const id = params.id;
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }
    
    // Find the conversation
    const conversation = await Conversation.findById(id);
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error(`Error fetching conversation:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

// PUT to update a conversation (add messages)
export async function PUT(request, context) {
  try {
    // Await params before accessing its properties
    const { params } = context;
    const id = params.id;
    
    const { messages, title } = await request.json();
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }
    
    // Find and update the conversation
    const conversation = await Conversation.findById(id);
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Update fields if provided
    if (messages) {
      conversation.messages = messages;
      // Update last message preview
      if (messages.length > 0) {
        conversation.lastMessage = getLastMessagePreview(messages);
      }
    }
    
    if (title) {
      conversation.title = title;
    }
    
    // Save changes
    await conversation.save();
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error(`Error updating conversation:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

// DELETE a conversation
export async function DELETE(request, context) {
  try {
    // Await params before accessing its properties
    const { params } = context;
    const id = params.id;
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }
    
    // Find and delete the conversation
    const result = await Conversation.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting conversation:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
} 