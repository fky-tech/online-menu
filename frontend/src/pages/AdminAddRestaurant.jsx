import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminShell from '../components/AdminShell';
import api, { getAuthToken } from '../api';

const AdminAddRestaurant = () => {
  const navigate = useNavigate();
  const isAuthed = useMemo(() => Boolean(getAuthToken()), []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', logo_url: '', admin_email: '', package_type: 'starter' });

  if (!isAuthed) {
    navigate('/admin/login', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setCreated(null);
    try {
      const res = await api.post('/restaurants', form);
      setCreated(res.data?.data || null);
      setForm({ name: '', description: '', logo_url: '', admin_email: '', package_type: 'starter' });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

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
    <AdminShell title="Add Restaurant">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" rows="3" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.logo_url} onChange={(e)=>setForm({...form, logo_url:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email *</label>
            <input type="email" className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.admin_email} onChange={(e)=>setForm({...form, admin_email:e.target.value})} required />
            <p className="text-xs text-gray-500 mt-1">A random password will be generated for this admin</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package *</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.package_type} onChange={(e)=>setForm({...form, package_type:e.target.value})}>
              <option value="starter">Starter Menu Package (1 year)</option>
              <option value="premium">Premium Menu Experience (1 year)</option>
              <option value="ultimate">Ultimate Brand + Website Package (3 years)</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={()=>navigate('/admin/restaurants')} className="px-4 py-2 border rounded-md">Cancel</button>
            <button disabled={saving} type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-md">{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>

        {created && (
          <div className="mt-6 bg-white rounded-xl border p-5 space-y-3">
            <div className="font-medium text-gray-900">✓ Restaurant created successfully</div>
            <div className="text-sm text-gray-600">Subdomain: <a className="text-amber-700 underline" href={subdomainHref(created.slug)} target="_blank" rel="noreferrer">{created.slug}</a></div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
              <div className="font-medium text-sm text-gray-900">Admin Credentials</div>
              <div className="text-sm">
                <span className="text-gray-600">Email:</span> <span className="font-mono text-gray-900">{created.admin_email}</span>
              </div>
              <div className="text-sm flex items-center gap-2">
                <span className="text-gray-600">Password:</span>
                <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded border">{created.admin_password}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(created.admin_password);
                    alert('Password copied to clipboard!');
                  }}
                  className="px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-amber-800">⚠️ Save this password now. You can also copy it later from the restaurants list.</p>
            </div>

            <div className="flex gap-2">
              <a href={subdomainHref(created.slug)} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-sm border rounded-md">Open Public Site</a>
              <a href={`/admin/restaurant/${created.slug}`} className="px-3 py-1.5 text-sm border rounded-md">Open Admin</a>
              <button onClick={()=>navigate('/admin/restaurants')} className="px-3 py-1.5 text-sm border rounded-md bg-amber-50">Go to list</button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminAddRestaurant;

