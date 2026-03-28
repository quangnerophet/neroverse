"use client";

import { useState, useEffect } from "react";

export type UserTier = "free" | "premium" | "vip";

const TIER_LEVELS: Record<UserTier, number> = { free: 0, premium: 1, vip: 2 };
const STORAGE_KEY = "nero_user_tier";

/** Check if a user's tier can read a post's tier. */
export function canRead(postTier: string | undefined, userTier: UserTier): boolean {
  const requiredLevel = TIER_LEVELS[(postTier as UserTier) ?? "free"] ?? 0;
  return TIER_LEVELS[userTier] >= requiredLevel;
}

/** Hook to manage the simulated user tier. */
export function useUserTier() {
  const [tier, setTierState] = useState<UserTier>("free");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as UserTier | null;
    if (saved && saved in TIER_LEVELS) setTierState(saved);
  }, []);

  const setTier = (t: UserTier) => {
    setTierState(t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  return { tier, setTier };
}
