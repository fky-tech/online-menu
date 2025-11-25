'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from '@/lib/react-router-compat';
import Footer from './Footer';
import { useI18n } from '@/contexts/i18n';
import api from '@/lib/api';
import { resolveImageUrl } from '../utils/imageUtils';

const Layout = ({ children, title, searchOpen, setSearchOpen, query, setQuery, searchInputRef, hideLanguageToggle = false }) => {
  const { lang, setLang, t } = useI18n();
  const { slug } = useParams();
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [isLoadingLang, setIsLoadingLang] = useState(false);
  const [restaurantData, setRestaurantData] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Function to load theme settings from database
  const loadThemeSettings = async () => {
    try {
      // Try subdomain-based theme endpoint first, then fallback to slug-based
      let themeRes;
      try {
        themeRes = await api.get('/public/theme');
      } catch (error) {
        if (slug && (error.response?.status === 400 || error.response?.status === 404)) {
          // Fallback to slug-based route
          themeRes = await api.get(`/restaurants/${slug}/public/theme`);
        } else {
          throw error;
        }
      }

      const themeData = themeRes.data?.data;
      console.log('Theme data loaded from database:', themeData);

      if (themeData) {
        // Always use light theme
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme-mode', 'light');

        // Apply custom theme colors and fonts to CSS variables
        const root = document.documentElement;
        if (themeData.primary_color) {
          console.log('Applying primary color:', themeData.primary_color);
          root.style.setProperty('--brand-primary', themeData.primary_color);
          root.style.setProperty('--brand-button-bg', themeData.primary_color);
        }
        if (themeData.text_color) {
          console.log('Applying text color:', themeData.text_color);
          root.style.setProperty('--brand-text', themeData.text_color);
        }
        if (themeData.background_color) {
          console.log('Applying background color:', themeData.background_color);
          root.style.setProperty('--brand-background', themeData.background_color);
        }
        if (themeData.secondary_color) {
          console.log('Applying secondary color:', themeData.secondary_color);
          root.style.setProperty('--brand-muted', themeData.secondary_color);
        }
        if (themeData.font_family) {
          console.log('Applying font family:', themeData.font_family);
          root.style.setProperty('--theme-font-family', `'${themeData.font_family}', sans-serif`);
        }
        return;
      } else {
        console.log('No theme data found in database');
      }
    } catch (error) {
      console.log('Could not load theme from database:', error);
    }

    // Default to light mode
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme-mode', 'light');
  };

  // Function to load restaurant data
  const loadRestaurantData = async () => {
    try {
      // Try subdomain-based restaurant endpoint first, then fallback to slug-based
      let restaurantRes;
      try {
        restaurantRes = await api.get('/restaurant');
      } catch (error) {
        if (slug && (error.response?.status === 400 || error.response?.status === 404)) {
          // Fallback to slug-based route - use the public restaurant endpoint
          restaurantRes = await api.get(`/restaurants/${slug}/public`);
        } else {
          throw error;
        }
      }

      const restaurant = restaurantRes.data?.data;
      if (restaurant) {
        console.log('Restaurant data loaded:', restaurant);
        setRestaurantData(restaurant);
      }
    } catch (error) {
      console.log('Could not load restaurant data:', error);
    }
  };

  // Load theme settings and restaurant data from database
  useEffect(() => {
    loadThemeSettings();
    loadRestaurantData();
  }, [slug]);

  // Listen for theme updates from other components
  useEffect(() => {
    const handleThemeUpdate = () => {
      console.log('Theme update event received, reloading theme...');
      loadThemeSettings();
    };

    window.addEventListener('themeUpdated', handleThemeUpdate);
    return () => window.removeEventListener('themeUpdated', handleThemeUpdate);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageDropdown && !event.target.closest('.language-dropdown')) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageDropdown]);

  // Function to save language to database
  const handleLanguageToggle = async (targetLang) => {
    console.log('🔴 handleLanguageToggle CALLED with targetLang:', targetLang);
    if (isLoadingLang) return;

    setIsLoadingLang(true);
    const newLang = targetLang || (lang === 'en' ? 'am' : 'en');

    try {
      console.log('🌐 Language Toggle:', { from: lang, to: newLang });
      // Update local state first for immediate UI feedback
      setLang(newLang);
      console.log('🌐 setLang called with:', newLang);

      // Save to localStorage for persistence across tabs/sessions
      localStorage.setItem('user_language_preference', newLang);

      // Broadcast language change for incognito mode support
      const channel = new BroadcastChannel('language_channel');
      channel.postMessage({ type: 'language_change', language: newLang });
      channel.close();

      // Try to save to database (this might fail if not authenticated, which is ok for public pages)
      if (slug) {
        try {
          await api.post(`/restaurants/${slug}/public/language`, {
            current_language: newLang
          });
        } catch (err) {
          console.log('Could not save language to database (might be public page):', err);
        }
      }
    } catch (error) {
      console.error('Error toggling language:', error);
      // Revert on error
      setLang(lang);
    } finally {
      setIsLoadingLang(false);
    }
  };

  console.log('🏗️ LAYOUT RENDERING', {
    hasChildren: !!children,
    restaurantName: restaurantData?.name,
    themeLoaded: !!restaurantData
  });

  return (
    <div className="min-h-screen bg-brand-background text-brand-text flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-brand-background/80 backdrop-blur-sm flex items-center px-4 py-3">
        <div className="flex items-center w-full max-w-3xl mx-auto gap-3">
          {/* Logo Icon */}
          <div className="flex-shrink-0">
            {restaurantData?.logo_url ? (
              <img
                src={resolveImageUrl(restaurantData.logo_url)}
                alt="Restaurant Logo"
                className="w-9 h-9 object-contain rounded"
                onError={(e) => {
                  console.error('Failed to load restaurant logo:', restaurantData.logo_url);
                  // Fallback to default SVG on error
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: restaurantData?.logo_url ? 'none' : 'block' }}
            >
              <circle cx="16" cy="16" r="16" fill="#F97316" />
              <text
                x="16"
                y="21"
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="white"
                fontFamily="Montserrat, Arial, sans-serif"
              >
                🍔
              </text>
            </svg>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery && setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full rounded-full border px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Language Dropdown */}
          <div className="relative language-dropdown">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
              title="Select language"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {lang === 'en' ? 'EN' : 'አማ'}
              </span>
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <button
                  onClick={() => {
                    handleLanguageToggle('en');
                    setShowLanguageDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${lang === 'en' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  disabled={isLoadingLang}
                >
                  <span>🇺🇸</span>
                  <span>English</span>
                </button>
                <button
                  onClick={() => {
                    handleLanguageToggle('am');
                    setShowLanguageDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${lang === 'am' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  disabled={isLoadingLang}
                >
                  <span>🇪🇹</span>
                  <span>አማርኛ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>


      {/* Page Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <Footer />

      {/* Dummy elements to prevent extension errors */}
      <div id="translate-page" style={{ display: 'none' }}></div>
      <div id="save-page" style={{ display: 'none' }}></div>
    </div>
  );
};

export default Layout;
