import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import {
  generatePrnNumberAdmin,
  normalizeCenterLocation,
} from "@/lib/admin-prn";

// Function to create a single user with proper error handling
async function createSingleUser(userData: { fullName: string; email: string; password: string; role: string; center?: string }) {
  const { fullName, email, password, role, center } = userData;

  const user = await adminAuth.createUser({
    email,
    displayName: fullName,
    emailVerified: true,
    password,
  });

  // Create user document in Firestore with verified status and active role
  const firestoreUserData = {
    uid: user.uid,
    email: email,
    fullName: fullName,
    createdAt: FieldValue.serverTimestamp(),
    lastLogin: FieldValue.serverTimestamp(),
    status: "active", // Set status to active for admin-created accounts
    role: role, // Use selected role
    emailVerified: true, // Mark as verified since created by admin
    center: center || null, // Add center information for students
  };

  // Save to appropriate collection based on role
  const collectionName = `${role}s`; // students, trainers, admins
  await adminDb.collection(collectionName).doc(user.uid).set(firestoreUserData);
  
  // Generate PRN for students
  if (role === "student" && center) {
    try {
      const prnNumber = await generatePrnNumberAdmin(
        normalizeCenterLocation(center),
      );
      await adminDb.collection("students").doc(user.uid).set(
        { PrnNumber: prnNumber },
        { merge: true },
      );
    } catch (prnError) {
      console.error(`Error generating PRN for user ${user.uid}:`, prnError);
      // Don't fail the whole operation if PRN generation fails
    }
  }
  
  return { uid: user.uid, email, role };
}

export async function POST(request: NextRequest) {
  try {
    const { users, adminUid } = await request.json();

    // Verify that the requesting user is an admin by checking Firestore
    if (!adminUid) {
      return Response.json({ error: 'Admin UID is required' }, { status: 401 });
    }

    // Check if the admin user exists in the admins collection
    const adminSnapshot = await adminDb
      .collection("admins")
      .where("uid", "==", adminUid)
      .limit(1)
      .get();
    const adminById = await adminDb.collection("admins").doc(adminUid).get();
    if (adminSnapshot.empty && !adminById.exists) {
      return Response.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    // Validate input
    if (!users || !Array.isArray(users) || users.length === 0) {
      return Response.json({ error: 'Users array is required and cannot be empty' }, { status: 400 });
    }

    // Validate each user's data before starting creation
    for (const userData of users) {
      const { fullName, email, password, role, center } = userData;

      // Validate user data
      if (!fullName || !email || !password || !role) {
        return Response.json({ error: 'Each user must have fullName, email, password, and role' }, { status: 400 });
      }

      // Validate role
      const validRoles = ['student', 'trainer', 'admin'];
      if (!validRoles.includes(role)) {
        return Response.json({ error: `Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
      }

      // Validate center for students
      if (role === "student" && !center) {
        return Response.json({ error: 'Center is required for student accounts' }, { status: 400 });
      }
    }

    // Check for duplicate emails in the request
    const emails = users.map(user => user.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      return Response.json({ error: 'Duplicate email addresses found in the request' }, { status: 400 });
    }

    // Check if any of the users already exist in Firestore
    for (const userData of users) {
      const { email } = userData;
      const roles = ["student", "trainer", "admin"];
      let userExists = false;
      
      for (const checkRole of roles) {
        const querySnapshot = await adminDb
          .collection(`${checkRole}s`)
          .where("email", "==", email)
          .limit(1)
          .get();

        if (!querySnapshot.empty) {
          userExists = true;
          break;
        }
      }

      if (userExists) {
        return Response.json({ error: `User with email ${email} already exists` }, { status: 409 });
      }
    }

    // Create all users sequentially to avoid rate limiting issues
    const createdUsers = [];
    for (const userData of users) {
      try {
        const createdUser = await createSingleUser(userData);
        createdUsers.push(createdUser);
        
        // Add a small delay between user creations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Error creating user with email ${userData.email}:`, error);
        return Response.json({ error: `Failed to create user with email ${userData.email}: ${(error as Error).message}` }, { status: 500 });
      }
    }

    return Response.json({ 
      message: `Successfully created ${createdUsers.length} account(s)!`, 
      createdUsers 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating users:', error);
    
    // Return a generic error message
    return Response.json({ error: error.message || 'Failed to create users. Please try again.' }, { status: 500 });
  }
}
