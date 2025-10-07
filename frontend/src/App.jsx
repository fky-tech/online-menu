import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Menu from './pages/Menu';

import AdminRestaurants from './pages/AdminRestaurants';
import AdminAddRestaurant from './pages/AdminAddRestaurant';
import AdminTenant from './pages/AdminTenant';
import Login from './pages/AdminLogin';
import RestaurantAdminLogin from './pages/RestaurantAdminLogin';
import { I18nProvider } from './i18n';
import Layout from './components/Layout'; // Import the new Layout
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Marketing from './pages/Marketing';


// Placeholder pages for demonstration
const PlaceholderPage = ({ title }) => (
  <Layout title={title}>
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-brand-muted mt-2">Content for this page goes here.</p>
    </div>
  </Layout>
);

function detectHostType() {
  const hostname = window.location.hostname.toLowerCase(); // no port
  const adminHost = (import.meta.env.VITE_ADMIN_HOST || '').toLowerCase();
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || '').toLowerCase();

  const isAdmin = adminHost ? hostname === adminHost : hostname.startsWith('admin.');

  // Localhost rules: treat exactly 'localhost' as root; 'something.localhost' as tenant
  const isLocalRoot = hostname === 'localhost';
  const isLocalTenant = hostname.endsWith('.localhost');

  const isRoot = rootDomain ? hostname === rootDomain : isLocalRoot;

  if (isAdmin) return 'admin';
  if (isRoot && !isLocalTenant) return 'root';
  return 'tenant';
}

function RequireAdmin({ children }) {
  const location = useLocation();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_token') : null;
  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return children;
}



const App = () => {
  const hostType = detectHostType();
  return (
    <I18nProvider>
      <Router>
        <Routes>
          {hostType === 'admin' && (
            <>
              <Route path="/" element={<Navigate to="/admin/metrics" replace />} />
              <Route path="/admin/metrics" element={<RequireAdmin><SuperAdminDashboard /></RequireAdmin>} />
              <Route path="/admin/restaurants" element={<RequireAdmin><AdminRestaurants /></RequireAdmin>} />
              <Route path="/admin/add-restaurant" element={<RequireAdmin><AdminAddRestaurant /></RequireAdmin>} />
              <Route path="/admin/restaurant/:slug" element={<RequireAdmin><AdminTenant /></RequireAdmin>} />
              <Route path="/admin/restaurant/:slug/login" element={<RestaurantAdminLogin />} />
              <Route path="/admin/login" element={<Login />} />
            </>
          )}

          {hostType === 'root' && (
            <>
              <Route path="/" element={<Marketing />} />
              <Route path="/restaurant/:slug" element={<Menu />} />
              {/* convenience */}
              <Route path="/admin/login" element={<Login />} />
            </>
          )}

          {hostType === 'tenant' && (
            <>
              <Route path="/" element={<Menu />} />
              <Route path="/restaurant/:slug" element={<Menu />} />
              <Route path="/admin/restaurant/:slug/login" element={<RestaurantAdminLogin />} />
              <Route path="/admin/restaurant/:slug" element={<AdminTenant />} />
            </>
          )}

          {/* shared placeholders */}
          <Route path="/cart" element={<PlaceholderPage title="Cart" />} />
          <Route path="/about" element={<PlaceholderPage title="About" />} />
          <Route path="/contact" element={<PlaceholderPage title="Contact" />} />

          {/* catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </I18nProvider>
  );
};

export default App;