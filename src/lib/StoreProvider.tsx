"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { initialTopics, initialPosts, Topic, Post } from "./mockData";

type StoreState = {
  topics: Topic[];
  posts: Post[];
  viewMode: "masonry" | "list";
  setViewMode: (mode: "masonry" | "list") => void;
  addTopic: (name: string, parentId?: string) => void;
  addPost: (topicId: string, excerpt: string, fullContent?: string, tags?: string[], createdAt?: string, title?: string) => void;
  updatePost: (id: string, topicId: string, excerpt: string, fullContent?: string, tags?: string[], createdAt?: string, title?: string) => void;
};

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [viewMode, setViewMode] = useState<"masonry" | "list">("masonry");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTopics = localStorage.getItem("nero_topics");
    const savedPosts = localStorage.getItem("nero_posts");
    const savedViewMode = localStorage.getItem("nero_view_mode");
    
    if (savedTopics) setTopics(JSON.parse(savedTopics));
    if (savedPosts) setPosts(JSON.parse(savedPosts));
    if (savedViewMode === "masonry" || savedViewMode === "list") setViewMode(savedViewMode);
    
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("nero_topics", JSON.stringify(topics));
      localStorage.setItem("nero_posts", JSON.stringify(posts));
      localStorage.setItem("nero_view_mode", viewMode);
    }
  }, [topics, posts, viewMode, isHydrated]);

  const addTopic = (name: string, parentId?: string) => {
    const newTopic: Topic = {
      id: Date.now().toString(),
      name,
      ...(parentId ? { parentId } : {}),
    };
    setTopics((prev) => [...prev, newTopic]);
  };

  const addPost = (topicId: string, excerpt: string, fullContent?: string, tags?: string[], createdAt?: string, title?: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      topicId,
      title,
      excerpt,
      ...(fullContent ? { fullContent } : {}),
      ...(tags && tags.length > 0 ? { tags } : {}),
      createdAt: createdAt || new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (id: string, topicId: string, excerpt: string, fullContent?: string, tags?: string[], createdAt?: string, title?: string) => {
    setPosts((prev) => prev.map(post => 
      post.id === id 
        ? { 
            ...post, 
            topicId, 
            title,
            excerpt, 
            fullContent: fullContent || undefined, 
            tags: tags && tags.length > 0 ? tags : undefined,
            createdAt: createdAt || post.createdAt
          } 
        : post
    ));
  };

  return (
    <StoreContext.Provider value={{ topics, posts, viewMode, setViewMode, addTopic, addPost, updatePost }}>
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
