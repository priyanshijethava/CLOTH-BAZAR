
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { API_URL } from "../../services/api";

import {
  Heart,
  ShoppingBag,
  Star,
  SlidersHorizontal,
  Search,
} from "lucide-react";

function Shop() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const categories = ["All", "Men", "Women", "Kids", "Accessories"];

  // Read category from URL
  useEffect(() => {
    const categoryFromURL = searchParams.get("category");

    if (categoryFromURL && categories.includes(categoryFromURL)) {
      setActiveCategory(categoryFromURL);
    } else {
      setActiveCategory("All");
    }
  }, [searchParams]);

  // Fetch Products from MongoDB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load products");
        }

        const formattedProducts = data.map((product) => ({
          ...product,
          id: product._id,
        }));

        setProducts(formattedProducts);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);

    if (category === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  // Search and Category Filter
  let filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const searchText = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      product.name?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.description?.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  // Price Sorting
  if (sortBy === "low") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => a.price - b.price
    );
  }

  if (sortBy === "high") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => b.price - a.price
    );
  }

  return (
    <div className="shop-page">

      <section className="shop-header">
        <span>DISCOVER YOUR STYLE</span>
        <h1>
          {activeCategory === "All"
            ? "Our Collection"
            : `${activeCategory} Collection`}
        </h1>
        <p>Explore the latest fashion trends for every occasion.</p>
      </section>

      <section className="shop-container">

        <div className="shop-topbar">
          <div>
            <h2>
              {activeCategory === "All"
                ? "All Products"
                : activeCategory}
            </h2>

            <p>
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} Products Found`}
            </p>
          </div>

          <div className="shop-sort">
            <SlidersHorizontal size={18} />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default Sorting</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Search */}
        <div className="shop-search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </button>
          )}
        </div>

        <div className="shop-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading && (
          <p>Loading products from database...</p>
        )}

        {error && (
          <p className="shop-cart-message">{error}</p>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <p>
            No products found. Try another search.
          </p>
        )}

        <div className="shop-product-grid">
          {filteredProducts.map((product) => (
            <div
              className="shop-product-card"
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="shop-product-image">

                <img src={product.image} alt={product.name} />

                {product.tag && (
                  <span className="shop-product-tag">
                    {product.tag}
                  </span>
                )}

                <button
                  className="shop-wishlist"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  aria-label={
                    isWishlisted(product.id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <Heart
                    fill={
                      isWishlisted(product.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>

                <button
                  className="shop-add-cart"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, product.sizes?.[0] || "M", 1);
                    setCartCount((count) => count + 1);
                  }}
                >
                  <ShoppingBag size={17} />
                  ADD TO BAG
                </button>

              </div>

              <div className="shop-product-details">
                <span>{product.category}</span>

                <h3>{product.name}</h3>

                {product.rating && (
                  <div className="shop-rating">
                    <Star size={14} fill="currentColor" />
                    {product.rating}
                  </div>
                )}

                <div className="shop-price">
                  <strong>
                    ₹{product.price.toLocaleString("en-IN")}
                  </strong>

                  {product.oldPrice && (
                    <del>
                      ₹{product.oldPrice.toLocaleString("en-IN")}
                    </del>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="shop-cart-message">
          Items added to bag: {cartCount}
        </p>

      </section>
    </div>
  );
}

export default Shop;
