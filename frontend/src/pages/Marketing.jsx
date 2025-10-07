import React, { useEffect, useState } from 'react';
import api from '../api';

const Marketing = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/public/restaurants');
        setRestaurants(res.data?.data || []);
      } catch (e) {
        setError('Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [search, setSearch] = useState('');
  const filtered = restaurants.filter(r => {
    const q = search.toLowerCase();
    return !q || (String(r.name||'').toLowerCase().includes(q) || String(r.slug||'').toLowerCase().includes(q));
  });


  const hostname = window.location.hostname.toLowerCase();
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;
  const baseDomain = hostname.replace(/^admin\./, '');

  const subdomainHref = (slug) => {
    const useDevSubdomain = import.meta.env.VITE_DEV_SUBDOMAIN === '1';
    if (hostname === 'localhost' && useDevSubdomain) {
      return `${protocol}//${slug}.localhost${port}`;
    }
    if (hostname.includes('localhost')) return `/restaurant/${slug}`;
    return `${protocol}//${slug}.${baseDomain}`;
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">YourApp</div>
          <div className="space-x-4 text-sm">
            <a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#features" className="hover:underline">Features</a>
            <a href="/admin/login" className="px-3 py-1.5 bg-amber-600 text-white rounded-md">Super Admin</a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <section className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">Launch your restaurant menu in minutes</h1>
          <p className="text-stone-600 mt-2">Multi-tenant SaaS with custom subdomains, images, categories, and more.</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <a href="#directory" className="px-4 py-2 border rounded-md hover:bg-stone-50">Explore Directory</a>
            <a href="/admin/login" className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">Get Started</a>
          </div>
        </section>

        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Custom Subdomains","Tenant Admin","Subscriptions"].map((f) => (
            <div key={f} className="p-4 bg-white rounded-lg border">
              <div className="font-semibold">{f}</div>
              <p className="text-sm text-stone-600 mt-1">Powerful features to manage menus at scale.</p>
            </div>
          ))}
        </section>

        <section id="directory" className="space-y-4">
          <div className="text-lg font-semibold">Explore restaurants</div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-stone-600 text-sm">Browse live tenants</div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants..."
              className="px-3 py-2 border rounded-md text-sm w-60"
            />
          </div>
          {loading ? (
            <div className="text-stone-600">Loading directory...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((r) => (
                <a key={r.id} href={subdomainHref(r.slug)} className="p-4 bg-white rounded-lg border hover:shadow flex items-center gap-3">
                  {r.logo_url ? (
                    <img src={r.logo_url} alt={`${r.name} logo`} className="w-10 h-10 rounded object-cover border" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-stone-200 flex items-center justify-center text-stone-600 text-sm">{(r.name||'')[0]||'R'}</div>


                  )}
                  <div>
                    <div className="font-bold">{r.name}</div>
                    <div className="text-sm text-stone-600">/{r.slug}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="mt-2">
          <div className="text-center text-stone-600 text-sm mb-3">Trusted by teams worldwide</div>
          <div className="flex flex-wrap justify-center gap-6 opacity-70">
            {['SushiCo','PizzaMax','CafePrime','BurgerWorks','GreenBowl'].map((b)=> (
              <div key={b} className="text-sm font-semibold tracking-wide">{b}</div>
            ))}
          </div>
        </section>


        <section id="pricing" className="space-y-3">
          <div className="text-lg font-semibold">Pricing</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Basic","Pro","Enterprise"].map((p, i) => (
              <div key={p} className="p-4 bg-white rounded-lg border">
                <div className="font-bold">{p}</div>
                <div className="text-2xl mt-2">{i===0?"$9":i===1?"$29":"$99"}/mo</div>
                <ul className="mt-2 text-sm text-stone-600 list-disc pl-5">
                  <li>Host-based tenancy</li>
                  <li>Image uploads</li>
                  <li>Owner admin</li>
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-10 border-t py-6 text-center text-sm text-stone-600">
        © {new Date().getFullYear()} YourApp
      </footer>
    </div>
  );
};

export default Marketing;

