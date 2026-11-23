
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <AppRoutes />
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;



