import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import { AiModelType, UserProfile } from "../types";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  userApiKey: string;
  preferredModel: AiModelType;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveApiKey: (key: string) => Promise<void>;
  setPreferredModel: (model: AiModelType) => Promise<void>;
  isApiKeyModalOpen: boolean;
  setIsApiKeyModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_API_KEY = "utfc_user_gemini_api_key";
const LOCAL_STORAGE_KEY_MODEL = "utfc_user_preferred_model";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY) || "";
  });
  const [preferredModel, setPreferredModelState] = useState<AiModelType>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_MODEL);
    return saved === "gemini-3.8-flash" ? "gemini-3.8-flash" : "gemini-3.1-flash-lite";
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserProfile;
            setUserProfile(data);
            if (data.geminiApiKey) {
              setUserApiKey(data.geminiApiKey);
              localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, data.geminiApiKey);
            }
            if (data.preferredModel) {
              setPreferredModelState(data.preferredModel);
              localStorage.setItem(LOCAL_STORAGE_KEY_MODEL, data.preferredModel);
            }
          } else {
            // Initialize new user profile document
            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || "",
              displayName: user.displayName || "Mahasiswa UT",
              photoURL: user.photoURL || undefined,
              preferredModel: "gemini-3.1-flash-lite",
              geminiApiKey: userApiKey || undefined,
            };
            await setDoc(userDocRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            });
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error("Error loading user profile from Firestore:", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userApiKey]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error: any) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const saveApiKey = async (key: string) => {
    const trimmed = key.trim();
    setUserApiKey(trimmed);
    localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, trimmed);

    if (currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(
          userDocRef,
          {
            geminiApiKey: trimmed,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        setUserProfile((prev) => (prev ? { ...prev, geminiApiKey: trimmed } : null));
      } catch (err) {
        console.error("Error updating API key in Firestore:", err);
      }
    }
  };

  const setPreferredModel = async (model: AiModelType) => {
    setPreferredModelState(model);
    localStorage.setItem(LOCAL_STORAGE_KEY_MODEL, model);

    if (currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(
          userDocRef,
          {
            preferredModel: model,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        setUserProfile((prev) => (prev ? { ...prev, preferredModel: model } : null));
      } catch (err) {
        console.error("Error updating preferred model in Firestore:", err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        userApiKey,
        preferredModel,
        loginWithGoogle,
        logout,
        saveApiKey,
        setPreferredModel,
        isApiKeyModalOpen,
        setIsApiKeyModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
