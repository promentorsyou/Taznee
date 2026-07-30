"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  WISHLIST_STORAGE_KEY,
  isSaved,
  parseStoredWishlist,
  removeItem,
  toggleItem,
  type WishlistItem,
} from "@/lib/wishlist";
import { track } from "@/lib/analytics";

/**
 * Saved-items state container, mirroring CartProvider: localStorage-backed,
 * guest-first, hydration-safe. `hydrated` stays false until the mount
 * effect has read storage, so consumers never render a saved-state that
 * would mismatch the server HTML.
 */
interface WishlistContextValue {
  items: WishlistItem[];
  hydrated: boolean;
  count: number;
  saved: (slug: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (slug: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // localStorage is a browser-only external store; reading it during render
  // would break hydration, so this one-time sync happens after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      setItems(parseStoredWishlist(window.localStorage.getItem(WISHLIST_STORAGE_KEY)));
    } catch {
      // Private mode / storage disabled — degrade to an in-memory list.
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota failures; the list still works for this session.
    }
  }, [items, hydrated]);

  // Keep multiple open tabs in sync.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== WISHLIST_STORAGE_KEY) return;
      setItems(parseStoredWishlist(e.newValue));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((current) => {
      const wasSaved = isSaved(current, item.slug);
      if (!wasSaved) {
        track("add_to_wishlist", {
          currency: "USD",
          value: item.basePriceCents / 100,
          items: [{ item_id: item.slug, item_name: item.name }],
        });
      }
      return toggleItem(current, item);
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((current) => removeItem(current, slug));
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      hydrated,
      count: items.length,
      saved: (slug: string) => isSaved(items, slug),
      toggle,
      remove,
    }),
    [items, hydrated, toggle, remove],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
