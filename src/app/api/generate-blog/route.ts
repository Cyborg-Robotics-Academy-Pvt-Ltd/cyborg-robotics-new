import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not set' }, { status: 500 });
    }

    // Add randomness to the prompt to get different responses
    const randomElements = [
      'focus on creativity',
      'emphasize perseverance', 
      'highlight innovation',
      'stress teamwork',
      'encourage curiosity',
      'promote problem-solving',
      'inspire learning',
      'motivate students',
      'celebrate technology',
      'foster growth mindset'
    ];
    
    const randomElement = randomElements[Math.floor(Math.random() * randomElements.length)];
    const enhancedPrompt = `${prompt} ${randomElement}. Make it unique and different from previous responses.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: enhancedPrompt }] }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: 'Gemini API error', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated.';

    return NextResponse.json({ generated });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 