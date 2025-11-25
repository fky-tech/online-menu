'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/react-router-compat";
import api, { getAuthToken } from "@/lib/api";
import AdminShell from "@/components/AdminShell";

const AdminRestaurants = () => {
  const navigate = useNavigate();
  const isAuthed = useMemo(() => Boolean(getAuthToken()), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [editModal, setEditModal] = useState({
    open: false,
    subscription: null,
    plan: "starter",
    status: "active",
  });
  const [restaurants, setRestaurants] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!isAuthed) {
      navigate("/admin/login", { replace: true });
      return;
    }

    const load = async () => {
      try {
        const [subsRes, restsRes] = await Promise.all([
          api.get("/subscriptions"),
          api.get("/restaurants")
        ]);
        setSubscriptions(subsRes.data?.data || []);
        setRestaurants(restsRes.data?.data || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthed, navigate]);

  const reload = async () => {
    try {
      const [subsRes, restsRes] = await Promise.all([
        api.get("/subscriptions"),
        api.get("/restaurants")
      ]);
      setSubscriptions(subsRes.data?.data || []);
      setRestaurants(restsRes.data?.data || []);
    } catch (e) {
      setError("Failed to reload data");
    }
  };

  const toggleComment = async (restaurantId) => {
    try {
      // Get current value from restaurants array (reliable source)
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (!restaurant) {
        console.error('Restaurant not found:', restaurantId);
        return;
      }

      const currentComment = restaurant.comment || false;
      const newCommentValue = !currentComment;

      console.log('Toggling comment for:', restaurantId, 'current:', currentComment, 'new:', newCommentValue);

      // API call
      await api.put(`/restaurants/${restaurantId}`, { comment: newCommentValue });

      // Update both states
      setRestaurants(prev => prev.map(r =>
        r.id === restaurantId ? { ...r, comment: newCommentValue } : r
      ));

      setSubscriptions(prev => prev.map(s =>
        s.restaurant_id === restaurantId ? {
          ...s,
          restaurants: { ...s.restaurants, comment: newCommentValue }
        } : s
      ));

      setToast("Comment setting updated successfully");
      setTimeout(() => setToast(""), 3000);

    } catch (e) {
      console.error('Toggle comment error:', e);
      alert("Failed to update comment setting");
    }
  };

  const onDelete = async (s) => {
    if (
      !confirm(
        `Delete ${s.restaurants?.name}? This will remove the tenant database too.`
      )
    )
      return;
    try {
      await api.delete(`/restaurants/${s.restaurant_id}`);
      setSubscriptions((prev) =>
        prev.filter((x) => x.restaurant_id !== s.restaurant_id)
      );
    } catch (e) {
      alert("Delete failed");
    }
  };

  const openEdit = (s) =>
    setEditModal({
      open: true,
      subscription: s,
      plan: "starter",
      status: s.status || "active",
    });

  const closeEdit = () =>
    setEditModal({ open: false, subscription: null, plan: "starter", status: "active" });

  const saveEdit = async () => {
    try {
      const s = editModal.subscription;
      const plans = {
        starter: { label: "Starter Menu Package", years: 1 },
        premium: { label: "Premium Menu Experience", years: 1 },
        ultimate: { label: "Ultimate Brand + Website Package", years: 3 },
      };
      const p = plans[editModal.plan];
      const today = new Date();
      const endDate = new Date(today.setFullYear(today.getFullYear() + p.years));

      const payload = {
        restaurant_id: s.restaurant_id,
        plan_type: editModal.plan,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        is_active: true
      };

      await api.post('/subscriptions', payload);
      await reload();
      closeEdit();
      alert('Subscription updated!');
    } catch (e) {
      console.error(e);
      alert('Failed to update subscription');
    }
  };

  if (!isAuthed) return null;

  // helpers for subdomain links
  const hostname = window.location.hostname.toLowerCase();
  const port = window.location.port ? `:${window.location.port}` : "";
  const protocol = window.location.protocol;
  const baseDomain = hostname.replace(/^admin\./, "");

  const subdomainHref = (slug) => {
    const isLocalEnv = hostname === "localhost" || hostname.endsWith(".localhost");
    if (isLocalEnv) return `${protocol}//${slug}.localhost${port}`;
    return `${protocol}//${slug}.${baseDomain}`;
  };

  const calculateDaysLeft = (endDate) => {
    if (!endDate) return "-";
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  };

  const handleCopy = (password) => {
    navigator.clipboard.writeText(password);
    setToast("Password copied to clipboard");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <AdminShell title="View Subscriptions">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-md z-50">
          {toast}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">{error}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-medium text-gray-900">
              Subscriptions
            </h2>
            <button
              onClick={() => navigate("/admin/add-restaurant")}
              className="px-3 py-1.5 text-sm rounded-md bg-amber-600 text-white"
            >
              Add Restaurant
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-3 py-2">Restaurant Name</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Package</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Days Left</th>
                  <th className="px-3 py-2">Comments</th>
                  <th className="px-3 py-2">Admin Email</th>
                  <th className="px-3 py-2">Admin Password</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((s) => {
                  const credentials = s.restaurants?.restaurant_admin_credentials?.[0];
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900">
                        {s.restaurants?.name || "-"}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{s.restaurants?.slug || "-"}</td>
                      <td className="px-3 py-2 text-gray-600">{s.package_name || "-"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${s.status === "active"
                              ? "bg-green-50 text-green-800 border-green-200"
                              : "bg-red-50 text-red-800 border-red-200"
                            }`}
                        >
                          {s.status === "active" ? "Active" : "Expired"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{calculateDaysLeft(s.end_date)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => toggleComment(s.restaurant_id)}
                          className={`px-2 py-1 text-xs rounded ${(restaurants.find(r => r.id === s.restaurant_id)?.comment)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-300 text-gray-700'
                            }`}
                        >
                          {(restaurants.find(r => r.id === s.restaurant_id)?.comment) ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{credentials?.admin_email || "-"}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {credentials?.plain_password ? (
                          <button
                            onClick={() => handleCopy(credentials.plain_password)}
                            className="px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
                          >
                            Copy
                          </button>
                        ) : "-"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2 justify-end">
                          {s.restaurants?.slug && (
                            <button
                              onClick={() => window.open(subdomainHref(s.restaurants.slug) + '/admin/restaurant/' + s.restaurants.slug + '/login', '_blank')}
                              className="px-3 py-1.5 text-xs rounded-md border"
                            >
                              Manage
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(s)}
                            className="px-3 py-1.5 text-xs rounded-md border"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(s)}
                            className="px-3 py-1.5 text-xs rounded-md border text-red-700"
                          >
                            Delete
                          </button>
                          {s.restaurants?.slug && (
                            <a
                              href={subdomainHref(s.restaurants.slug)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 text-xs rounded-md border"
                            >
                              Open
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-4">
            <div className="text-lg font-medium mb-2">Update Subscription</div>
            <div className="text-sm text-gray-600 mb-3">
              {editModal.subscription?.restaurants?.name}
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Plan
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              value={editModal.plan}
              onChange={(e) =>
                setEditModal((m) => ({ ...m, plan: e.target.value }))
              }
            >
              <option value="starter">Starter Menu Package (1 year)</option>
              <option value="premium">Premium Menu Experience (1 year)</option>
              <option value="ultimate">
                Ultimate Brand + Website Package (3 years)
              </option>
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              value={editModal.status}
              onChange={(e) =>
                setEditModal((m) => ({ ...m, status: e.target.value }))
              }
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeEdit}
                className="px-3 py-1.5 text-sm rounded-md border"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-1.5 text-sm rounded-md bg-amber-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminRestaurants;