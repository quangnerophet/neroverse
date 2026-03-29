"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { initialTopics, initialPosts, Topic, Post } from "./mockData";
import { db } from "./firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  orderBy,
  setDoc,
  increment,
} from "firebase/firestore";

export type SocialLink = {
  label: string;
  url: string;
};

export type SiteSettings = {
  footerLinks: SocialLink[];
  footerNote?: string;
};

type StoreState = {
  topics: Topic[];
  posts: Post[];
  siteSettings: SiteSettings;
  viewMode: "cards" | "list" | "masonry";
  sortOrder: "newest" | "oldest" | "mostliked";
  setViewMode: (mode: "cards" | "list" | "masonry") => void;
  setSortOrder: (order: "newest" | "oldest" | "mostliked") => void;
  addTopic: (name: string, parentId?: string) => Promise<void>;
  updateTopic: (id: string, name: string, parentId?: string) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  addPost: (topicId: string, excerpt: string, fullContent?: string, tags?: string[], createdAt?: string, title?: string, tier?: 'free'|'premium'|'vip', imageUrl?: string) => Promise<void>;
  updatePost: (id: string, topicId: string, excerpt: string, fullContent?: string, tags?: string[], createdAt?: string, title?: string, tier?: 'free'|'premium'|'vip', imageUrl?: string) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  updateSiteSettings: (settings: SiteSettings) => Promise<void>;
  isPricingModalOpen: boolean;
  setPricingModalOpen: (open: boolean) => void;
};

const StoreContext = createContext<StoreState | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  footerLinks: [],
  footerNote: "",
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [viewMode, setViewMode] = useState<"cards" | "list" | "masonry">("cards");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "mostliked">("newest");
  const [isPricingModalOpen, setPricingModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync Topics from Firestore
  useEffect(() => {
    const q = query(collection(db, "topics"), orderBy("name"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty && !isHydrated) {
        console.log("Migrating initial topics to Firestore...");
        for (const topic of initialTopics) {
          await setDoc(doc(db, "topics", topic.id), topic);
        }
      } else {
        const topicsData = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id
        })) as Topic[];
        setTopics(topicsData);
      }
    });
    return () => unsubscribe();
  }, [isHydrated]);

  // Sync Posts from Firestore
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty && !isHydrated) {
        console.log("Migrating initial posts to Firestore...");
        for (const post of initialPosts) {
          await setDoc(doc(db, "posts", post.id), post);
        }
      } else {
        const postsData = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id
        })) as Post[];
        setPosts(postsData);
      }
      setIsHydrated(true);
    });
    return () => unsubscribe();
  }, [isHydrated]);

  // Sync Site Settings from Firestore
  useEffect(() => {
    const settingsRef = doc(db, "settings", "site");
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSiteSettings(snapshot.data() as SiteSettings);
      }
    });
    return () => unsubscribe();
  }, []);

  // UI settings persistence
  useEffect(() => {
    const savedViewMode = localStorage.getItem("nero_view_mode");
    if (savedViewMode === "masonry" || savedViewMode === "list") setViewMode(savedViewMode);
    const savedSort = localStorage.getItem("nero_sort_order");
    if (savedSort === "newest" || savedSort === "oldest" || savedSort === "mostliked") setSortOrder(savedSort);
  }, []);

  useEffect(() => { localStorage.setItem("nero_view_mode", viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem("nero_sort_order", sortOrder); }, [sortOrder]);

  const addTopic = async (name: string, parentId?: string) => {
    const newTopic = {
      name,
      ...(parentId ? { parentId } : {}),
    };
    await addDoc(collection(db, "topics"), newTopic);
  };

  const updateTopic = async (id: string, name: string, parentId?: string) => {
    const topicRef = doc(db, "topics", id);
    await updateDoc(topicRef, {
      name,
      ...(parentId ? { parentId } : { parentId: null }),
    });
  };

  const deleteTopic = async (id: string) => {
    await deleteDoc(doc(db, "topics", id));
  };

  const addPost = async (topicId: string, excerpt: string, fullContent?: string, tags?: string[], createdAt?: string, title?: string, tier: 'free' | 'premium' | 'vip' = 'free', imageUrl?: string) => {
    const newPost = {
      topicId,
      title: title || "",
      excerpt,
      fullContent: fullContent || "",
      tags: tags && tags.length > 0 ? tags : [],
      createdAt: createdAt || new Date().toISOString(),
      likes: Math.floor(Math.random() * 51) + 50,
      tier,
      imageUrl: imageUrl || "",
    };
    await addDoc(collection(db, "posts"), newPost);
  };

  const updatePost = async (id: string, topicId: string, excerpt: string, fullContent?: string, tags?: string[], createdAt?: string, title?: string, tier: 'free' | 'premium' | 'vip' = 'free', imageUrl?: string) => {
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
      topicId,
      title: title || "",
      excerpt,
      fullContent: fullContent || "",
      tags: tags && tags.length > 0 ? tags : [],
      createdAt: createdAt || new Date().toISOString(),
      tier,
      imageUrl: imageUrl || "",
    });
  };

  const likePost = async (id: string) => {
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, { likes: increment(1) });
  };

  const updateSiteSettings = async (settings: SiteSettings) => {
    const settingsRef = doc(db, "settings", "site");
    await setDoc(settingsRef, settings, { merge: true });
  };

  return (
    <StoreContext.Provider value={{ 
      topics, posts, siteSettings, viewMode, sortOrder, setViewMode, setSortOrder,
      addTopic, updateTopic, deleteTopic, 
      addPost, updatePost, likePost,
      updateSiteSettings,
      isPricingModalOpen,
      setPricingModalOpen,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
