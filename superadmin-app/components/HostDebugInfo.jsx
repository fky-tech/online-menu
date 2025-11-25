'use client';

import React from 'react';

const HostDebugInfo = () => {
  const hostname = window.location.hostname.toLowerCase();
  const adminHost = (import.meta.env.VITE_ADMIN_HOST || '').toLowerCase();
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || '').toLowerCase();
  const debugMode = import.meta.env.VITE_DEBUG_HOST_DETECTION === 'true';

  if (!debugMode) return null;

  const isAdmin = adminHost 
    ? hostname === adminHost 
    : hostname.startsWith('admin.') || hostname === 'admin.localhost';

  const isLocalRoot = hostname === 'localhost';
  const isLocalTenant = hostname.endsWith('.localhost') && !hostname.startsWith('admin.');

  const isRoot = rootDomain 
    ? hostname === rootDomain || hostname === `www.${rootDomain}`
    : isLocalRoot;

  const hostType = isAdmin ? 'admin' : (isRoot && !isLocalTenant) ? 'root' : 'tenant';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      background: '#000',
      color: '#fff',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Host Debug Info</h4>
      <div>Current hostname: {hostname}</div>
      <div>Admin host env: {adminHost || 'not set'}</div>
      <div>Root domain env: {rootDomain || 'not set'}</div>
      <div>Is admin: {isAdmin ? 'YES' : 'NO'}</div>
      <div>Is root: {isRoot ? 'YES' : 'NO'}</div>
      <div>Is local tenant: {isLocalTenant ? 'YES' : 'NO'}</div>
      <div><strong>Detected type: {hostType}</strong></div>
      <div>URL: {window.location.href}</div>
    </div>
  );
};

export default HostDebugInfo;
