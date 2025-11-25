'use client';

import React, { useMemo, useState } from 'react';
import { useNavigate } from '@/lib/react-router-compat';
import AdminShell from '@/components/AdminShell';
import api, { getAuthToken } from '@/lib/api';

const AdminAddRestaurant = () => {
  const navigate = useNavigate();
  const isAuthed = useMemo(() => Boolean(getAuthToken()), []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', logo_url: '', admin_email: '', package_type: 'basic', comment: false });
  const [logoFile, setLogoFile] = useState(null);

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
      const formData = new FormData();
      formData.append('name', form.name);

      // Auto-generate slug from name
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      formData.append('slug', slug);

      formData.append('description', form.description);
      formData.append('admin_email', form.admin_email);
      formData.append('package_type', form.package_type);
      formData.append('comment', form.comment);

      if (logoFile) {
        formData.append('logo', logoFile);
      } else if (form.logo_url) {
        formData.append('logo_url', form.logo_url);
      }

      const res = await api.post('/restaurants', formData);
      setCreated(res.data?.data || null);
      setForm({ name: '', description: '', logo_url: '', admin_email: '', package_type: 'basic', comment: false });
      setLogoFile(null);
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

  console.log('Add Restaurant URL Generation Debug:', {
    hostname,
    baseDomain,
    protocol,
    port
  });

  const subdomainHref = (slug) => {
    const isLocalEnv = hostname === 'localhost' || hostname.endsWith('.localhost');

    if (isLocalEnv) {
      // Development: Always use subdomain format for localhost
      const url = `${protocol}//${slug}.localhost${port}`;
      console.log(`Generated local URL for ${slug}:`, url);
      return url;
    }

    // Production: Use subdomain format
    const url = `${protocol}//${slug}.${baseDomain}`;
    console.log(`Generated production URL for ${slug}:`, url);
    return url;
  };

  return (
    <AdminShell title="Add Restaurant">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Upload Logo File</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                />
              </div>
              <div className="text-center text-gray-500 text-sm">OR</div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Logo URL</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email *</label>
            <input type="email" className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} required />
            <p className="text-xs text-gray-500 mt-1">A random password will be generated for this admin</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package *</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.package_type} onChange={(e) => setForm({ ...form, package_type: e.target.value })}>
              <option value="basic">Basic Package (1 year) - Free</option>
              <option value="premium">Premium Package (2 years) - $100</option>
              <option value="enterprise">Enterprise Package (3 years) - $500</option>
            </select>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Enable Comments</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">Allow customers to leave comments on the menu</p>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate('/admin/restaurants')} className="px-4 py-2 border rounded-md">Cancel</button>
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
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(created.admin_password).then(() => {
                        alert('Password copied to clipboard!');
                      }).catch(() => {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = created.admin_password;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        alert('Password copied to clipboard!');
                      });
                    } else {
                      // Fallback for older browsers
                      const textArea = document.createElement('textarea');
                      textArea.value = created.admin_password;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      alert('Password copied to clipboard!');
                    }
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
              <button onClick={() => navigate('/admin/restaurants')} className="px-3 py-1.5 text-sm border rounded-md bg-amber-50">Go to list</button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminAddRestaurant;

