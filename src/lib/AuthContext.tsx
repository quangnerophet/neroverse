"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";
import type { UserTier } from "./useUserTier";

type AuthState = {
  user: User | null;
  tier: UserTier;
  displayName: string;        // custom name stored in Firestore
  needsName: boolean;         // true right after first sign-in
  loading: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  tier: "free",
  displayName: "",
  needsName: false,
  loading: true,
  signIn: async () => {},
  signOutUser: async () => {},
  updateDisplayName: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [tier, setTier]               = useState<UserTier>("free");
  const [displayName, setDisplayName] = useState("");
  const [needsName, setNeedsName]     = useState(false);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap    = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setTier((data.tier as UserTier) ?? "free");
          setDisplayName(data.displayName || firebaseUser.displayName || "");
          // If they somehow have no name stored yet, ask again
          setNeedsName(!data.displayName);
        } else {
          // ── First-ever login: create stub, prompt for name ──
          await setDoc(userRef, {
            email:       firebaseUser.email,
            displayName: "",   // blank until user fills in
            tier:        "free",
            createdAt:   new Date().toISOString(),
          });
          setTier("free");
          setDisplayName("");
          setNeedsName(true); // trigger name modal
        }
      } else {
        setTier("free");
        setDisplayName("");
        setNeedsName(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    setTier("free");
    setDisplayName("");
    setNeedsName(false);
  };

  const updateDisplayName = async (name: string) => {
    if (!user) return;
    const trimmed = name.trim();
    await updateDoc(doc(db, "users", user.uid), { displayName: trimmed });
    setDisplayName(trimmed);
    setNeedsName(false);
  };

  return (
    <AuthContext.Provider value={{ user, tier, displayName, needsName, loading, signIn, signOutUser, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
