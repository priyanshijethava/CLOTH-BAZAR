
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { API_URL } from "../services/api";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user, loading } = useAuth();

  const loadedUserId = useRef(null);

  // Load Wishlist from MongoDB
  useEffect(() => {
    let cancelled = false;

    const loadWishlist = async () => {
      if (loading) return;

      if (!user) {
        loadedUserId.current = null;
        setWishlistItems([]);
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
          throw new Error(data.message || "Unable to load wishlist");
        }

        if (!cancelled) {
          setWishlistItems(data.wishlist || []);
          loadedUserId.current = user.id;
        }
      } catch (error) {
        console.error("Wishlist Loading Error:", error);
      }
    };

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [user?.id, loading]);

  // Save Wishlist to MongoDB
  useEffect(() => {
    if (
      loading ||
      !user ||
      loadedUserId.current !== user.id
    ) {
      return;
    }

    const saveWishlist = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `${API_URL}/users/shop-data/wishlist`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              wishlist: wishlistItems,
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Unable to save wishlist");
        }
      } catch (error) {
        console.error("Wishlist Saving Error:", error);
      }
    };

    saveWishlist();
  }, [wishlistItems, user?.id, loading]);

  const addToWishlist = (product) => {
    setWishlistItems((previousItems) => {
      const alreadyExists = previousItems.some(
        (item) => item.id === product.id
      );

      if (alreadyExists) {
        return previousItems;
      }

      return [...previousItems, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    );
  };

  const toggleWishlist = (product) => {
    setWishlistItems((previousItems) => {
      const exists = previousItems.some(
        (item) => item.id === product.id
      );

      if (exists) {
        return previousItems.filter(
          (item) => item.id !== product.id
        );
      }

      return [...previousItems, product];
    });
  };

  const isWishlisted = (id) =>
    wishlistItems.some((item) => item.id === id);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
