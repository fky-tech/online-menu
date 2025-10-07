import React from 'react';
import { NavLink } from 'react-router-dom';
import Footer from './Footer'; // This will be our bottom nav

const Layout = ({ children, title, searchOpen, setSearchOpen, query, setQuery, searchInputRef }) => {
  return (
    <div className="min-h-screen bg-brand-background text-brand-text flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-brand-background/80 backdrop-blur-sm flex items-center px-4 py-3">
        <div className="flex items-center w-full max-w-3xl mx-auto gap-3">
          {/* Logo Icon */}
          <div className="flex-shrink-0">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#F97316"/>
              <text x="16" y="21" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white" fontFamily="Montserrat, Arial, sans-serif">🍔</text>
            </svg>
          </div>
          {/* Search Bar */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery && setQuery(e.target.value)}
                placeholder="Search for food..."
                className="w-full rounded-full border px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
          {/* Admin Link */}
          <div className="flex-shrink-0">
            {(() => {
              const h = window.location.hostname.toLowerCase();
              let adminHref = '/admin/login';
              const idx = h.indexOf('.localhost');
              if (idx > 0) {
                const slug = h.slice(0, idx);
                adminHref = `/admin/restaurant/${slug}/login`;
              } else {
                const root = (import.meta.env.VITE_ROOT_DOMAIN || '').toLowerCase();
                if (root && h.endsWith(root)) {
                  const withoutRoot = h.slice(0, -root.length).replace(/\.$/, '');
                  if (withoutRoot) adminHref = `/admin/restaurant/${withoutRoot}/login`;
                }
              }
              return (
                <NavLink to={adminHref} className="text-sm font-medium text-brand-muted hover:text-brand-text px-3 py-1">
                  Admin
                </NavLink>
              );
            })()}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <Footer />
    </div>
  );
};

export default Layout;