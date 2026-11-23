
import { Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import Home from "../pages/Home/Home";
import Shop from "../pages/Shop/Shop";
import Categories from "../pages/Categories/Categories";
import Offers from "../pages/Offers/Offers";
import Contact from "../pages/Contact/Contact";
import Product from "../pages/Product/Product";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Auth from "../pages/Auth/Auth";
import Account from "../pages/Account/Account";
import Wishlist from "../pages/Wishlist/Wishlist";
import About from "../pages/About/About";
import FAQ from "../pages/FAQ/FAQ";
import Shipping from "../pages/Shipping/Shipping";
import Returns from "../pages/Returns/Returns";
import Privacy from "../pages/Privacy/Privacy";
import Terms from "../pages/Terms/Terms";

import Admin from "../pages/Admin/Admin";
import AdminOrders from "../pages/Admin/AdminOrders";
import AdminProducts from "../pages/Admin/AdminProducts";
import AdminContacts from "../pages/Admin/AdminContacts";
import AdminStock from "../pages/Admin/AdminStock";

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Admin Route Protection
function AdminRoute({ children }) {
  const { user, loading, isLoggedIn } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <CartProvider>
      <Routes>
        {/* Customer Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />

          <Route
            path="/shop"
            element={<ProtectedRoute><Shop /></ProtectedRoute>}
          />

          <Route
            path="/categories"
            element={<ProtectedRoute><Categories /></ProtectedRoute>}
          />

          <Route
            path="/offers"
            element={<ProtectedRoute><Offers /></ProtectedRoute>}
          />

          <Route
            path="/contact"
            element={<ProtectedRoute><Contact /></ProtectedRoute>}
          />

          <Route
            path="/about"
            element={<ProtectedRoute><About /></ProtectedRoute>}
          />

          <Route
            path="/faq"
            element={<ProtectedRoute><FAQ /></ProtectedRoute>}
          />

          <Route
            path="/shipping-policy"
            element={<ProtectedRoute><Shipping /></ProtectedRoute>}
          />

          <Route
            path="/return-policy"
            element={<ProtectedRoute><Returns /></ProtectedRoute>}
          />

          <Route
            path="/privacy-policy"
            element={<ProtectedRoute><Privacy /></ProtectedRoute>}
          />

          <Route
            path="/terms"
            element={<ProtectedRoute><Terms /></ProtectedRoute>}
          />

          <Route
            path="/product/:id"
            element={<ProtectedRoute><Product /></ProtectedRoute>}
          />

          <Route
            path="/cart"
            element={<ProtectedRoute><Cart /></ProtectedRoute>}
          />

          <Route
            path="/wishlist"
            element={<ProtectedRoute><Wishlist /></ProtectedRoute>}
          />

          <Route
            path="/checkout"
            element={<ProtectedRoute><Checkout /></ProtectedRoute>}
          />

          <Route
            path="/account"
            element={<ProtectedRoute><Account /></ProtectedRoute>}
          />
        </Route>

        {/* Separate Admin Layout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Admin />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="contacts" element={<AdminContacts />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default AppRoutes;
