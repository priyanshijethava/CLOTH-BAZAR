
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

import {
  Search,
  UserRound,
  Heart,
  ShoppingBag,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { isLoggedIn, logout, user } = useAuth();

  const navigate = useNavigate();

  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalWishlistItems = wishlistItems.length;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      <div className="announcement-bar">
        <p>
          FREE SHIPPING ON ORDERS ABOVE ₹1,999
          <span> | </span>
          USE CODE: STYLE10
        </p>
      </div>

      <header className="navbar">
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <Link
          to="/"
          className="brand-logo"
          onClick={() => setMenuOpen(false)}
        >
          CLOTH<span>BAZAR</span>
          <small>FASHION & LIFESTYLE</small>
        </Link>

        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          <Link to="/categories" onClick={() => setMenuOpen(false)}>
            Categories
          </Link>

          <Link to="/shop" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>

          <Link to="/offers" onClick={() => setMenuOpen(false)}>
            Offers
          </Link>

          <Link to="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>

          {/* ADMIN PANEL */}
          {isLoggedIn && user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
            >
              <LayoutDashboard size={16} />
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="nav-actions">
          <div className="nav-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search products..."
            />
          </div>

          {/* ACCOUNT */}
          <Link
            to={isLoggedIn ? "/account" : "/login"}
            className="icon-btn"
            aria-label={isLoggedIn ? "My Account" : "Login"}
            title={isLoggedIn ? user?.name : "Login"}
            onClick={() => setMenuOpen(false)}
          >
            <UserRound />
          </Link>

          {/* WISHLIST */}
          <Link
            to="/wishlist"
            className="icon-btn cart-btn"
            aria-label="Wishlist"
            title="Wishlist"
            onClick={() => setMenuOpen(false)}
          >
            <Heart />
            <span className="nav-count">
              {totalWishlistItems}
            </span>
          </Link>

          {/* CART */}
          <Link
            to="/cart"
            className="icon-btn cart-btn"
            aria-label="Shopping cart"
            onClick={() => setMenuOpen(false)}
          >
            <ShoppingBag />
            <span className="nav-count">
              {totalCartItems}
            </span>
          </Link>

          {/* LOGOUT */}
          {isLoggedIn && (
            <button
              className="icon-btn"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              type="button"
            >
              <LogOut />
            </button>
          )}
        </div>
      </header>
    </>
  );
}

export default Navbar;
