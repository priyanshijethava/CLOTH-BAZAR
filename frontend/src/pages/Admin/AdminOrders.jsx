
import { useEffect, useState } from "react";
import { API_URL } from "../../services/api";
import { RefreshCw } from "lucide-react";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderError, setOrderError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  const token = localStorage.getItem("token");

  const orderStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setOrderError("");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/orders/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Orders load failed");
      }

      setOrders(data);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setOrderMessage("");
      setOrderError("");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/orders/admin/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderStatus: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Order status update failed."
        );
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? data.order : order
        )
      );

      setOrderMessage(
        `Order #${orderId.slice(-6)} status updated to ${newStatus}.`
      );
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setUpdatingOrderId("");
    }
  };

  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "Pending"
  ).length;

  const processingOrders = orders.filter(
    (order) => order.orderStatus === "Processing"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "Delivered"
  ).length;

  return (
    <div className="admin-page admin-orders-page">
      <div className="admin-header">
        <div>
          <h1>Manage Orders</h1>
          <p>View customer orders and manage delivery status</p>
        </div>

        <button
          type="button"
          className="admin-add-btn"
          onClick={fetchOrders}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Loading..." : "Refresh Orders"}
        </button>
      </div>

      <div className="admin-order-summary">
        <div className="admin-order-summary-card">
          <span>Total Orders</span>
          <h2>{orders.length}</h2>
        </div>

        <div className="admin-order-summary-card">
          <span>Pending</span>
          <h2>{pendingOrders}</h2>
        </div>

        <div className="admin-order-summary-card">
          <span>Processing</span>
          <h2>{processingOrders}</h2>
        </div>

        <div className="admin-order-summary-card">
          <span>Delivered</span>
          <h2>{deliveredOrders}</h2>
        </div>
      </div>

      {orderMessage && (
        <div className="admin-success">{orderMessage}</div>
      )}

      {orderError && (
        <div className="admin-error">{orderError}</div>
      )}

      <div className="admin-orders-section">
        <div className="admin-section-header">
          <div>
            <h2>All Customer Orders ({orders.length})</h2>
            <p>Check order details and update order status</p>
          </div>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : orderError && orders.length === 0 ? (
          <p>Orders could not be loaded.</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Delivery Address</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Order Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6)}</td>

                    <td>
                      <strong>{order.customerName}</strong>
                      <p>{order.email}</p>
                    </td>

                    <td>{order.mobile}</td>

                    <td>
                      {order.address}, {order.city}, {order.state} -{" "}
                      {order.pincode}
                    </td>

                    <td>
                      {order.items.map((item, index) => (
                        <div key={item._id || index}>
                          <strong>{item.name}</strong>
                          <p>
                            Size: {item.size} | Qty: {item.quantity}
                          </p>
                        </div>
                      ))}
                    </td>

                    <td>
                      <strong>
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      {order.orderStatus === "Cancelled" ? (
                        <strong>Cancelled</strong>
                      ) : (
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleOrderStatusChange(
                              order._id,
                              e.target.value
                            )
                          }
                          disabled={updatingOrderId === order._id}
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      )}

                      {updatingOrderId === order._id && (
                        <small>Updating...</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
