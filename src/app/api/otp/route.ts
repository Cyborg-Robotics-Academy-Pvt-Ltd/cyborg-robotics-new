import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in Firestore with expiration (10 minutes)
async function storeOTP(email: string, otp: string) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes
  
  const otpData = {
    email,
    otp,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString()
  };
  
  // Store OTP in a separate collection
  const otpRef = doc(collection(db, 'otps'));
  await setDoc(otpRef, otpData);
  
  return otpRef.id;
}

// Verify OTP
async function verifyOTP(email: string, otp: string) {
  const otpsRef = collection(db, 'otps');
  const q = query(otpsRef, where('email', '==', email), where('otp', '==', otp));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  const otpDoc = querySnapshot.docs[0];
  const otpData = otpDoc.data();
  
  // Check if OTP is expired
  const now = new Date();
  const expiresAt = new Date(otpData.expiresAt);
  
  if (now > expiresAt) {
    // Delete expired OTP
    await deleteDoc(otpDoc.ref);
    return { valid: false, message: 'OTP has expired' };
  }
  
  // Delete used OTP
  await deleteDoc(otpDoc.ref);
  
  return { valid: true, message: 'OTP verified successfully' };
}

export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    if (action === 'generate') {
      // Generate new OTP
      const otp = generateOTP();
      const otpId = await storeOTP(email, otp);
      
      // In a real application, you would send the OTP via email/SMS here
      // For now, we'll just return it (in production, don't do this)
      
      return NextResponse.json({ 
        success: true, 
        message: 'OTP generated successfully',
        otp // Remove this in production and send via email/SMS instead
      });
    } 
    else if (action === 'verify') {
      const { otp } = await request.json();
      
      if (!otp) {
        return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
      }
      
      const result = await verifyOTP(email, otp);
      
      if (result.valid) {
        return NextResponse.json({ 
          success: true, 
          message: result.message 
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: result.message 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('OTP API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}