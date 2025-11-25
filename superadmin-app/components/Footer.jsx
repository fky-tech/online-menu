'use client';

import React, { useState, useEffect } from 'react';
import { NavLink } from '@/lib/react-router-compat';
import { useI18n } from '@/contexts/i18n';
import api from '@/lib/api';

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-brand-primary' : 'text-brand-muted'}`
    }
  >
    {icon}
    <span className="text-xs font-semibold">{label}</span>
  </NavLink>
);

const Footer = () => {
  const { t, lang } = useI18n();
  const [restaurantLanguage, setRestaurantLanguage] = useState('en');
  const iconClass = "w-6 h-6";

  // Get restaurant's admin language setting
  useEffect(() => {
    const loadRestaurantLanguage = async () => {
      try {
        // Try subdomain-based language endpoint first, then fallback to slug-based
        let langRes;
        try {
          langRes = await api.get('/public/language');
        } catch (error) {
          const slug = window.location.hostname.toLowerCase().split('.')[0];
          if (slug && (error.response?.status === 400 || error.response?.status === 404)) {
            // Fallback to slug-based route
            langRes = await api.get(`/restaurants/${slug}/public/language`);
          } else {
            throw error;
          }
        }

        const restaurantLang = langRes.data?.data?.primary_language || 'en';
        setRestaurantLanguage(restaurantLang);
      } catch (error) {
        console.log('Could not load restaurant language for footer:', error);
        setRestaurantLanguage('en');
      }
    };

    loadRestaurantLanguage();
  }, []);

  // Listen for language updates from admin panel
  useEffect(() => {
    const handleLanguageUpdate = (event) => {
      console.log('Footer: Language update event received:', event.detail);
      const newLanguage = event.detail.language;
      setRestaurantLanguage(newLanguage);
    };

    window.addEventListener('languageUpdated', handleLanguageUpdate);
    return () => window.removeEventListener('languageUpdated', handleLanguageUpdate);
  }, []);

  return (
    <footer className="sticky bottom-0 z-50 bg-brand-surface/80 backdrop-blur-sm border-t border-brand-border/80 flex justify-around items-center h-16">
      <NavItem
        to="/"
        label={lang === 'am' ? 'ሜኑችን' : 'Our Menu'}
        icon={
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        }
      />
      <NavItem
        to="/about"
        label={lang === 'am' ? 'ስለ እኛ' : 'About Us'}
        icon={
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        }
      />
      <NavItem
        to="/contact"
        label={lang === 'am' ? 'መገናኛ' : 'Contact'}
        icon={
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
        }
      />
    </footer>
  );
};

export default Footer;