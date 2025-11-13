import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

/**
 * Creates an admin user document in Firestore
 * @param uid - Firebase user UID
 * @param email - User's email address
 * @param name - User's full name
 * @param username - User's username (optional)
 * @returns Promise<void>
 */
export const createAdminUser = async (
  uid: string,
  email: string,
  name: string,
  username?: string
): Promise<void> => {
  try {
    const adminDocRef = doc(db, "admins", uid);
    await setDoc(adminDocRef, {
      email,
      name,
      username: username || "",
      role: "admin",
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw new Error("Failed to create admin user");
  }
};

/**
 * Checks if an admin user document exists in Firestore
 * @param uid - Firebase user UID
 * @returns Promise<boolean> - true if admin document exists, false otherwise
 */
export const isAdminUser = async (uid: string): Promise<boolean> => {
  try {
    const adminDocRef = doc(db, "admins", uid);
    const adminDoc = await getDoc(adminDocRef);
    return adminDoc.exists();
  } catch (error) {
    console.error("Error checking admin user:", error);
    return false;
  }
};

/**
 * Gets admin user data from Firestore
 * @param uid - Firebase user UID
 * @returns Promise<object | null> - Admin data or null if not found
 */
export const getAdminUserData = async (uid: string): Promise<any | null> => {
  try {
    const adminDocRef = doc(db, "admins", uid);
    const adminDoc = await getDoc(adminDocRef);
    
    if (adminDoc.exists()) {
      return { id: adminDoc.id, ...adminDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching admin user data:", error);
    return null;
  }
};