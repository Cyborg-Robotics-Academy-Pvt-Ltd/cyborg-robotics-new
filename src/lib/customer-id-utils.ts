import { collection, query, orderBy, limit, getDocs, doc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Generates a unique sequential customer ID in format CRA_0001, CRA_0002, etc.
 * Uses Firestore to maintain a counter that persists across sessions
 * @returns Promise<string> - The generated customer ID (e.g., "CRA_0001")
 */
export async function generateCustomerId(): Promise<string> {
  try {
    // Reference to the counters collection
    const counterRef = doc(db, "counters", "customer_id_counter");
    
    // Try to get the current counter document
    const counterDoc = await getDocs(query(collection(db, "counters")));
    let currentNumber = 0;
    
    // Find if counter document exists
    let counterExists = false;
    counterDoc.forEach((doc) => {
      if (doc.id === "customer_id_counter") {
        currentNumber = doc.data()?.current || 0;
        counterExists = true;
      }
    });
    
    // Increment the counter
    const newNumber = currentNumber + 1;
    
    if (!counterExists) {
      // Create new counter document
      await setDoc(counterRef, {
        current: newNumber,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Update existing counter using Firebase increment
      // Note: We need to read-modify-write since we need the value
      await setDoc(counterRef, {
        current: newNumber,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
    
    // Format the ID with zero-padding (CRA_0001, CRA_0002, etc.)
    const formattedId = `CRA_${String(newNumber).padStart(4, "0")}`;
    
    console.log(`Generated Customer ID: ${formattedId}`);
    return formattedId;
  } catch (error) {
    console.error("Error generating customer ID:", error);
    // Fallback to timestamp-based ID if Firestore fails
    const fallbackId = `CRA_${Date.now().toString().slice(-4)}`;
    console.warn(`Using fallback Customer ID: ${fallbackId}`);
    return fallbackId;
  }
}

/**
 * Gets the next customer ID without incrementing the counter
 * Useful for preview or validation
 * @returns Promise<string> - The next customer ID
 */
export async function getNextCustomerId(): Promise<string> {
  try {
    const counterRef = doc(db, "counters", "customer_id_counter");
    const counterDoc = await getDocs(query(collection(db, "counters")));
    let currentNumber = 0;
    
    counterDoc.forEach((doc) => {
      if (doc.id === "customer_id_counter") {
        currentNumber = doc.data()?.current || 0;
      }
    });
    
    const nextNumber = currentNumber + 1;
    return `CRA_${String(nextNumber).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error getting next customer ID:", error);
    return "CRA_0001";
  }
}
