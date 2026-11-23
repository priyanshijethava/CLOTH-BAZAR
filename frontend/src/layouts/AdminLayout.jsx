
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  LogOut,
  Store,
  Mail,
  Warehouse,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Store size={25} />
          <h2>CLOTH BAZAR</h2>
        </div>

        <p className="admin-sidebar-label">ADMIN MENU</p>

        <nav className="admin-sidebar-nav">
          <NavLink to="/admin" end>
            <LayoutDashboard size={19} />
            Dashboard
          </NavLink>

          <NavLink to="/admin/orders">
            <ShoppingCart size={19} />
            Manage Orders
          </NavLink>

          <NavLink to="/admin/products">
            <Package size={19} />
            All Products
          </NavLink>

          <NavLink to="/admin/stock">
            <Warehouse size={19} />
            Stock Management
          </NavLink>

          <NavLink to="/admin/contacts">
            <Mail size={19} />
            Contact Messages
          </NavLink>
        </nav>

        <button
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
