'use client';

import React, { useState } from "react";
import api, { setAuthToken } from "@/lib/api";
import { useNavigate, useParams } from "@/lib/react-router-compat";

const RestaurantAdminLogin = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call server-side login API to avoid CORS issues
      const loginResponse = await api.post('/auth/login', { email, password });

      if (!loginResponse.data?.success || !loginResponse.data?.data?.session?.access_token) {
        throw new Error("Authentication failed - no session token");
      }

      const { user: userData, session } = loginResponse.data.data;

      // Set token for API requests
      setAuthToken(session.access_token);

      // Store session info in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('sb-access-token', session.access_token);
        localStorage.setItem('sb-refresh-token', session.refresh_token);
      }

      // Check if user is tenant admin
      if (userData.role !== 'tenant_admin') {
        throw new Error("Access denied. Tenant admin role required.");
      }

      // Navigate to restaurant admin dashboard
      navigate(`/admin/restaurant/${slug}`, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center mx-auto font-bold">RA</div>
          <h1 className="mt-3 text-2xl font-serif font-bold text-stone-900">Restaurant Admin Login</h1>
          {slug && <p className="text-sm text-stone-600 mt-1">Restaurant: /{slug}</p>}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary h-11 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RestaurantAdminLogin;
