
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    const size = product.sizes?.[0] || "M";

    addToCart(product, size, 1);
    removeFromWishlist(product.id);

    navigate("/cart");
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <p className="wishlist-subtitle">YOUR FAVORITES</p>
        <h1>My Wishlist</h1>
        <p>All the styles you love, saved in one place.</p>

        {/* BACK TO SHOP BUTTON */}
        <div className="wishlist-back-container">
          <button
            type="button"
            className="wishlist-back-button"
            onClick={() => navigate("/shop")}
          >
            <ArrowLeft size={19} />
            Back to Shop
          </button>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="wishlist-empty">
          <Heart size={55} strokeWidth={1.3} />
          <h2>Your Wishlist is Empty</h2>
          <p>
            You haven't saved any products yet.
            Explore our collection and add your favorites!
          </p>

          <Link to="/shop" className="wishlist-shop-btn">
            <ShoppingBag size={18} />
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="wishlist-content">
          <div className="wishlist-count">
            {wishlistItems.length} Saved Item(s)
          </div>

          <div className="wishlist-grid">
            {wishlistItems.map((product) => (
              <div className="wishlist-card" key={product.id}>
                <Link
                  to={`/product/${product.id}`}
                  className="wishlist-image-link"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="wishlist-image"
                  />
                </Link>

                <div className="wishlist-card-details">
                  <Link
                    to={`/product/${product.id}`}
                    className="wishlist-product-name"
                  >
                    {product.name}
                  </Link>

                  <p className="wishlist-product-category">
                    {product.category}
                  </p>

                  <p className="wishlist-product-price">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>

                  <div className="wishlist-card-actions">
                    <button
                      type="button"
                      className="wishlist-add-btn"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingBag size={16} />
                      Add to Bag
                    </button>

                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      onClick={() => removeFromWishlist(product.id)}
                      aria-label="Remove from wishlist"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
