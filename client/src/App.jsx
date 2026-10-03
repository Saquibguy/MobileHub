import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import { Footer } from "./components/Common";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/Cart";
import WishlistPage from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import { Orders, OrderDetail } from "./pages/Orders";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import SellerDashboard from "./pages/Seller/SellerDashboard";
import { NotFound } from "./pages/ErrorPages";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/cart" element={<ProtectedRoute roles={["CUSTOMER"]}><CartPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute roles={["CUSTOMER"]}><WishlistPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute roles={["CUSTOMER"]}><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute roles={["CUSTOMER"]}><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="/admin/*" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/seller/*" element={<ProtectedRoute roles={["SELLER"]}><SellerDashboard /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
