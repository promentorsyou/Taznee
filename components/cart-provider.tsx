"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CART_STORAGE_KEY,
  addItem,
  hasUnavailableItems,
  parseStoredCart,
  removeItem,
  setQuantity,
  subtotalCents,
  totalQuantity,
  type CartItem,
} from "@/lib/cart";
import { track } from "@/lib/analytics";

/**
 * Cart state container. Holds the line items, persists them to
 * localStorage, and exposes the drawer open/close state so any component
 * (product page, header) can pop the mini-cart.
 *
 * Hydration: the server (and the static export) has no localStorage, so the
 * first client render must match the server's empty cart. `hydrated` starts
 * false and flips after the mount effect reads storage — consumers use it
 * to avoid rendering a count that would mismatch the server HTML.
 */
interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  hasUnavailable: boolean;
  add: (item: CartItem) => void;
  update: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** The line most recently added — drives the "added to cart" confirmation. */
  lastAdded: CartItem | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);

  // Load the persisted cart once on mount. Runs only in the browser.
  //
  // The setState-in-effect rule is suppressed here deliberately:
  // localStorage is a browser-only external store that cannot be read
  // during render (the server has no localStorage), so reading it in an
  // effect is the only hydration-safe option. It runs once, not per render.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      setItems(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)));
    } catch {
      // Storage can throw in private mode / when disabled — degrade to an
      // in-memory cart rather than breaking the page.
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist on every change, but not before hydration (that would clobber
  // the stored cart with the initial empty array).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota/private-mode failures; the cart still works in memory.
    }
  }, [items, hydrated]);

  // Keep multiple open tabs in sync.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== CART_STORAGE_KEY) return;
      setItems(parseStoredCart(e.newValue));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Guards against a double-fire from an impatient double tap.
  const addLock = useRef(false);

  const add = useCallback((item: CartItem) => {
    if (addLock.current) return;
    addLock.current = true;
    window.setTimeout(() => {
      addLock.current = false;
    }, 300);

    setItems((current) => addItem(current, item));
    setLastAdded(item);
    setDrawerOpen(true);
    track("add_to_cart", {
      currency: "USD",
      value: (item.unitPriceCents * item.quantity) / 100,
      items: [
        {
          item_id: item.productSlug,
          item_name: item.name,
          item_variant: `${item.size} / ${item.color}`.trim(),
          quantity: item.quantity,
        },
      ],
    });
  }, []);

  const update = useCallback((id: string, quantity: number) => {
    setItems((current) => setQuantity(current, id, quantity));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => removeItem(current, id));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      count: totalQuantity(items),
      subtotal: subtotalCents(items),
      hasUnavailable: hasUnavailableItems(items),
      add,
      update,
      remove,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
      lastAdded,
    }),
    [items, hydrated, drawerOpen, lastAdded, add, update, remove, clear, openDrawer, closeDrawer],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
