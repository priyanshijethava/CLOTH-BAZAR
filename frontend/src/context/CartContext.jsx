
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { API_URL } from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const { user, loading } = useAuth();

  const loadedUserId = useRef(null);

  // Load Cart from MongoDB
  useEffect(() => {
    let cancelled = false;

    const loadCart = async () => {
      if (loading) return;

      if (!user) {
        loadedUserId.current = null;
        setCartItems([]);
        return;
      }

      loadedUserId.current = null;

      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${API_URL}/users/shop-data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load cart");
        }

        if (!cancelled) {
          setCartItems(data.cart || []);
          loadedUserId.current = user.id;
        }
      } catch (error) {
        console.error("Cart Loading Error:", error);
      }
    };

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [user?.id, loading]);

  // Save Cart to MongoDB
  useEffect(() => {
    if (
      loading ||
      !user ||
      loadedUserId.current !== user.id
    ) {
      return;
    }

    const saveCart = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `${API_URL}/users/shop-data/cart`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              cart: cartItems,
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Unable to save cart");
        }
      } catch (error) {
        console.error("Cart Saving Error:", error);
      }
    };

    saveCart();
  }, [cartItems, user?.id, loading]);

  const addToCart = (product, size, quantity) => {
    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) => item.id === product.id && item.size === size
      );

      if (existingItem) {
        return previousItems.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...previousItems, { ...product, size, quantity }];
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const removeFromCart = (id, size) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => !(item.id === id && item.size === size)
      )
    );
  };

  const updateQuantity = (id, size, quantity) => {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
