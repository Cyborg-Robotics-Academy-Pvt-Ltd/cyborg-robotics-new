import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Center prefix mapping
const CENTER_PREFIXES = {
  "KALYANI NAGAR": "KN",
  "VIMAN NAGAR": "VN",
  "kalyani nagar": "KN",
  "viman nagar": "VN",
} as const;

export type CenterLocation = keyof typeof CENTER_PREFIXES;
export type CenterPrefix = typeof CENTER_PREFIXES[CenterLocation];

/**
 * Generate a unique PRN number with center prefix
 * @param center - The center location (Kalyani Nagar or Viman Nagar)
 * @returns Promise<string> - The generated PRN number (e.g., "CRAKN1001" or "CRAVN1001")
 * Note: Both centers start from 1001
 */
export async function generatePrnNumber(center: CenterLocation): Promise<string> {
  const prefix = CENTER_PREFIXES[center];
  if (!prefix) {
    throw new Error(`Invalid center location: ${center}. Valid options are: Kalyani Nagar, Viman Nagar`);
  }

  try {
    // Query all students to find the highest number for this specific center
    const studentsRef = collection(db, "students");
    const allStudentsSnapshot = await getDocs(studentsRef);
    
    let maxNumber = 0;
    
    // Find the highest number for this center prefix
    allStudentsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const prn = data.PrnNumber;
      
      if (prn && typeof prn === 'string' && prn.startsWith(`CRA${prefix}`)) {
        // Extract the number part (e.g., from "CRAKN1001" extract "1001")
        const numberPart = prn.replace(`CRA${prefix}`, '');
        const number = parseInt(numberPart, 10);
        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    // If no existing numbers found for this center, start from 1000
    // This ensures both centers start from 1001 (1000 + 1)
    if (maxNumber === 0) {
      maxNumber = 1000;
    }
    
    // Generate next number
    const nextNumber = maxNumber + 1;
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    
    return `CRA${prefix}${formattedNumber}`;
  } catch (error) {
    console.error("Error generating PRN number:", error);
    throw new Error("Failed to generate PRN number");
  }
}

/**
 * Check if a PRN number already exists
 * @param prnNumber - The PRN number to check
 * @returns Promise<boolean> - True if PRN exists, false otherwise
 */
export async function isPrnExists(prnNumber: string): Promise<boolean> {
  try {
    const studentsRef = collection(db, "students");
    const prnQuery = query(studentsRef, where("PrnNumber", "==", prnNumber));
    const prnSnapshot = await getDocs(prnQuery);
    return !prnSnapshot.empty;
  } catch (error) {
    console.error("Error checking PRN existence:", error);
    return false;
  }
}

/**
 * Assign PRN to a student document
 * @param studentId - The student document ID
 * @param prnNumber - The PRN number to assign
 */
export async function assignPrnToStudent(studentId: string, prnNumber: string): Promise<void> {
  try {
    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, {
      PrnNumber: prnNumber
    });
  } catch (error) {
    console.error("Error assigning PRN to student:", error);
    throw new Error("Failed to assign PRN to student");
  }
}

/**
 * Get center prefix from location string
 * @param location - The location string
 * @returns CenterPrefix | null - The center prefix or null if not found
 */
export function getCenterPrefix(location: string): CenterPrefix | null {
  const normalizedLocation = location.trim().toUpperCase();
  
  // Exact match
  if (normalizedLocation in CENTER_PREFIXES) {
    return CENTER_PREFIXES[normalizedLocation as CenterLocation];
  }
  
  // Partial match
  if (normalizedLocation.includes("KALYANI") || normalizedLocation.includes("KN")) {
    return "KN";
  }
  
  if (normalizedLocation.includes("VIMAN") || normalizedLocation.includes("VN")) {
    return "VN";
  }
  
  return null;
}

/**
 * Automatically generate and assign PRN when student status becomes active
 * This should be called when:
 * 1. Individual signup is approved (status changes from pending to active)
 * 2. Admin creates accounts (bulk creation)
 * @param studentId - The student document ID
 * @param location - The center location
 */
export async function autoGenerateAndAssignPrn(studentId: string, location: string): Promise<string> {
  try {
    // Get student document
    const studentRef = doc(db, "students", studentId);
    const studentDoc = await getDoc(studentRef);
    
    if (!studentDoc.exists()) {
      throw new Error("Student document not found");
    }
    
    const studentData = studentDoc.data();
    
    // Check if PRN already exists
    if (studentData.PrnNumber) {
      return studentData.PrnNumber;
    }
    
    // Get center prefix
    const centerPrefix = getCenterPrefix(location);
    if (!centerPrefix) {
      throw new Error(`Invalid center location: ${location}`);
    }
    
    // Map to center location key
    let centerLocation: CenterLocation = "KALYANI NAGAR";
    if (centerPrefix === "VN") {
      centerLocation = "VIMAN NAGAR";
    }
    
    // Generate PRN
    const prnNumber = await generatePrnNumber(centerLocation);
    
    // Check if generated PRN already exists (sanity check)
    const exists = await isPrnExists(prnNumber);
    if (exists) {
      throw new Error("Generated PRN already exists - this should not happen");
    }
    
    // Assign PRN to student
    await assignPrnToStudent(studentId, prnNumber);
    
    return prnNumber;
  } catch (error) {
    console.error("Error in autoGenerateAndAssignPrn:", error);
    throw error;
  }
}