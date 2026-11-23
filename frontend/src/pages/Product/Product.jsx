
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { API_URL } from "../../services/api";

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Product not found");
        }

        setProduct(data);
        setSelectedImageIndex(0);
      } catch (error) {
        console.log("Product Fetch Error:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="product-page">
        <h2>Loading Product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page">
        <h2>Product Not Found</h2>
        <button onClick={() => navigate("/shop")}>
          <ArrowLeft size={18} />
          Back to Shop
        </button>
      </div>
    );
  }

  const productImages = [
    ...new Set(
      [product.image, ...(product.images || [])].filter(Boolean)
    ),
  ];

  const availableSizes = product.sizes?.length
    ? product.sizes
    : ["S", "M", "L", "XL", "XXL"];

  const selectedImage =
    productImages[selectedImageIndex] || product.image;

  return (
    <div className="product-page">

      {/* Back to Shop Button */}
      <div className="product-back-container">
        <button
          type="button"
          className="product-back-button"
          onClick={() => navigate("/shop")}
        >
          <ArrowLeft size={19} />
          Back to Shop
        </button>
      </div>

      <div className="product-details-container">

        {/* Product Image Gallery */}
        <div className="product-detail-gallery">

          <div className="product-detail-image">
            <img src={selectedImage} alt={product.name} />
          </div>

          {productImages.length > 1 && (
            <div className="product-image-thumbnails">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className={
                    selectedImageIndex === index
                      ? "product-thumbnail active"
                      : "product-thumbnail"
                  }
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}

          {productImages.length > 1 && (
            <p className="product-image-count">
              {selectedImageIndex + 1} / {productImages.length} Images
            </p>
          )}

        </div>

        {/* Product Information */}
        <div className="product-info">
          <span className="product-category">
            {product.category}
          </span>

          <h1>{product.name}</h1>

          {product.rating && (
            <div className="product-detail-rating">
              <Star size={17} fill="currentColor" />
              {product.rating} / 5
            </div>
          )}

          <div className="product-detail-price">
            <strong>
              ₹{product.price.toLocaleString("en-IN")}
            </strong>

            {product.oldPrice && (
              <del>
                ₹{product.oldPrice.toLocaleString("en-IN")}
              </del>
            )}
          </div>

          <p className="product-description">
            {product.description}
          </p>

          <div className="product-size-section">
            <h3>Select Size</h3>

            <div className="product-sizes">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  className={selectedSize === size ? "selected" : ""}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="product-quantity">
            <h3>Quantity</h3>

            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>

            <span>{quantity}</span>

            <button onClick={() => setQuantity(quantity + 1)}>
              +
            </button>
          </div>

          <button
            className="product-add-cart"
            onClick={() => {
              addToCart(product, selectedSize, quantity);
              setMessage(`${quantity} item(s) added to bag!`);
            }}
          >
            <ShoppingBag size={19} />
            ADD TO CART
          </button>

          {message && (
            <p className="product-message">{message}</p>
          )}

          <div className="product-services">
            <p>
              <Truck size={19} />
              Free Shipping on eligible orders
            </p>

            <p>
              <RotateCcw size={19} />
              Easy Returns
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Product;
