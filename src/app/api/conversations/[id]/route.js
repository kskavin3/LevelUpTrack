import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Conversation } from '@/lib/models';
import mongoose from 'mongoose';

// GET a specific conversation with all messages
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
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
    console.error(`Error fetching conversation ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

// PUT to update a conversation (add messages)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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
        const lastMessageContent = 
          typeof messages[messages.length - 1].content === 'string' 
            ? messages[messages.length - 1].content 
            : 'Updated conversation';
        
        conversation.lastMessage = lastMessageContent.substring(0, 50) + 
          (lastMessageContent.length > 50 ? '...' : '');
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
    console.error(`Error updating conversation ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

// DELETE a conversation
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
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
    console.error(`Error deleting conversation ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
} 