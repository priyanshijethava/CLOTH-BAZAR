
import { useEffect, useState } from "react";
import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  RefreshCw,
  Search,
  History,
} from "lucide-react";
import { API_URL } from "../../services/api";

function AdminStock() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [action, setAction] = useState("INCREASE");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");

  const fetchStockData = async () => {
    try {
      setLoading(true);

      const [productsResponse, historyResponse] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/products/stock/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!productsResponse.ok || !historyResponse.ok) {
        throw new Error("Unable to load stock data");
      }

      const productsData = await productsResponse.json();
      const historyData = await historyResponse.json();

      setProducts(productsData);
      setHistory(historyData);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + (Number(product.stock) || 0),
    0
  );

  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length;

  const outOfStock = products.filter(
    (product) => product.stock <= 0
  ).length;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const openStockModal = (product, selectedAction) => {
    setSelectedProduct(product);
    setAction(selectedAction);
    setQuantity("");
    setReason("");
  };

  const closeStockModal = () => {
    setSelectedProduct(null);
    setQuantity("");
    setReason("");
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();

    if (!quantity || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
      alert("Please enter a valid positive whole number.");
      return;
    }

    if (
      action === "DECREASE" &&
      Number(quantity) > selectedProduct.stock
    ) {
      alert("Insufficient stock. Stock cannot be negative.");
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(
        `${API_URL}/products/${selectedProduct._id}/stock`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action,
            quantity: Number(quantity),
            reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Stock update failed");
      }

      alert(data.message);

      closeStockModal();
      await fetchStockData();
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) {
      return <span className="stock-status out">Out of Stock</span>;
    }

    if (stock <= 5) {
      return <span className="stock-status low">Low Stock</span>;
    }

    return <span className="stock-status available">In Stock</span>;
  };

  if (loading) {
    return (
      <div className="admin-stock-page">
        <div className="stock-loading">Loading Stock Management...</div>
      </div>
    );
  }

  return (
    <div className="admin-stock-page">
      <div className="stock-page-header">
        <div>
          <h1>Stock Management</h1>
          <p>Monitor and manage your product inventory.</p>
        </div>

        <button
          className="stock-refresh-btn"
          onClick={fetchStockData}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Stock Dashboard */}
      <div className="stock-summary-grid">
        <div className="stock-summary-card">
          <div className="stock-summary-icon products-icon">
            <Package size={23} />
          </div>
          <div>
            <p>Total Products</p>
            <h2>{totalProducts}</h2>
          </div>
        </div>

        <div className="stock-summary-card">
          <div className="stock-summary-icon units-icon">
            <Boxes size={23} />
          </div>
          <div>
            <p>Total Stock Units</p>
            <h2>{totalStock}</h2>
          </div>
        </div>

        <div className="stock-summary-card">
          <div className="stock-summary-icon low-icon">
            <AlertTriangle size={23} />
          </div>
          <div>
            <p>Low Stock</p>
            <h2>{lowStock}</h2>
          </div>
        </div>

        <div className="stock-summary-card">
          <div className="stock-summary-icon out-icon">
            <XCircle size={23} />
          </div>
          <div>
            <p>Out of Stock</p>
            <h2>{outOfStock}</h2>
          </div>
        </div>
      </div>

      {/* Product Stock Table */}
      <div className="stock-section">
        <div className="stock-section-header">
          <div>
            <h2>Product Inventory</h2>
            <p>View and update product stock.</p>
          </div>

          <div className="stock-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="stock-table-wrapper">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Available Stock</th>
                <th>Status</th>
                <th>Stock Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="stock-product-name">
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                        <span>{product.name}</span>
                      </div>
                    </td>

                    <td>{product.category}</td>

                    <td>
                      <strong>{product.stock ?? 0}</strong>
                    </td>

                    <td>{getStockStatus(product.stock ?? 0)}</td>

                    <td>
                      <div className="stock-action-buttons">
                        <button
                          className="stock-increase-btn"
                          onClick={() =>
                            openStockModal(product, "INCREASE")
                          }
                          title="Increase Stock"
                        >
                          <Plus size={16} />
                        </button>

                        <button
                          className="stock-decrease-btn"
                          onClick={() =>
                            openStockModal(product, "DECREASE")
                          }
                          disabled={!product.stock || product.stock <= 0}
                          title="Decrease Stock"
                        >
                          <Minus size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="stock-empty">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock History */}
      <div className="stock-section">
        <div className="stock-section-header">
          <div>
            <h2>
              <History size={20} />
              Stock History
            </h2>
            <p>Recent manual stock changes.</p>
          </div>
        </div>

        <div className="stock-table-wrapper">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Action</th>
                <th>Quantity</th>
                <th>Previous Stock</th>
                <th>New Stock</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item._id}>
                    <td>{item.productName}</td>
                    <td>
                      <span
                        className={`stock-history-action ${
                          item.action === "INCREASE"
                            ? "increase"
                            : "decrease"
                        }`}
                      >
                        {item.action}
                      </span>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{item.previousStock}</td>
                    <td>{item.newStock}</td>
                    <td>{item.reason || "-"}</td>
                    <td>
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="stock-empty">
                    No stock history available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Update Modal */}
      {selectedProduct && (
        <div className="stock-modal-overlay">
          <div className="stock-modal">
            <button
              className="stock-modal-close"
              onClick={closeStockModal}
            >
              ×
            </button>

            <h2>
              {action === "INCREASE"
                ? "Increase Stock"
                : "Decrease Stock"}
            </h2>

            <p className="stock-modal-product">
              Product: <strong>{selectedProduct.name}</strong>
            </p>

            <p className="stock-current-value">
              Current Stock: <strong>{selectedProduct.stock ?? 0}</strong>
            </p>

            <form onSubmit={handleStockUpdate}>
              <label>Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="INCREASE">Increase Stock (+)</option>
                <option value="DECREASE">Decrease Stock (-)</option>
              </select>

              <label>Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                required
              />

              <label>Reason (Optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason"
              />

              <button
                type="submit"
                className="stock-submit-btn"
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Stock"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStock;
