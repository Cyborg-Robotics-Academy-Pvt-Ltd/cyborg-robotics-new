import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'gemini-2.5-flash', generationConfig = {} } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const geminiModel = genAI.getGenerativeModel({ model });

    const result = await geminiModel.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        ...generationConfig,
      },
    });
    
    const response = await result.response;
    const text = response.text();

    return new Response(
      JSON.stringify({ success: true, text }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Handle specific Gemini API errors
    if (error.status === 429) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.', 
          message: error.message 
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate content', 
        message: error.message || 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ message: 'Gemini API endpoint. Use POST method with prompt.' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}