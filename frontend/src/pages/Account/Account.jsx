
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { API_URL } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelingOrderId, setCancelingOrderId] = useState("");

  useEffect(() => {
    if (!user?.email) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Could not fetch orders");
        }

        const data = await response.json();

        const userOrders = data.filter(
          (order) =>
            order.email?.toLowerCase() === user.email.toLowerCase()
        );

        setOrders(userOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      setCancelingOrderId(orderId);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/orders/${orderId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not cancel order.");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: data.order.orderStatus,
              }
            : order
        )
      );

      setSuccess("Your order has been cancelled successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelingOrderId("");
    }
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      UPI: "UPI",
      Card: "Credit / Debit Card",
      "Net Banking": "Net Banking",
      COD: "Cash on Delivery",
    };

    return methods[method] || method || "Not Available";
  };

  const getPaymentStatusStyle = (status) => {
    if (status === "Success") {
      return {
        color: "#15803d",
        backgroundColor: "#dcfce7",
      };
    }

    if (status === "Failed") {
      return {
        color: "#dc2626",
        backgroundColor: "#fee2e2",
      };
    }

    return {
      color: "#a16207",
      backgroundColor: "#fef3c7",
    };
  };

  if (!user) {
    return (
      <div className="account-page">
        <h1>My Account</h1>
        <p>Please login to view your account details.</p>

        <button onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="account-page">

      {/* ACCOUNT DETAILS */}
      <div className="account-card">
        <h1>My Account</h1>
        <p>Welcome to CLOTH BAZAR!</p>

        {/* BACK TO SHOP BUTTON */}
        <div className="account-back-container">
          <button
            type="button"
            className="account-back-button"
            onClick={() => navigate("/shop")}
          >
            <ArrowLeft size={19} />
            Back to Shop
          </button>
        </div>

        <div className="account-details">
          <div>
            <strong>Name</strong>
            <p>{user.name}</p>
          </div>

          <div>
            <strong>Email Address</strong>
            <p>{user.email}</p>
          </div>
        </div>

        <button onClick={handleLogout}>
          LOGOUT
        </button>
      </div>

      {/* MY ORDERS */}
      <div className="my-orders-section">
        <h2>My Orders</h2>
        <p>Your recent purchases</p>

        {loading && <p>Loading your orders...</p>}

        {error && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        {success && (
          <p style={{ color: "green" }}>{success}</p>
        )}

        {!loading && !error && orders.length === 0 && (
          <p>You haven't placed any orders yet.</p>
        )}

        {!loading &&
          orders.map((order) => (
            <div className="my-order-card" key={order._id}>

              {/* ORDER HEADER */}
              <div className="my-order-header">
                <strong>
                  Order #{order._id.slice(-6)}
                </strong>

                <span>{order.orderStatus}</span>
              </div>

              {/* ORDER PRODUCTS */}
              {order.items.map((item, index) => (
                <div
                  className="my-order-item"
                  key={item._id || index}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <div>
                    <h3>{item.name}</h3>

                    <p>Size: {item.size}</p>

                    <p>Quantity: {item.quantity}</p>

                    <strong>
                      ₹
                      {(item.price * item.quantity).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                </div>
              ))}

              {/* COUPON DETAILS */}
              {order.couponCode && (
                <div className="my-order-coupon">
                  <p>
                    Coupon Applied:{" "}
                    <strong>{order.couponCode}</strong>
                  </p>

                  <p>
                    Discount:{" "}
                    <strong>
                      - ₹
                      {(order.discountAmount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </p>
                </div>
              )}

              {/* PAYMENT INFORMATION */}
              <div
                className="my-order-payment"
                style={{
                  marginTop: "18px",
                  padding: "16px",
                  backgroundColor: "#f8f8f8",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "12px",
                    fontSize: "17px",
                  }}
                >
                  Payment Information
                </h3>

                <p style={{ marginBottom: "9px" }}>
                  Payment Method:{" "}
                  <strong>
                    {getPaymentMethodName(order.paymentMethod)}
                  </strong>
                </p>

                <p style={{ marginBottom: "9px" }}>
                  Payment Status:{" "}
                  <strong
                    style={{
                      ...getPaymentStatusStyle(
                        order.paymentStatus
                      ),
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "13px",
                    }}
                  >
                    {order.paymentStatus || "Not Available"}
                  </strong>
                </p>

                {order.transactionId && (
                  <p
                    style={{
                      marginBottom: "0",
                      wordBreak: "break-word",
                    }}
                  >
                    Transaction ID:{" "}
                    <strong>{order.transactionId}</strong>
                  </p>
                )}
              </div>

              {/* ORDER FOOTER */}
              <div className="my-order-footer">
                <span>
                  {new Date(order.createdAt).toLocaleDateString(
                    "en-IN"
                  )}
                </span>

                <strong>
                  Total: ₹
                  {(order.totalAmount || 0).toLocaleString("en-IN")}
                </strong>
              </div>

              {/* CANCEL ORDER */}
              {order.orderStatus === "Pending" && (
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  disabled={cancelingOrderId === order._id}
                  style={{
                    marginTop: "15px",
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 18px",
                    cursor:
                      cancelingOrderId === order._id
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      cancelingOrderId === order._id ? 0.6 : 1,
                  }}
                >
                  {cancelingOrderId === order._id
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>
              )}

            </div>
          ))}
      </div>
    </div>
  );
}

export default Account;
