# Chatbot Integration for Cyborg Robotics Academy

## Overview

This document explains the chatbot implementation that has been added to the Cyborg Robotics Academy website. The chatbot uses the existing Gemini API integration to provide an interactive assistant for visitors.

## Features

- Real-time conversation with AI assistant
- Context-aware responses based on conversation history
- Pre-configured to answer questions about:
  - Robotics courses and curriculum
  - FTC competitions and robotics programs
  - Student projects and learning paths
  - Technical concepts in robotics and programming
  - Academy events and activities

## Implementation Details

### 1. API Route

A new API route has been created at `/api/chatbot` that handles all chatbot interactions with the Gemini API.

### 2. Frontend Component

A floating chat widget has been implemented as a React component that can be easily added to any page.

### 3. Automatic Integration

The chatbot is automatically included on all pages through the main layout component.

## How It Works

1. Users click the chat icon (bottom-right corner) to open the chat interface
2. The chatbot greets users with a welcome message
3. Users can type questions about the academy
4. Messages are sent to the `/api/chatbot` endpoint
5. The API communicates with Gemini API to generate responses
6. Responses are displayed in the chat interface

## Customization

### Modifying Chatbot Personality

The chatbot's personality and knowledge base can be adjusted by modifying the system context in:
`src/app/api/chatbot/route.ts`

Look for the `systemContext` variable and update the text to change how the chatbot behaves.

### Styling

The chat widget's appearance can be customized by modifying:
`src/components/widgets/ChatBot.tsx`

### Position/Behavior

The chat widget's position and behavior can be adjusted in the same file.

## Troubleshooting

### Chatbot Not Responding

1. Check that `GEMINI_API_KEY` is set in your environment variables
2. Verify the API key has access to the `gemini-2.0-flash` model
3. Check browser console for any JavaScript errors

### Slow Responses

1. Gemini API responses may take a few seconds
2. Network connectivity issues may affect response time

## Future Enhancements

1. Add conversation history persistence
2. Implement typing indicators
3. Add support for rich responses (links, images, etc.)
4. Integrate with academy database for personalized responses
5. Add multilingual support
