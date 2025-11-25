'use client';

import React, { useEffect } from 'react';
import { useNavigate, useParams } from '@/lib/react-router-compat';
import api from '@/lib/api';

const Scan = () => {
  const navigate = useNavigate();
  const { slug } = useParams(); // If using /scan/:slug

  useEffect(() => {
    const performScan = async () => {
      try {
        console.log('Starting scan...');
        // Call the backend scan endpoint
        const response = await api.get('/scan', {
          params: slug ? { slug } : {}
        });

        console.log('Scan response:', response.data);

        // Store token if returned (for localStorage mode)
        const token = response.data.data?.token || response.data.token;
        if (token) {
          console.log('Storing token:', token);
          localStorage.setItem('scan_token', token);
        }

        // Redirect to menu after successful scan
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Scan failed:', error);
        // Still redirect to menu, or show error
        navigate('/', { replace: true });
      }
    };

    performScan();
  }, [navigate, slug]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <p className="text-brand-text">Processing scan...</p>
      </div>
    </div>
  );
};

export default Scan;