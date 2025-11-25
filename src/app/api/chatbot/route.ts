import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not set' }, { status: 500 });
    }

    // Add system context for the chatbot as the first message
    const systemContext = {
      role: "user",
      parts: [{
        text: `You are an AI assistant for Cyborg Robotics Academy, a robotics education platform. 
        Your role is to help users with questions about:
        1. Robotics courses and curriculum
        2. FTC competitions and robotics programs
        3. Student projects and learning paths
        4. Technical concepts in robotics and programming
        5. Academy events and activities
        
        Keep responses concise, friendly, and educational. 
        If you don't know something, suggest contacting the academy team.
        Always encourage hands-on learning and experimentation.
        Keep answers brief and to the point. Use bullet points when appropriate.`
      }]
    };

    // Prepare the conversation history for Gemini
    const conversationHistory = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Combine system context with conversation history
    const contents = [systemContext, ...conversationHistory];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: 'Gemini API error', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t process that.';

    return NextResponse.json({ response: generated });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}