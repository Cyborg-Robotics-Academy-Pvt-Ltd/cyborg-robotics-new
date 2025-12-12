// src/app/api/careers/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log incoming request for debugging
    console.log("Career Application API Request Body:", body);
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.position || !body.experience || !body.message) {
      return NextResponse.json(
        { error: "All fields are required: name, email, phone, position, experience and message" },
        { status: 400 }
      );
    }
    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Phone validation (basic)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(body.phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Create an email body with application details
    const emailBody = `
    <div style="font-family: Poppins, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <div style="background-color: #770B0E; color: white; padding: 15px; border-radius: 6px 6px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">New Career Application</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #eee;">
        <p style="margin: 8px 0;"><strong>Applicant Name:</strong> ${body.name}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> ${body.email}</p>
        <p style="margin: 8px 0;"><strong>Phone:</strong> ${body.phone}</p>
        <p style="margin: 8px 0;"><strong>Position Applied For:</strong> ${body.position}</p>
        <p style="margin: 8px 0;"><strong>Years of Experience:</strong> ${body.experience}</p>
        <p style="margin: 12px 0 8px;"><strong>Cover Letter:</strong></p>
        <p style="margin: 8px 0; padding: 12px; background-color: white; border-left: 4px solid #0066cc; border-radius: 4px;">${body.message}</p>
      </div>
      
      <div style="padding: 20px; background-color: white;">
        <div style="text-align: center; margin-bottom: 15px;">
          <h2 style="color: #770B0E; margin: 0; font-size: 22px;">Cyborg Robotics Academy Private Limited</h2>
          <p style="color: #666; font-style: italic; margin: 5px 0;">Transforming Education Through Technology</p>
        </div>
        
        <p style="line-height: 1.6; color: #333;">Based in Pune, we offer a wide range of technical courses, including Lego Robotics, Electronics, Arduino, IoT, Python, Java, Web Design, App Design, 3D Printing, Animation and Coding both in-person and online.</p>
        
        <p style="line-height: 1.6; color: #333;">Our programs emphasize a <strong style="color: #770B0E;">Learning by Doing</strong> approach, helping students develop problem-solving, decision-making and inquiry skills through hands-on experiences. Courses vary by age and include practical learning, building and programming robotic models while exploring real-life applications and concepts.</p>
        
        <div style="margin-top: 20px; text-align: center; padding-top: 15px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px; margin: 5px 0;">Contact us: <a href="mailto:info@cyborgroboticsacademy.com" style="color: #0066cc; text-decoration: none;">info@cyborgroboticsacademy.com</a></p>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">© 2025 Cyborg Robotics Academy . All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

    // Check if environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Missing EMAIL_USER or EMAIL_PASS environment variables");
      return NextResponse.json(
        { error: "Email configuration error. Please contact the administrator." },
        { status: 500 }
      );
    }

    // Log email configuration for debugging (without exposing passwords)
    console.log("Email configuration:", {
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASS,
      passwordLength: process.env.EMAIL_PASS?.length
    });

    // Create transporter with your Gmail credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log("Email transporter verified successfully");
    } catch (verifyError) {
      console.error("Email transporter verification failed:", verifyError);
      return NextResponse.json(
        { error: "Email service configuration error. Please contact the administrator." },
        { status: 500 }
      );
    }

    // Create the message object - sending FROM your app TO your email
    const message = {
      from: `"Career Application" <${process.env.EMAIL_USER}>`, // Use your app's email as the sender
      to: "cyborgroboticsacademypvtltd@gmail.com", // Your personal email
      replyTo: body.email, // Set reply-to as the user's email
      subject: `Career Application: ${body.position} from ${body.name}`,
      html: emailBody,
    };

    // Log message details (without exposing sensitive info)
    console.log("Sending career application email with details:", {
      from: message.from,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject
    });

    // Send the email
    const info = await transporter.sendMail(message);
    console.log("Career application email sent successfully:", info.messageId);
    
    return NextResponse.json(
      { message: "Career application submitted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error sending career application email:", error);
    return NextResponse.json(
      { error: "Failed to submit career application", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Handle GET requests to fetch career opportunities (optional)
export async function GET() {
  try {
    // In a real implementation, this would fetch from a database
    // For now, we'll return a static list of opportunities
    const careerOpportunities = [
      {
        id: 1,
        title: "Electronics Engineer",
        department: "Engineering",
        location: "Pune, India",
        type: "Full-time",
        description:
          "Design and develop electronic circuits for our robotics products. Work with cutting-edge technologies in IoT and embedded systems.",
        requirements: [
          "Bachelor's degree in Electronics Engineering or related field",
          "Experience with PCB design tools",
          "Knowledge of embedded systems programming",
          "Familiarity with IoT protocols",
        ],
      },
      {
        id: 2,
        title: "PCB Designer",
        department: "Engineering",
        location: "Pune, India",
        type: "Full-time",
        description:
          "Create printed circuit board layouts for our innovative robotics and IoT products. Collaborate with hardware and firmware teams.",
        requirements: [
          "Diploma/Degree in Electronics/Electrical Engineering",
          "Proficiency in Altium Designer or similar tools",
          "Understanding of high-frequency design principles",
          "Experience with multi-layer PCB design",
        ],
      },
      {
        id: 3,
        title: "Receptionist",
        department: "Administration",
        location: "Pune, India",
        type: "Full-time",
        description:
          "Be the first point of contact for our visitors and callers. Manage front desk operations and provide excellent customer service.",
        requirements: [
          "Graduate with excellent communication skills",
          "Proficient in MS Office",
          "Experience in customer service",
          "Pleasant and professional demeanor",
        ],
      },
      {
        id: 4,
        title: "Robotics Trainer",
        department: "Education",
        location: "Pune, India",
        type: "Full-time",
        description:
          "Teach robotics and programming to students of various age groups. Develop curriculum and conduct hands-on workshops.",
        requirements: [
          "Degree in Computer Science, Electronics or related field",
          "Experience in teaching or training",
          "Knowledge of robotics platforms (LEGO, Arduino, etc.)",
          "Strong communication skills",
        ],
      },
      {
        id: 5,
        title: "Web Developer",
        department: "Technology",
        location: "Pune, India",
        type: "Full-time",
        description:
          "Develop and maintain our web applications and educational platforms. Work with modern technologies like React and Next.js.",
        requirements: [
          "Bachelor's degree in Computer Science or related field",
          "Experience with React/Next.js",
          "Knowledge of TypeScript and modern JavaScript",
          "Understanding of responsive design principles",
        ],
      },
      {
        id: 6,
        title: "Content Writer",
        department: "Marketing",
        location: "Pune, India",
        type: "Full-time",
        description:
          "Create engaging content for our website, blog and educational materials. Focus on STEM education and technology topics.",
        requirements: [
          "Bachelor's degree in English, Journalism or related field",
          "Excellent writing and editing skills",
          "Understanding of SEO principles",
          "Interest in technology and education",
        ],
      },
    ];

    return NextResponse.json(
      { careerOpportunities },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching career opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch career opportunities", details: (error as Error).message },
      { status: 500 }
    );
  }
}