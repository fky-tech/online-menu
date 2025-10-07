import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getAuthToken } from "../api";
import AdminShell from "../components/AdminShell";

const AdminRestaurants = () => {
  const navigate = useNavigate();
  const isAuthed = useMemo(() => Boolean(getAuthToken()), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, restaurant: null, plan: 'starter', status: 'active' });

  useEffect(() => {
    if (!isAuthed) {
      navigate("/admin/login", { replace: true });
      return;
    }
    const load = async () => {
      try {
        const res = await api.get('/restaurants');
        setRestaurants(res.data?.data || []);
      } catch (e) {
        setError('Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthed, navigate]);
  const reload = async () => {
    try {
      const res = await api.get('/restaurants');
      setRestaurants(res.data?.data || []);
    } catch (e) {
      setError('Failed to load restaurants');
    }
  };

  const onDelete = async (r) => {
    if (!confirm(`Delete ${r.name}? This will remove the tenant database too.`)) return;
    try {
      await api.delete(`/restaurants/${r.id}`);
      setRestaurants(prev => prev.filter(x => x.id !== r.id));
    } catch (e) {
      alert('Delete failed');
    }
  };

  const openEdit = (r) => setEditModal({ open: true, restaurant: r, plan: 'starter', status: r.subscription_status || 'active' });
  const closeEdit = () => setEditModal({ open: false, restaurant: null, plan: 'starter', status: 'active' });
  const saveEdit = async () => {
    try {
      const r = editModal.restaurant;
      const plans = {
        starter: { label: 'Starter Menu Package', years: 1 },
        premium: { label: 'Premium Menu Experience', years: 1 },
        ultimate: { label: 'Ultimate Brand + Website Package', years: 3 },
      };
      const p = plans[editModal.plan];
      const today = new Date();
      const end = new Date(today);
      end.setFullYear(end.getFullYear() + p.years);
      const pad = (n)=>String(n).padStart(2,'0');
      const d = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
      const e = `${end.getFullYear()}-${pad(end.getMonth()+1)}-${pad(end.getDate())}`;
      await api.post('/subscriptions', {
        restaurant_id: r.id,
        package_type: p.label,
        start_date: d,
        end_date: e,
        status: editModal.status,
        amount_paid: 0,
      });
      await reload();
      closeEdit();
    } catch (err) {
      alert('Failed to update subscription');
    }
  };




  if (!isAuthed) return null;

  // helpers to build subdomain links
  const hostname = window.location.hostname.toLowerCase();
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;
  const baseDomain = hostname.replace(/^admin\./, '');
  const subdomainHref = (slug) => {
    const useDevSubdomain = import.meta.env.VITE_DEV_SUBDOMAIN === '1';
    const isLocalEnv = hostname === 'localhost' || hostname.endsWith('.localhost');
    if (isLocalEnv && useDevSubdomain) {
      return `${protocol}//${slug}.localhost${port}`;
    }
    if (isLocalEnv) return `/restaurant/${slug}`;
    return `${protocol}//${slug}.${baseDomain}`;
  };

  return (
    <AdminShell title="View Restaurants">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>

      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">{error}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-medium text-gray-900">Restaurants</h2>
            <button onClick={()=>navigate('/admin/add-restaurant')} className="px-3 py-1.5 text-sm rounded-md bg-amber-600 text-white">Add Restaurant</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Admin Email</th>
                  <th className="px-3 py-2">Package</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Days Left</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {restaurants.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900">{r.name}</td>
                    <td className="px-3 py-2 text-gray-600">{r.slug}</td>
                    <td className="px-3 py-2 text-gray-600">{r.admin_email || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{r.package_type || '-'}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${r.subscription_status==='active' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        {r.subscription_status==='active' ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{typeof r.days_left === 'number' ? r.days_left : '-'}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2 justify-end">
                        {r.admin_password && (
                          <button
                            onClick={() => { navigator.clipboard.writeText(r.admin_password); alert('Password copied'); }}
                            className="px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
                          >Copy</button>
                        )}
                        <button onClick={() => openEdit(r)} className="px-3 py-1.5 text-xs rounded-md border">Edit</button>
                        <button onClick={() => onDelete(r)} className="px-3 py-1.5 text-xs rounded-md border text-red-700">Delete</button>
                        <a href={subdomainHref(r.slug)} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs rounded-md border">Open</a>
                        <a href={`/admin/restaurant/${r.slug}`} className="px-3 py-1.5 text-xs rounded-md border">Manage</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-4">
            <div className="text-lg font-medium mb-2">Update Subscription</div>
            <div className="text-sm text-gray-600 mb-3">{editModal.restaurant?.name}</div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              value={editModal.plan}
              onChange={(e)=>setEditModal(m=>({...m, plan: e.target.value}))}
            >
              <option value="starter">Starter Menu Package (1 year)</option>
              <option value="premium">Premium Menu Experience (1 year)</option>
              <option value="ultimate">Ultimate Brand + Website Package (3 years)</option>
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              value={editModal.status}
              onChange={(e)=>setEditModal(m=>({...m, status: e.target.value}))}
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={closeEdit} className="px-3 py-1.5 text-sm rounded-md border">Cancel</button>
              <button onClick={saveEdit} className="px-3 py-1.5 text-sm rounded-md bg-amber-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}

    </AdminShell>
  );
};

export default AdminRestaurants;


