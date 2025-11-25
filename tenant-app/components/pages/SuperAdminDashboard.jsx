'use client';

import React, { useEffect, useMemo, useState } from 'react';
import api, { getAuthToken } from '@/lib/api';
import AdminShell from '@/components/AdminShell';

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedList, setSelectedList] = useState(''); // 'active' | 'expired' | ''
  const isAuthed = useMemo(() => Boolean(getAuthToken()), []);

  const fmtMoney = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n) || 0);

  const fmtBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const curMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  }, []);
  const currentRevenue = useMemo(() => {
    const rows = metrics?.revenueTrends || [];
    const found = rows.find(r => r.month === curMonth) || rows[rows.length - 1];
    return Number(found?.revenue) || 0;
  }, [metrics, curMonth]);

  const reloadMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/metrics');
      setMetrics(res.data?.data || null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/metrics');
        setMetrics(res.data?.data || null);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSelect = async (kind) => {
    try {
      setSelectedList(kind);
      if (!restaurants.length) {
        const res = await api.get('/restaurants');
        setRestaurants(res.data?.data || []);
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <AdminShell title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">{error}</div>
      ) : metrics ? (
        <div className="space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div onClick={() => handleSelect('active')} className="bg-white p-4 rounded-lg border cursor-pointer hover:shadow">
              <div className="text-sm text-gray-500">Active Restaurants</div>
              <div className="text-3xl font-bold">{metrics.activeRestaurants}</div>
            </div>
            <div onClick={() => handleSelect('expired')} className="bg-white p-4 rounded-lg border cursor-pointer hover:shadow">
              <div className="text-sm text-gray-500">Expired Restaurants</div>
              <div className="text-3xl font-bold">{metrics.expiredRestaurants}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-500">Current Month Revenue</div>
              <div className="text-2xl font-bold">{fmtMoney(currentRevenue)}</div>
              <div className="text-xs text-gray-500 mt-1">{curMonth}</div>
            </div>
          </section>

          {/* Subscription Distribution moved above Revenue Trends */}
          <section className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-500 mb-2">Subscription Distribution</div>
              {(() => {
                const dist = metrics.subscriptionDistribution || [];
                const total = dist.reduce((s,d) => s + (Number(d.cnt)||0), 0) || 1;
                const colors = ['#f59e0b','#2563eb','#10b981','#ef4444','#8b5cf6','#14b8a6'];
                let acc = 0;
                const stops = dist.map((d,i) => {
                  const share = (Number(d.cnt)||0)/total;
                  const start = acc;
                  acc += share;
                  const end = acc;
                  return `${colors[i%colors.length]} ${Math.round(start*360)}deg ${Math.round(end*360)}deg`;
                });
                return (
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-40 rounded-full" style={{ background: `conic-gradient(${stops.join(',')})` }} />
                    <div className="space-y-1 text-sm">
                      {dist.map((d,i)=>{
                        const share = Math.round(((Number(d.cnt)||0)/total)*100);
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i%colors.length] }} />
                            <span className="font-medium">{d.package_type}</span>
                            <span className="text-gray-500">{d.cnt} ({share}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

          </section>

          {/* Supabase Usage Section */}
          {metrics.supabaseUsage && (
            <section className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-500 mb-4">Supabase Usage</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Database Size</div>
                  <div className="text-lg font-bold">{fmtBytes(metrics.supabaseUsage.database?.size)}</div>
                  <div className="text-xs text-gray-400">of {fmtBytes(metrics.supabaseUsage.database?.limit)}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((metrics.supabaseUsage.database?.size || 0) / (metrics.supabaseUsage.database?.limit || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Storage Size</div>
                  <div className="text-lg font-bold">{fmtBytes(metrics.supabaseUsage.storage?.size)}</div>
                  <div className="text-xs text-gray-400">of {fmtBytes(metrics.supabaseUsage.storage?.limit)}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((metrics.supabaseUsage.storage?.size || 0) / (metrics.supabaseUsage.storage?.limit || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Bandwidth Used</div>
                  <div className="text-lg font-bold">{fmtBytes(metrics.supabaseUsage.bandwidth?.used)}</div>
                  <div className="text-xs text-gray-400">of {fmtBytes(metrics.supabaseUsage.bandwidth?.limit)}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((metrics.supabaseUsage.bandwidth?.used || 0) / (metrics.supabaseUsage.bandwidth?.limit || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Realtime Connections</div>
                  <div className="text-lg font-bold">{metrics.supabaseUsage.realtime?.connections || 0}</div>
                  <div className="text-xs text-gray-400">of {metrics.supabaseUsage.realtime?.limit || 0}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((metrics.supabaseUsage.realtime?.connections || 0) / (metrics.supabaseUsage.realtime?.limit || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="bg-white p-4 rounded-lg border">


            <div className="text-sm text-gray-500">Revenue Trends (by month)</div>
            <div className="mt-3 space-y-2">
              {(() => {
                const rows = metrics.revenueTrends || [];
                const max = Math.max(1, ...rows.map(r => Number(r.revenue) || 0));
                return rows.map((m) => {
                  const val = Number(m.revenue) || 0;
                  const pct = Math.round((val / max) * 100);
                  return (
                    <div key={m.month} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-gray-500">{m.month}</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded">
                        <div className="h-2 bg-emerald-600 rounded" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-20 text-right text-sm font-medium">{fmtMoney(val)}</div>
                    </div>
                  );
                });
              })()}
            </div>
          </section>

            {selectedList && (
              <section className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-500">{selectedList === 'active' ? 'Active Restaurants' : 'Expired Restaurants'}</div>
                  <button onClick={()=>setSelectedList('')} className="text-xs text-gray-600 hover:text-gray-800">Clear</button>
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {restaurants
                        .filter(r => selectedList === 'active' ? r.subscription_status === 'active' : r.subscription_status !== 'active')
                        .map(r => (
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
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

        </div>
      ) : null}
    </AdminShell>
  );
};

export default SuperAdminDashboard;

