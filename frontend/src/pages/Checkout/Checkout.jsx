
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { API_URL } from "../../services/api";

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiApp, setUpiApp] = useState("Google Pay");
  const [selectedBank, setSelectedBank] = useState("SBI");
  const [demoResult, setDemoResult] = useState("Success");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const coupons = {
    STYLE10: { discount: 10, category: "All" },
    FASHION20: { discount: 20, category: "Women" },
    KIDS15: { discount: 15, category: "Kids" },
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const selectedCoupon = coupons[appliedCoupon];

  const eligibleAmount = selectedCoupon
    ? cartItems.reduce((sum, item) => {
        if (
          selectedCoupon.category === "All" ||
          item.category === selectedCoupon.category
        ) {
          return sum + item.price * item.quantity;
        }
        return sum;
      }, 0)
    : 0;

  const discountAmount = selectedCoupon
    ? Math.round(
        (eligibleAmount * selectedCoupon.discount) / 100
      )
    : 0;

  const total = subtotal - discountAmount;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();

    setCouponError("");
    setCouponMessage("");

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    const coupon = coupons[code];

    if (!coupon) {
      setAppliedCoupon("");
      setCouponError("Invalid coupon code.");
      return;
    }

    const eligibleProducts = cartItems.filter(
      (item) =>
        coupon.category === "All" ||
        item.category === coupon.category
    );

    if (eligibleProducts.length === 0) {
      setAppliedCoupon("");
      setCouponError(
        `This coupon is valid only for ${coupon.category} products.`
      );
      return;
    }

    setAppliedCoupon(code);
    setCouponMessage(
      `${code} applied successfully! You got ${coupon.discount}% OFF.`
    );
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setCouponInput("");
    setCouponMessage("");
    setCouponError("");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setError("Your cart is empty!");
      return;
    }

    setLoading(true);
    setError("");
    setPaymentInfo(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          state: { from: { pathname: "/checkout" } },
        });
        return;
      }

      let paymentToken = "";
      let transactionId = "";

      if (paymentMethod !== "COD") {
        const paymentResponse = await fetch(
          `${API_URL}/orders/demo-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              paymentMethod,
              demoResult,
              amount: total,
            }),
          }
        );

        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok) {
          throw new Error(
            paymentData.message || "Payment could not be processed."
          );
        }

        if (!paymentData.success) {
          setPaymentInfo({
            status: "Failed",
            method: paymentMethod,
          });

          throw new Error(
            "Payment could not be completed. Please try again."
          );
        }

        paymentToken = paymentData.paymentToken;
        transactionId = paymentData.transactionId;
      }

      const orderData = {
        ...formData,
        items: cartItems.map((item) => ({
          productId: item.id || item._id || item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          image: item.image,
        })),
        couponCode: appliedCoupon,
        paymentMethod,
        paymentToken,
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Order could not be placed."
        );
      }

      setPaymentInfo({
        status: paymentMethod === "COD" ? "Pending" : "Success",
        method: paymentMethod,
        transactionId,
      });

      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.log("Checkout Error:", error);
      setError(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="order-success">
        <div className="success-card">
          <div className="success-icon">✓</div>

          <span className="success-label">
            ORDER CONFIRMED
          </span>

          <h1>Thank You for Your Order!</h1>

          <p>
            Your order has been placed successfully.
            We're excited to get your style delivered to you.
          </p>

          <div className="success-divider"></div>

          {paymentInfo && (
            <div className="checkout-payment-confirmation">
              <h3>Payment Information</h3>

              <p>
                Payment Method:{" "}
                <strong>{paymentInfo.method}</strong>
              </p>

              <p>
                Payment Status:{" "}
                <strong>{paymentInfo.status}</strong>
              </p>

              {paymentInfo.transactionId && (
                <p>
                  Transaction ID:{" "}
                  <strong>{paymentInfo.transactionId}</strong>
                </p>
              )}
            </div>
          )}

          <h3>Happy Shopping!</h3>

          <p className="success-brand">
            Thank you for choosing CLOTH BAZAR.
          </p>

          <button onClick={() => navigate("/shop")}>
            CONTINUE SHOPPING →
          </button>
        </div>
      </div>
    );
  }

  const paymentOptions = [
    { value: "UPI", label: "UPI", icon: "📱" },
    { value: "Card", label: "Credit / Debit Card", icon: "💳" },
    { value: "Net Banking", label: "Net Banking", icon: "🏦" },
    { value: "COD", label: "Cash on Delivery", icon: "📦" },
  ];

  return (
    <div className="checkout-page">

      <div className="checkout-header">
        <span>ALMOST THERE</span>
        <h1>Checkout</h1>
        <p>Complete your details to place your order.</p>
      </div>

      {/* Back to Cart Button - Below Checkout Heading */}
      <div className="checkout-back-container">
        <button
          type="button"
          className="checkout-back-button"
          onClick={() => navigate("/cart")}
        >
          <ArrowLeft size={19} />
          Back to Cart
        </button>
      </div>

      <div className="checkout-container">
        <div className="checkout-form">
          <h2>Delivery Information</h2>

          <form onSubmit={handlePlaceOrder}>
            <label>Full Name</label>
            <input
              type="text"
              name="customerName"
              placeholder="Enter your full name"
              value={formData.customerName}
              onChange={handleChange}
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter mobile number"
              pattern="[0-9]{10}"
              maxLength="10"
              value={formData.mobile}
              onChange={handleChange}
              required
            />

            <label>Full Address</label>
            <textarea
              name="address"
              placeholder="House no, street, area..."
              rows="4"
              value={formData.address}
              onChange={handleChange}
              required
            />

            <div className="checkout-row">
              <div>
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>PIN Code</label>
            <input
              type="text"
              name="pincode"
              placeholder="Enter PIN code"
              pattern="[0-9]{6}"
              maxLength="6"
              value={formData.pincode}
              onChange={handleChange}
              required
            />

            <div className="payment-section">
              <div className="payment-heading">
                <h2>Payment Method</h2>
                <p>Select your preferred payment method.</p>
              </div>

              <div className="payment-method-list">
                {paymentOptions.map((method) => (
                  <label
                    key={method.value}
                    className={`payment-method-option ${
                      paymentMethod === method.value ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />

                    <span className="payment-method-icon">
                      {method.icon}
                    </span>

                    <span className="payment-method-name">
                      {method.label}
                    </span>

                    <span className="payment-method-check">
                      {paymentMethod === method.value ? "✓" : ""}
                    </span>
                  </label>
                ))}
              </div>

              {paymentMethod === "UPI" && (
                <div className="payment-extra-box">
                  <h3>Choose Your UPI App</h3>

                  <div className="upi-app-list">
                    {[
                      "Google Pay",
                      "PhonePe",
                      "Paytm",
                      "BHIM",
                    ].map((app) => (
                      <button
                        type="button"
                        key={app}
                        className={`upi-app-option ${
                          upiApp === app ? "active" : ""
                        }`}
                        onClick={() => setUpiApp(app)}
                      >
                        {app}
                        {upiApp === app && <span> ✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === "Card" && (
                <div className="payment-extra-box">
                  <h3>Credit / Debit Card</h3>

                  <div className="demo-card-preview">
                    <div className="demo-card-top">
                      <span>CLOTH BAZAR</span>
                      <span>••••</span>
                    </div>

                    <div className="demo-card-number">
                      •••• •••• •••• ••••
                    </div>

                    <div className="demo-card-bottom">
                      <span>CARD PAYMENT</span>
                      <span>•• / ••</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "Net Banking" && (
                <div className="payment-extra-box">
                  <h3>Select Your Bank</h3>

                  <select
                    value={selectedBank}
                    onChange={(e) =>
                      setSelectedBank(e.target.value)
                    }
                    className="payment-select"
                  >
                    <option value="SBI">State Bank of India</option>
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="Axis">Axis Bank</option>
                    <option value="BOB">Bank of Baroda</option>
                  </select>
                </div>
              )}

              {paymentMethod === "COD" && (
                <div className="payment-extra-box">
                  <h3>Cash on Delivery</h3>
                  <p>
                    Pay when your order is delivered to your address.
                  </p>
                  <p>
                    Payment status will remain Pending until payment
                    is collected.
                  </p>
                </div>
              )}

              {paymentMethod !== "COD" && (
                <div className="demo-result-box">
                  <label>Payment Response</label>

                  <select
                    value={demoResult}
                    onChange={(e) =>
                      setDemoResult(e.target.value)
                    }
                    className="payment-select"
                  >
                    <option value="Success">Payment Successful</option>
                    <option value="Failed">Payment Declined</option>
                  </select>

                  <p className="payment-test-notice">
                    Test environment · No real payment will be processed.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className="checkout-error">{error}</p>
            )}

            <button
              type="submit"
              className="place-order-btn"
              disabled={loading}
            >
              {loading
                ? "PROCESSING..."
                : paymentMethod === "COD"
                  ? "PLACE ORDER"
                  : `PAY ₹${total.toLocaleString("en-IN")} & PLACE ORDER`}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h2>Your Order</h2>

          {cartItems.map((item) => (
            <div
              className="checkout-item"
              key={`${item.id || item._id}-${item.size}`}
            >
              <img src={item.image} alt={item.name} />

              <div>
                <h4>{item.name}</h4>
                <p>
                  Size: {item.size} | Qty: {item.quantity}
                </p>

                <strong>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          ))}

          <div className="coupon-box">
            <h3>Have a Coupon Code?</h3>

            <div className="coupon-input-row">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponError("");
                  setCouponMessage("");
                }}
                disabled={!!appliedCoupon}
              />

              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                >
                  REMOVE
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                >
                  APPLY
                </button>
              )}
            </div>

            {couponMessage && (
              <p className="coupon-success">{couponMessage}</p>
            )}

            {couponError && (
              <p className="checkout-error">{couponError}</p>
            )}

            <small>
              Available: STYLE10 | FASHION20 | KIDS15
            </small>
          </div>

          <div className="checkout-total">
            <div>
              <span>Subtotal</span>
              <strong>
                ₹{subtotal.toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>Discount</span>
              <strong>
                - ₹{discountAmount.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="final-total">
              <span>Final Amount</span>
              <strong>
                ₹{total.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
