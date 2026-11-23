
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-main">

        <div className="footer-brand">
          <Link to="/" className="brand-logo footer-logo">
            CLOTH<span>BAZAR</span>
            <small>FASHION & LIFESTYLE</small>
          </Link>

          <p>
            Discover fashion that inspires confidence.
            Your destination for modern and timeless style.
          </p>

          <div className="social-links">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            >
            IG
          </a>

          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            >
            FB
          </a>
        </div>
        </div>

        <div className="footer-column">
          <h4>SHOP</h4>
          <Link to="/shop?category=Men">Men</Link>
          <Link to="/shop?category=Women">Women</Link>
          <Link to="/shop?category=Kids">Kids</Link>
          <Link to="/shop?category=Accessories">Accessories</Link>
        </div>

        <div className="footer-column">
          <h4>HELP</h4>
          <Link to="/contact">Contact Us</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/shipping-policy">Shipping Policy</Link>
          <Link to="/return-policy">Return Policy</Link>
        </div>

        <div className="footer-column">
          <h4>ABOUT</h4>
          <Link to="/about">Our Story</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 CLOTH BAZAR. All Rights Reserved.</p>
        <p>Designed with Style & Passion.</p>
      </div>
    </footer>
  );
}

export default Footer;
