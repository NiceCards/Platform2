import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';
import { ProtectedRoute } from './components/ProtectedRoute';

import Home from './pages/Home';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import ProductDetails from './pages/ProductDetails';
import SearchResults from './pages/SearchResults';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OrderSuccess from './pages/OrderSuccess';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import AdminLogin from './admin/AdminLogin';
import AdminForgotPassword from './admin/AdminForgotPassword';
import AdminResetPassword from './admin/AdminResetPassword';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminProductForm from './admin/AdminProductForm';
import AdminOrders from './admin/AdminOrders';
import AdminDeliveredOrders from './admin/AdminDeliveredOrders';
import AdminCustomers from './admin/AdminCustomers';
import AdminCustomerDetails from './admin/AdminCustomerDetails';
import AdminSettings from './admin/AdminSettings';

const App = () => (
  <div className="flex min-h-screen flex-col">
    <ScrollToTop />
    <Routes>
      {/* Admin routes render without the storefront chrome */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password" element={<AdminResetPassword />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/delivered" element={<AdminDeliveredOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customers/:id" element={<AdminCustomerDetails />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Storefront */}
      <Route
        path="*"
        element={
          <>
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/category/:slug" element={<CategoryProducts />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <WhatsAppButton />
          </>
        }
      />
    </Routes>
  </div>
);

export default App;
