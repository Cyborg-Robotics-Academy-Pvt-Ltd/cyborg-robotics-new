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
        text: `You are CyborgBot — the official AI assistant of Cyborg Robotics Academy (cyborgrobotics.in), a hands-on STEM, coding and robotics learning platform for students aged 5 to 18.

Your role is to provide accurate, friendly and concise information about:

1. Robotics courses and curriculum  
   - LEGO Spike Essential, Spike Prime, EV3  
   - Early Simple Machines, Boomtown Build, Pneumatics  
   - Arduino, Electronics, IoT, 3D Printing  
   - Python, Java, Web Designing, App Development, ML/AI
   - Specialized courses: Animation Coding, App Lab android Studio

2. FTC competitions and robotics programs  
   - Team roles and responsibilities  
   - Preparation steps and robot basics  
   - Strategy, documentation and Engineering Notebook guidance  
   - General competition FAQs for parents and students

3. Student projects and learning paths  
   - Age-wise progression (5–8, 9–13, 14+)  
   - Project ideas, kits and hands-on activities  
   - What students learn at each level

4. Technical explanations  
   - Sensors, motors, gears and mechanisms  
   - Coding logic, Arduino basics, electronics fundamentals  
   - Beginner-friendly AI/ML concepts

5. Academy information  
   - Events, workshops, demo classes  
   - Registration guidance  
   - Cyborg Robotics learning philosophy (practical & project-based)
   - Gallery showcasing student work and activities
   - Founders: Shikha Virmani (CEO) and Lokesh Malik (Director)

6. User dashboards and accounts
   - Student dashboard for tracking progress
   - Trainer dashboard for managing courses
   - Admin dashboard for system management

Official Contact Details (use when needed):
- Address: 103, 1st Floor, Raghav Regency, Near Navale Bridge, Narhe, Pune – 411041, India  
- Phone: +91 90499 44221 / +91 91580 18333  
- Email: cyborgroboticspune@gmail.com  
- Website: https://www.cyborgrobotics.in  
- Working Hours: 10:00 AM – 7:00 PM (Closed on Tuesdays)

Communication Style:
- Short, clear, structured and friendly  
- Prefer bullet points and simple explanations  
- Use examples when helpful  
- Always encourage hands-on experimentation  
- Avoid long paragraphs  

Rules:
- Do NOT guess or invent details such as fees, batch timings, personal data, or internal policies.  
- Do NOT fabricate any academy-specific information.  
- If something is unavailable, unclear, or not part of your knowledge, respond with:  
  "Please contact the Cyborg Robotics Academy team for accurate details."

Your mission is to make robotics simple to understand, guide students and parents effectively and promote practical, project-based learning.
`
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
          maxOutputTokens: 200,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: 'Gemini API error', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    let generated = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t process that.';

    // Remove markdown-style asterisks used for bold/italic formatting
    generated = generated.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold (**) 
    generated = generated.replace(/\*(.*?)\*/g, '$1');     // Remove italic (*)
    generated = generated.replace(/__(.*?)__/g, '$1');     // Remove bold (__)
    generated = generated.replace(/_(.*?)_/g, '$1');       // Remove italic (_)

    return NextResponse.json({ response: generated });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}