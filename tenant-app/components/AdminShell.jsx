'use client';

import React from 'react';
import { NavLink, useNavigate } from '@/lib/react-router-compat';
import { clearAuthToken, getAuthToken } from '@/lib/api';
import { signOut } from '@/lib/supabase';

const NavItem = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-amber-100 text-amber-800' : 'text-gray-700 hover:bg-gray-100'}`
    }
  >
    {label}
  </NavLink>
);

const AdminShell = ({ children, title }) => {
  const navigate = useNavigate();
  const isAuthed = Boolean(getAuthToken());

  const onLogout = async () => {
    try {
      await signOut();
      clearAuthToken();
      // Force a page reload to ensure clean state
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
      clearAuthToken();
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 p-4 sticky top-0 h-screen hidden sm:block">
        <div className="mb-6">
          <div className="text-xl font-bold text-gray-900">Super Admin</div>
          <div className="text-xs text-gray-500">Control Panel</div>
        </div>
        <nav className="space-y-1">
          <NavItem to="/admin/metrics" label="Dashboard" />
          <NavItem to="/admin/add-restaurant" label="Add Restaurant" />
          <NavItem to="/admin/restaurants" label="View Restaurants" />
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="font-semibold text-gray-900">{title}</div>
            <div className="flex items-center gap-2">
              {isAuthed ? (
                <button onClick={onLogout} className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white">Logout</button>
              ) : (
                <NavLink to="/admin/login" className="px-3 py-1.5 text-sm rounded-md bg-amber-600 text-white">Login</NavLink>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pb-6">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="flex">
            <NavLink
              to="/admin/metrics"
              className={({ isActive }) => `flex-1 text-center py-2 text-sm ${isActive ? 'text-amber-700' : 'text-gray-700'}`}
            >Dashboard</NavLink>
            <NavLink
              to="/admin/add-restaurant"
              className={({ isActive }) => `flex-1 text-center py-2 text-sm ${isActive ? 'text-amber-700' : 'text-gray-700'}`}
            >Add</NavLink>
            <NavLink
              to="/admin/restaurants"
              className={({ isActive }) => `flex-1 text-center py-2 text-sm ${isActive ? 'text-amber-700' : 'text-gray-700'}`}
            >Restaurants</NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminShell;

