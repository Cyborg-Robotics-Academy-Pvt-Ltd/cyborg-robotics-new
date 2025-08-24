"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../firebaseConfig";
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          // Check if we already have the role in localStorage
          const storedRole = localStorage.getItem("userRole");

          if (storedRole) {
            // Verify the stored role is still valid
            const roleMap = {
              students: "student",
              trainers: "trainer",
              admins: "admin",
            };

            const targetCollection = Object.keys(roleMap).find(
              (key) => roleMap[key as keyof typeof roleMap] === storedRole
            );

            if (targetCollection) {
              const docRef = doc(db, targetCollection, user.uid);
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                setUserRole(storedRole);
                setLoading(false);
                return;
              }
            }
          }

          // If no stored role or invalid, check all collections
          const collections = ["students", "trainers", "admins"];
          for (const collection of collections) {
            const docRef = doc(db, collection, user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const role = collection.slice(0, -1); // Remove 's' from end
              setUserRole(role);
              localStorage.setItem("userRole", role);
              break;
            }
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
        localStorage.removeItem("userRole");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userRole,
    loading,
    isAuthenticated: !!user && !!userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
