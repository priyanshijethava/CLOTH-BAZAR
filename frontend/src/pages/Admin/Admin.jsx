
import { useEffect, useState } from "react";
import { API_URL } from "../../services/api";
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productResponse, orderResponse] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/orders/admin/all`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const productData = await productResponse.json();
        const orderData = await orderResponse.json();

        if (!productResponse.ok) {
          throw new Error(
            productData.message || "Products load failed"
          );
        }

        if (!orderResponse.ok) {
          throw new Error(
            orderData.message || "Orders load failed"
          );
        }

        setProducts(productData);
        setOrders(orderData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "Delivered"
  ).length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="admin-page admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to CLOTH BAZAR Admin Panel</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className="admin-dashboard-cards">
            <div className="admin-dashboard-card">
              <div className="admin-dashboard-icon">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p>Total Orders</p>
                <h2>{orders.length}</h2>
              </div>
            </div>

            <div className="admin-dashboard-card">
              <div className="admin-dashboard-icon">
                <Package size={24} />
              </div>
              <div>
                <p>Total Products</p>
                <h2>{products.length}</h2>
              </div>
            </div>

            <div className="admin-dashboard-card">
              <div className="admin-dashboard-icon">
                <Clock size={24} />
              </div>
              <div>
                <p>Pending Orders</p>
                <h2>{pendingOrders}</h2>
              </div>
            </div>

            <div className="admin-dashboard-card">
              <div className="admin-dashboard-icon">
                <CheckCircle size={24} />
              </div>
              <div>
                <p>Delivered Orders</p>
                <h2>{deliveredOrders}</h2>
              </div>
            </div>
          </div>

          <div className="admin-dashboard-section">
            <div className="admin-section-header">
              <div>
                <h2>Recent Orders</h2>
                <p>Latest customer orders</p>
              </div>

              <Link to="/admin/orders" className="admin-view-all">
                View All <ArrowRight size={17} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id.slice(-6)}</td>
                        <td>
                          <strong>{order.customerName}</strong>
                          <p>{order.email}</p>
                        </td>
                        <td>
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                        <td>{order.orderStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-dashboard-quick-links">
            <Link to="/admin/orders">
              <ShoppingBag size={20} />
              <span>
                <strong>Manage Orders</strong>
                <small>View and update customer orders</small>
              </span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/admin/products">
              <Package size={20} />
              <span>
                <strong>All Products</strong>
                <small>Add, edit and delete products</small>
              </span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Admin;
