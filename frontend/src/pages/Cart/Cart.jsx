
import { useCart } from "../../context/CartContext";
import { ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingBag size={55} />
        <h2>Your Shopping Bag is Empty</h2>
        <p>Looks like you haven't added anything to your bag yet.</p>
        <button onClick={() => navigate("/shop")}>
          CONTINUE SHOPPING
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">

      <div className="cart-heading">
        <span>YOUR STYLE JOURNEY</span>
        <h1>Shopping Bag</h1>
        <p>{cartItems.length} different product(s) in your bag</p>
      </div>

      {/* Back Button - Below Shopping Bag Heading */}
      <div className="cart-back-container">
        <button
          type="button"
          className="cart-back-button"
          onClick={() => navigate("/shop")}
        >
          <ArrowLeft size={19} />
          Back to Shop
        </button>
      </div>

      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={`${item.id}-${item.size}`}>
              <img src={item.image} alt={item.name} />

              <div className="cart-item-details">
                <span>{item.category}</span>
                <h3>{item.name}</h3>
                <p>Size: {item.size}</p>
                <strong>₹{item.price.toLocaleString("en-IN")}</strong>

                <div className="cart-quantity">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.size, item.quantity - 1)
                    }
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.size, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-item-actions">
                <strong>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </strong>

                <button
                  className="cart-remove"
                  onClick={() => removeFromCart(item.id, item.size)}
                  aria-label="Remove product"
                >
                  <Trash2 size={19} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
          </div>

          <div className="cart-summary-row">
            <span>Shipping</span>
            <strong>FREE</strong>
          </div>

          <div className="cart-summary-total">
            <span>Total</span>
            <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
          </div>

          <button
            className="cart-checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            PROCEED TO CHECKOUT
          </button>

          <button
            className="cart-continue-btn"
            onClick={() => navigate("/shop")}
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
