'use client';

import React, { useState, useEffect } from "react";
import api, { setAuthToken } from "@/lib/api";
import { useI18n } from "@/contexts/i18n";
import { useNavigate } from "@/lib/react-router-compat";

const AdminLogin = () => {
    const navigate = useNavigate();
    const { t } = useI18n();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Check if user is already authenticated
    useEffect(() => {
        const checkExistingAuth = async () => {
            try {
                const storedToken = typeof window !== 'undefined' ? localStorage.getItem('sb-access-token') : null;

                if (storedToken) {
                    setAuthToken(storedToken);
                    try {
                        const response = await api.get('/auth/me');
                        if (response.data?.data?.role === 'super_admin') {
                            console.log("✅ User already authenticated, redirecting to metrics");
                            setTimeout(() => {
                                navigate('/admin/metrics', { replace: true });
                            }, 100);
                            return;
                        }
                    } catch (error) {
                        console.log("❌ Token invalid, clearing storage");
                        localStorage.removeItem('sb-access-token');
                        localStorage.removeItem('sb-refresh-token');
                    }
                }
            } catch (error) {
                console.error("Error checking auth:", error);
            } finally {
                setCheckingAuth(false);
            }
        };

        checkExistingAuth();
    }, [navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Call server-side login API to avoid CORS issues
            const loginResponse = await api.post('/auth/login', { email, password });

            if (!loginResponse.data?.success || !loginResponse.data?.data?.session?.access_token) {
                throw new Error("Authentication failed");
            }

            const { user: userData, session } = loginResponse.data.data;

            // Set token for API requests
            setAuthToken(session.access_token);

            // Store session info
            if (typeof window !== 'undefined') {
                localStorage.setItem('sb-access-token', session.access_token);
                localStorage.setItem('sb-refresh-token', session.refresh_token);
            }

            // Check if user is super admin
            if (userData.role !== 'super_admin') {
                throw new Error("Access denied. Super admin role required.");
            }

            // Navigate to admin dashboard
            navigate('/admin/metrics', { replace: true });
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
            <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center mx-auto font-bold">SA</div>
                    <h1 className="mt-3 text-2xl font-serif font-bold text-stone-900">Super Admin Login</h1>
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
                            placeholder="superadmin@example.com"
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

export default AdminLogin;