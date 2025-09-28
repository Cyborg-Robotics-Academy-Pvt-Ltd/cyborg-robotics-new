"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          // Check if we already have the role in localStorage for instant loading
          const storedRole = localStorage.getItem("userRole");

          if (storedRole) {
            // Set role immediately for instant UI response
            setUserRole(storedRole);
            setLoading(false);

            // Verify the stored role is still valid in background
            const roleMap = {
              students: "student",
              trainers: "trainer",
              admins: "admin",
            };

            const targetCollection = Object.keys(roleMap).find(
              (key) => roleMap[key as keyof typeof roleMap] === storedRole
            );

            if (targetCollection) {
              // Background verification without blocking UI
              const docRef = doc(db, targetCollection, user.uid);
              getDoc(docRef)
                .then((docSnap) => {
                  if (!docSnap.exists()) {
                    // Role invalid, clear and re-check
                    localStorage.removeItem("userRole");
                    checkAllCollections(user.uid);
                  }
                })
                .catch(() => {
                  // On error, fall back to checking all collections
                  checkAllCollections(user.uid);
                });
            }
            return; // Exit early with cached role
          }

          // No cached role, check all collections
          await checkAllCollections(user.uid);
        } catch (error) {
          console.error("Error checking user role:", error);
          setUserRole(null);
          setLoading(false);
        }
      } else {
        setUserRole(null);
        localStorage.removeItem("userRole");
        setLoading(false);
      }
    });

    // Helper function to check all collections
    const checkAllCollections = async (uid: string) => {
      try {
        const collections = ["students", "trainers", "admins"];
        for (const collection of collections) {
          const docRef = doc(db, collection, uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const role = collection.slice(0, -1); // Remove 's' from end
            setUserRole(role);
            localStorage.setItem("userRole", role);
            setLoading(false);
            return;
          }
        }
        // No role found
        setUserRole(null);
        setLoading(false);
      } catch (error) {
        console.error("Error in checkAllCollections:", error);
        setUserRole(null);
        setLoading(false);
      }
    };

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value = {
    user,
    userRole,
    loading,
    isAuthenticated: !!user && !!userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
