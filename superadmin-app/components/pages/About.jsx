'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from '@/lib/react-router-compat';
import Layout from '@/components/Layout';
import LazyImage from '@/components/LazyImage';
import { useI18n } from '@/contexts/i18n';
import api from '@/lib/api';

const About = () => {
  const { slug: urlSlug } = useParams();
  const { t, lang, setLang } = useI18n();
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurantLanguage, setRestaurantLanguage] = useState('en');

  // Get slug from URL params or hostname
  const getSlug = () => {
    if (urlSlug) return urlSlug;

    // Extract slug from hostname for tenant subdomains
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.endsWith('.localhost')) {
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts[0]; // e.g., 'abc' from 'abc.localhost'
      }
    }
    return 'abc'; // fallback
  };

  // Load restaurant's language setting
  useEffect(() => {
    const loadRestaurantLanguage = async () => {
      try {
        // Try subdomain-based language endpoint first, then fallback to slug-based
        let langRes;
        try {
          langRes = await api.get('/public/language');
        } catch (error) {
          const slug = getSlug();
          if (slug && (error.response?.status === 400 || error.response?.status === 404)) {
            // Fallback to slug-based route
            langRes = await api.get(`/restaurants/${slug}/public/language`);
          } else {
            throw error;
          }
        }

        const restaurantLang = langRes.data?.data?.primary_language || 'en';
        setRestaurantLanguage(restaurantLang);
        // Don't override user's language preference - let them control it via the language toggle
        // setLang(restaurantLang);
      } catch (error) {
        console.log('Could not load restaurant language:', error);
        setRestaurantLanguage('en');
      }
    };

    loadRestaurantLanguage();
  }, []);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        setError(null);
        const slug = getSlug();
        console.log('Fetching about data for slug:', slug);

        // Try subdomain-based route first, then fallback to slug-based route
        let response;
        try {
          response = await api.get('/public/about');
        } catch (error) {
          if (error.response?.status === 400 || error.response?.status === 404) {
            // Fallback to slug-based route
            console.log('Falling back to slug-based about route');
            response = await api.get(`/restaurants/${slug}/public/about`);
          } else {
            throw error;
          }
        }

        console.log('About API response status:', response.status);
        const data = response.data;
        console.log('About API response data:', data);

        if (data.success) {
          console.log('About data received:', data.data);
          console.log('Payment info:', data.data.paymentInfo);
          setAboutData(data.data);
        } else {
          setError(data.message || 'Failed to load about information');
        }
      } catch (err) {
        console.error('Error fetching about data:', err);
        setError('Failed to load about information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading') || 'Loading...'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              {t('retry') || 'Retry'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const { restaurant, paymentInfo } = aboutData || {};

  return (
    <Layout hideLanguageToggle={true}>
      <div className="min-h-screen bg-brand-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-brand-text mb-4">
              {lang === 'am' ? 'የክፍያ መረጃ' : 'Payment Info'}
            </h1>
          </div>

          {/* Restaurant Information */}
          {restaurant && (
            <div className="bg-brand-surface rounded-lg shadow-md border border-brand-border p-8 mb-8">
              <h2 className="text-2xl font-semibold text-brand-text mb-6">
                {lang === 'am' ? 'የሬስቶራንት መረጃ' : 'Restaurant Information'}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-brand-text mb-2">
                    {lang === 'am' ? 'ስም' : 'Name'}
                  </h3>
                  <p className="text-brand-muted">{restaurant.name}</p>
                </div>

                {restaurant.description && (
                  <div>
                    <h3 className="text-lg font-medium text-brand-text mb-2">
                      {lang === 'am' ? 'ማብራሪያ' : 'Description'}
                    </h3>
                    <p className="text-brand-muted">{restaurant.description}</p>
                  </div>
                )}

                {restaurant.address && (
                  <div>
                    <h3 className="text-lg font-medium text-brand-text mb-2">
                      {lang === 'am' ? 'አድራሻ' : 'Address'}
                    </h3>
                    <p className="text-brand-muted">{restaurant.address}</p>
                  </div>
                )}

                {restaurant.phone && (
                  <div>
                    <h3 className="text-lg font-medium text-brand-text mb-2">
                      {lang === 'am' ? 'ስልክ' : 'Phone'}
                    </h3>
                    <p className="text-brand-muted">{restaurant.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          {paymentInfo && paymentInfo.length > 0 && (
            <div className="space-y-6">
              {paymentInfo.map((payment, index) => (
                <div key={payment.id || index} className="bg-brand-surface rounded-lg shadow-md border border-brand-border p-12">
                  <div className="text-center space-y-8">
                    {/* Logo at top */}
                    {payment.logo_url && (
                      <div className="flex justify-center mb-6">
                        <LazyImage
                          src={payment.logo_url}
                          alt="Payment Logo"
                          className="h-24 w-auto object-contain border border-brand-border rounded-lg p-2 bg-white shadow-sm"
                          placeholderType="logo"
                          lazyOptions={{
                            rootMargin: '100px',
                            threshold: 0.1
                          }}
                          showLoadingSpinner={true}
                          onLoad={() => {
                            console.log('Payment logo loaded successfully:', payment.logo_url);
                          }}
                          onError={() => {
                            console.error('Failed to load payment logo:', payment.logo_url);
                          }}
                        />
                      </div>
                    )}

                    {/* Account number below */}
                    <div>
                      <p className="text-3xl font-mono font-bold text-brand-text bg-brand-background px-8 py-6 rounded-lg inline-block border-2 border-brand-border">
                        {payment.account_details}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Payment Info Message */}
          {(!paymentInfo || paymentInfo.length === 0) && (
            <div className="bg-brand-surface rounded-lg shadow-md border border-brand-border p-8 text-center">
              <div className="text-brand-muted mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {lang === 'am' ? 'የክፍያ መረጃ አልተገኘም' : 'No Payment Information Available'}
              </h3>
              <p className="text-gray-600">
                {lang === 'am'
                  ? 'የክፍያ መረጃ ገና አልተጨመረም።'
                  : 'Payment information has not been added yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default About;
