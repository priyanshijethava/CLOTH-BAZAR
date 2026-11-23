
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Heart,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { API_URL } from "../../services/api";
import "../../App.css";

const categories = [
  {
    name: "Men",
    subtitle: "Modern essentials",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=700",
  },
  {
    name: "Women",
    subtitle: "Elegant collections",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700",
  },
  {
    name: "Kids",
    subtitle: "Little fashion stars",
    image:
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=700",
  },
  {
    name: "Accessories",
    subtitle: "Complete your look",
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=700",
  },
];

function Home() {
  const navigate = useNavigate();

  const { addToCart } = useCart();

  const { toggleWishlist, isWishlisted } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // FETCH PRODUCTS FROM MONGODB

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

        const categoryProducts = categories.map((category) =>
          formattedProducts.find(
            (product) => product.category === category.name
          )
        );

        setProducts(categoryProducts.filter(Boolean));
      } catch (err) {
        setError(err.message || "Could not load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // CATEGORY FILTER

  const filteredProducts = products.filter(
    (product) =>
      activeCategory === "All" ||
      product.category === activeCategory
  );

  // ADD TO CART

  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    const selectedSize = product.sizes?.[0] || "M";

    addToCart(product, selectedSize, 1);
  };

  // NAVIGATION

  const openShop = () => {
  navigate("/shop");
};

const openOffers = () => {
  navigate("/offers");
};

  return (
    <div className="app">

      {/* HERO SECTION */}

      <section className="hero-section" id="home">
        <div className="hero-content">

          <span className="hero-label">
            THE NEW COLLECTION 2026
          </span>

          <h1>
            Wear Your
            <br />
            <span>Confidence.</span>
          </h1>

          <p>
            Discover the latest fashion trends and redefine
            your everyday style with our exclusive collections.
          </p>

          <div className="hero-buttons">

            <button className="primary-btn" onClick={openShop}>
              SHOP NOW
              <ArrowRight size={18} />
            </button>

            <a href="#categories" className="secondary-btn">
              EXPLORE COLLECTION
            </a>

          </div>

          <div className="hero-note">
            <span>✦</span>
            Curated styles for every occasion
          </div>

        </div>

        <div className="hero-image">

          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400"
            alt="Fashion collection"
          />

          <div className="hero-image-tag">
            <span>NEW SEASON</span>
            <strong>Fresh Looks. New You.</strong>
          </div>

        </div>
      </section>

      {/* SERVICE BENEFITS */}

      <section className="benefits-section">

        <div className="benefit">
          <Truck />

          <div>
            <strong>Free Shipping</strong>
            <span>On orders above ₹1,999</span>
          </div>
        </div>

        <div className="benefit">
          <ShieldCheck />

          <div>
            <strong>Secure Payments</strong>
            <span>100% secure checkout</span>
          </div>
        </div>

        <div className="benefit">
          <RotateCcw />

          <div>
            <strong>Easy Returns</strong>
            <span>Hassle-free returns</span>
          </div>
        </div>

      </section>

      {/* CATEGORIES SECTION */}

      <section
        className="categories-section section-container"
        id="categories"
      >

        <div className="section-heading">

          <div>
            <span className="section-eyebrow">
              EXPLORE OUR WORLD
            </span>

            <h2>Shop By Category</h2>

            <p>
              Find your perfect style for every moment.
            </p>
          </div>

          <Link to="/shop" className="view-all">
            VIEW ALL
            <ArrowRight size={17} />
          </Link>

        </div>

        <div className="category-grid">

          {categories.map((category) => (
            <Link
              to={`/shop?category=${category.name}`}
              className="category-card"
              key={category.name}
            >

              <img
                src={category.image}
                alt={category.name}
              />

              <div className="category-overlay">

                <span>{category.subtitle}</span>

                <h3>{category.name}</h3>

                <div className="category-link">
                  SHOP NOW
                  <ChevronRight size={17} />
                </div>

              </div>

            </Link>
          ))}

        </div>

      </section>

      {/* PRODUCTS SECTION */}

      <section
        className="products-section section-container"
        id="products"
      >

        <div className="section-heading">

          <div>
            <span className="section-eyebrow">
              HANDPICKED FOR YOU
            </span>

            <h2>Trending Products</h2>

            <p>
              Our most-loved styles, just for you.
            </p>
          </div>

          <Link to="/shop" className="view-all">
            EXPLORE MORE
            <ArrowRight size={17} />
          </Link>

        </div>

        {/* PRODUCT FILTERS */}

        <div className="product-filters">

          {["All", "Men", "Women", "Kids", "Accessories"].map(
            (category) => (
              <button
                key={category}
                className={
                  activeCategory === category
                    ? "filter active"
                    : "filter"
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            )
          )}

        </div>

        {/* LOADING */}

        {loading && (
          <p className="empty-products">
            Loading products from database...
          </p>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="empty-products">
            <h3>Unable to load products</h3>
            <p>{error}</p>
          </div>
        )}

        {/* PRODUCT GRID */}

        {!loading && !error && (
          <div className="product-grid">

            {filteredProducts.map((product) => (

              <div
                className="product-card"
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ cursor: "pointer" }}
              >

                <div className="product-image">

                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  {/* WISHLIST */}

                  <button
                    className={`wishlist-btn ${
                      isWishlisted(product.id) ? "selected" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    aria-label="Toggle wishlist"
                  >

                    <Heart
                      fill={
                        isWishlisted(product.id)
                          ? "currentColor"
                          : "none"
                      }
                    />

                  </button>

                  {/* ADD TO CART */}

                  <button
                    className="quick-add"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <ShoppingBag size={16} />
                    ADD TO BAG
                  </button>

                </div>

                {/* PRODUCT DETAILS */}

                <div className="product-details">

                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <div className="product-price">

                    <strong>
                      ₹{product.price.toLocaleString("en-IN")}
                    </strong>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

        {/* EMPTY PRODUCTS */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (

            <div className="empty-products">
              <h3>No products found</h3>
              <p>Try another category.</p>

              <button
                onClick={() => setActiveCategory("All")}
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* EXPLORE ALL PRODUCTS */}

        <div className="center-button">

          <button
            className="outline-btn"
            onClick={openShop}
          >
            EXPLORE ALL PRODUCTS
            <ArrowRight size={18} />
          </button>

        </div>

      </section>

      {/* PROMOTIONAL BANNER */}

      <section className="promo-section" id="offers">

        <div className="promo-image">

          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400"
            alt="New fashion collection"
          />

        </div>

        <div className="promo-content">

          <span>EXCLUSIVE ONLINE OFFER</span>

          <h2>
            A Little More
            <br />
            Style. A Lot More
            <br />
            <em>Savings.</em>
          </h2>

          <p>
            Refresh your wardrobe with our latest fashion essentials.
          </p>

          <button className="primary-btn" onClick={openOffers}>
            SHOP THE OFFER
            <ArrowRight size={18} />
          </button>

        </div>

      </section>

      {/* NEWSLETTER */}

      <section className="newsletter-section">

        <span>STAY IN STYLE</span>

        <h2>Join The Fashion Club</h2>

        <p>
          Get updates on new arrivals, exclusive deals and more.
        </p>

        <form
          className="newsletter-form"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thank you for subscribing!");
            e.target.reset();
          }}
        >

          <input
            type="email"
            placeholder="Enter your email address"
            required
          />

          <button type="submit">
            SUBSCRIBE
            <ArrowRight size={16} />
          </button>

        </form>

      </section>

    </div>
  );
}

export default Home;
