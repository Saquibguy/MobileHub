import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { cartService, wishlistService } from "../services";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const toastCtx = useToast();
  const showToast = toastCtx?.showToast || (() => {}); // no-op fallback if ToastProvider isn't mounted
  const [cart, setCart] = useState({ items: [] });
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || user.role !== "CUSTOMER") return;
    setLoading(true);
    try {
      const [c, w] = await Promise.all([cartService.get(), wishlistService.get()]);
      setCart(c.data);
      setWishlist(w.data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "CUSTOMER") refresh();
    else {
      setCart({ items: [] });
      setWishlist({ products: [] });
    }
  }, [user, refresh]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartService.add(productId, quantity);
      // The add/update/remove endpoints return items with raw product IDs only
      // (no populate), so re-fetch the populated cart to avoid rendering broken data.
      const res = await cartService.get();
      setCart(res.data);
      showToast("Added to cart");
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't add to cart.", "error");
    }
  };
  const updateCartItem = async (itemId, data) => {
    try {
      await cartService.update(itemId, data);
      const res = await cartService.get();
      setCart(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't update cart.", "error");
    }
  };
  const removeCartItem = async (itemId) => {
    try {
      await cartService.remove(itemId);
      const res = await cartService.get();
      setCart(res.data);
      showToast("Removed from cart");
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't remove item.", "error");
    }
  };
  const toggleWishlist = async (productId) => {
    try {
      const inList = wishlist.products.some((p) => (p._id || p) === productId);
      if (inList) await wishlistService.remove(productId);
      else await wishlistService.add(productId);
      // Same reasoning: add/remove return unpopulated product IDs, so re-fetch.
      const res = await wishlistService.get();
      setWishlist(res.data);
      showToast(inList ? "Removed from wishlist" : "Added to wishlist");
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't update wishlist.", "error");
    }
  };

  const cartCount = cart.items.filter((i) => !i.savedForLater).reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, wishlist, loading, refresh, addToCart, updateCartItem, removeCartItem, toggleWishlist, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
