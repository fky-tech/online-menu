'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useI18n } from '@/contexts/i18n';
import api from '@/lib/api';

const Contact = () => {
  const { t, lang, setLang } = useI18n();
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurantLanguage, setRestaurantLanguage] = useState('en');

  // Get slug from hostname for tenant subdomains
  const getSlug = () => {
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
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const slug = getSlug();
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
        const data = response.data;

        if (data.success) {
          setRestaurantData(data.data.restaurant);
        }
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
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

  return (
    <Layout hideLanguageToggle={true}>
      <div className="min-h-screen bg-brand-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-brand-text mb-4">
              {lang === 'am' ? 'እኛን ያግኙ' : 'Contact Us'}
            </h1>
            <p className="text-xl text-brand-muted">
              {lang === 'am'
                ? 'ለማንኛውም ጥያቄ ወይም አስተያየት እኛን ያግኙ'
                : 'Get in touch with us for any questions or feedback'
              }
            </p>
            {restaurantData?.name && (
              <p className="text-lg text-brand-muted mt-2">
                {lang === 'am' ? `${restaurantData.name} ሬስቶራንት` : restaurantData.name}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-brand-surface rounded-lg shadow-md border border-brand-border p-8">
              <h2 className="text-2xl font-semibold text-brand-text mb-6">
                {t('contactInfo')}
              </h2>

              <div className="space-y-6">
                {restaurantData?.name && (
                  <div>
                    <h3 className="text-lg font-medium text-brand-text mb-2">
                      {t('restaurantName')}
                    </h3>
                    <p className="text-brand-muted">{restaurantData.name}</p>
                  </div>
                )}

                {restaurantData?.address && (
                  <div>
                    <h3 className="text-lg font-medium text-brand-text mb-2">
                      {t('address')}
                    </h3>
                    <p className="text-brand-muted">{restaurantData.address}</p>
                  </div>
                )}

                {restaurantData?.phone && (
                  <div>
                    <h3 className="text-lg font-medium text-brand-text mb-2">
                      {t('phone')}
                    </h3>
                    <p className="text-brand-muted">{restaurantData.phone}</p>
                  </div>
                )}

                {restaurantData?.email && (
                  <div>
                    <h3 className="text-lg font-medium text-brand-text mb-2">
                      {t('email')}
                    </h3>
                    <p className="text-brand-muted">{restaurantData.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-brand-surface rounded-lg shadow-md border border-brand-border p-8">
              <h2 className="text-2xl font-semibold text-brand-text mb-6">
                {t('sendMsgTitle')}
              </h2>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-2">
                    {t('name')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-brand-border rounded-md bg-brand-background text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder={t('yourName')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-text mb-2">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-brand-border rounded-md bg-brand-background text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder={t('yourEmail')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-text mb-2">
                    {t('message')}
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-3 py-2 border border-brand-border rounded-md bg-brand-background text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder={t('yourMessage')}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity"
                >
                  {t('sendMessage')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
