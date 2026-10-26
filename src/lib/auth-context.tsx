"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authReady, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const ROLE_COLLECTIONS: Record<string, string> = {
  student: "students",
  trainer: "trainers",
  admin: "admins",
  sales: "sales",
  marketing: "marketing",
};

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
    let unsubscribe: (() => void) | undefined;
    let disposed = false;

    const startAuthListener = async () => {
      const auth = await authReady;
      if (disposed) return;
      if (!auth) {
        setLoading(false);
        return;
      }

      unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(true);

      if (user) {
        try {
          // Check if we already have the role in localStorage for instant loading
          const storedRole = localStorage.getItem("userRole");

          if (storedRole) {
            // Set role immediately for instant UI response
            setUserRole(storedRole);
            setLoading(false);

            // Verify the stored role is still valid in background
            const targetCollection = ROLE_COLLECTIONS[storedRole];

            if (targetCollection) {
              // Background verification without blocking UI
              const docRef = doc(db, targetCollection, user.uid);
              getDoc(docRef)
                .then((docSnap) => {
                  if (!docSnap.exists()) {
                    // Role invalid, clear and re-check
                    localStorage.removeItem("userRole");
                    checkAllCollections(user.uid);
                  } else {
                    // Check if user status is pending or inactive
                    const data = docSnap.data();
                    if (
                      data.status === "pending" ||
                      data.status === "inactive"
                    ) {
                      // User access is restricted, clear role
                      setUserRole(null);
                      localStorage.removeItem("userRole");
                    }
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
    };

    void startAuthListener();

    // Helper function to check all collections
    const checkAllCollections = async (uid: string) => {
      try {
        for (const [role, collection] of Object.entries(ROLE_COLLECTIONS)) {
          const docRef = doc(db, collection, uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // If user status is pending or inactive, don't set the role
            if (data.status === "pending" || data.status === "inactive") {
              setUserRole(null);
              localStorage.removeItem("userRole");
              setLoading(false);
              return;
            }

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
      disposed = true;
      unsubscribe?.();
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
