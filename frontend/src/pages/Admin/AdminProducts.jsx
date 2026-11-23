
import { useEffect, useState } from "react";
import { API_URL } from "../../services/api";
import { Pencil, Trash2, Plus, X } from "lucide-react";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const initialForm = {
    name: "",
    description: "",
    price: "",
    category: "Men",
    image: "",
    images: "",
    sizes: "",
    stock: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Products load failed");
      }

      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setMessage("");
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "Men",
      image: product.image || "",
      images: product.images?.join("\n") || "",
      sizes: product.sizes?.join(", ") || "",
      stock: product.stock ?? 0,
    });

    setMessage("");
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      if (!token) {
        throw new Error("Please login again.");
      }

      const additionalImages = formData.images
        .split(/[\n,]+/)
        .map((url) => url.trim())
        .filter(Boolean);

      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: additionalImages,
        sizes: formData.sizes
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean),
      };

      const url = editingProduct
        ? `${API_URL}/products/${editingProduct._id}`
        : `${API_URL}/products`;

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed");
      }

      setMessage(
        editingProduct
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      setShowForm(false);
      setEditingProduct(null);
      setFormData(initialForm);

      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    setMessage("");
    setError("");

    try {
      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage("Product deleted successfully!");
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-page admin-products-page">
      <div className="admin-header">
        <div>
          <h1>All Products</h1>
          <p>Manage your CLOTH BAZAR product inventory</p>
        </div>

        <button className="admin-add-btn" onClick={handleAdd}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {message && <div className="admin-success">{message}</div>}
      {error && <div className="admin-error">{error}</div>}

      {showForm && (
        <div className="admin-form-container">
          <div className="admin-form-heading">
            <h2>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>

            <button
              type="button"
              className="admin-close-btn"
              onClick={() => setShowForm(false)}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="admin-product-form">
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <div className="admin-form-row">
              <div>
                <label>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Accessories">Accessories</option>
            </select>

            <label>Main Product Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/front-image.jpg"
              required
            />

            <label>Additional Product Images URLs</label>
            <textarea
              name="images"
              value={formData.images}
              onChange={handleChange}
              placeholder={"Paste additional image URLs here\nOne URL per line or separated by commas"}
              rows="5"
            />

            <small>
              Main image ઉપરાંત Back, Side અને Detail images અહીં નાખો.
            </small>

            <label>Sizes (comma separated)</label>
            <input
              type="text"
              name="sizes"
              value={formData.sizes}
              onChange={handleChange}
              placeholder="S, M, L, XL"
            />

            <button type="submit" className="admin-submit-btn">
              {editingProduct ? "Update Product" : "Save Product"}
            </button>
          </form>
        </div>
      )}

      <div className="admin-products-section">
        <h2>Products ({products.length})</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Sizes</th>
                  <th>Images</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="admin-product-image"
                      />
                    </td>

                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price}</td>
                    <td>{product.stock}</td>
                    <td>{product.sizes?.join(", ") || "N/A"}</td>
                    <td>{(product.images?.length || 0) + 1} Images</td>

                    <td>
                      <div className="admin-action-buttons">
                        <button
                          className="admin-edit-btn"
                          onClick={() => handleEdit(product)}
                          title="Edit Product"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="admin-delete-btn"
                          onClick={() => handleDelete(product._id)}
                          title="Delete Product"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
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

export default AdminProducts;
