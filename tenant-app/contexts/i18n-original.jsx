'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import googleTranslationService from '@/utils/googleTranslator';

const translations = {
    en: {
        appName: 'Online Menu',
        tagline: 'Finest dishes, made daily',
        ourMenu: 'Our Menu',
        discoverSubtitle: 'Discover our delicious offerings crafted with the finest ingredients',
        searchPlaceholder: 'Search dishes...',
        selectCategory: 'Select a category',
        noItems: 'No items available',
        noItemsDesc: 'There are no items in this category at the moment.',
        priceSuffix: 'BIRR',
        contact: 'Contact',
        location: 'Location',
        hours: 'Hours',
        monFri: 'Mon-Fri: 11am - 10pm',
        satSun: 'Sat-Sun: 10am - 11pm',
        adminLogin: 'Admin Login',
        email: 'Email',
        password: 'Password',
        signIn: 'Sign In',
        adminDashboard: 'Admin Dashboard',
        logout: 'Logout',
        categories: 'Categories',
        addCategory: 'Add Category',
        editCategory: 'Edit Category',
        description: 'Description',
        name: 'Name',
        addItem: 'Add Item',
        editItem: 'Edit Item',
        menuItems: 'Menu Items',
        category: 'Category',
        price: 'Price (BIRR)',
        image: 'Image',
        url: 'URL',
        upload: 'Upload',
        cancel: 'Cancel',
        update: 'Update',
        allItems: 'All Items',
        all: 'All',
        loading: 'Loading...',
        retry: 'Retry',
        aboutUs: 'About Us',
        restaurantInfo: 'Restaurant Information',
        paymentInfo: 'Payment Information',
        accountNumber: 'Account Number',
        address: 'Address',
        phone: 'Phone',
        mainDishes: 'Main Dishes',
        appetizers: 'Appetizers',
        desserts: 'Desserts',
        beverages: 'Beverages',
        specials: 'Specials',
        popular: 'Popular',
        new: 'New',
        recommended: 'Recommended',
        searchDishes: 'Search dishes...',
        allCategories: 'All',
        ourMenuNav: 'Our Menu',
        aboutUsNav: 'About Us',
        contactNav: 'Contact',
        available: 'Available',
        notAvailable: 'Not available',
    },
    am: {
        appName: 'የመረብ ሜኑ',
        tagline: 'ምርጥ ምግቦች በዕለት ይዘጋጃሉ',
        ourMenu: 'ሜኑዋችን',
        discoverSubtitle: 'በምርጥ እቃዎች የተዘጋጀ ጣፋጭ ምርጫችንን አስሱ',
        searchPlaceholder: 'ምግቦች ፈልግ...',
        selectCategory: 'ምድብ ይምረጡ',
        noItems: 'ምንም እቃ የለም',
        noItemsDesc: 'በዚህ ምድብ ላይ አሁን ምንም እቃ የለም።',
        priceSuffix: 'ብር',
        contact: 'መገናኛ',
        location: 'አካባቢ',
        hours: 'ሰዓታት',
        monFri: 'ሰኞ-አርብ: 5:00 - 4:00 (LT)',
        satSun: 'ቅዳሜ-እሁድ: 4:00 - 5:00 (LT)',
        adminLogin: 'የአድሚን መግቢያ',
        email: 'ኢሜል',
        password: 'የሚስጥር ቁጥር',
        signIn: 'ግባ',
        adminDashboard: 'የአድሚን ዳሽቦርድ',
        logout: 'ውጣ',
        categories: 'ምድቦች',
        addCategory: 'ምድብ ጨምር',
        editCategory: 'ምድብ አርትዕ',
        description: 'ማብራሪያ',
        name: 'ስም',
        addItem: 'ንጥል ጨምር',
        editItem: 'ንጥል አርትዕ',
        menuItems: 'የሜኑ ንጥሎች',
        category: 'ምድብ',
        price: 'ዋጋ (ብር)',
        image: 'ምስል',
        url: 'ዩአርኤል',
        upload: 'መጫን',
        cancel: 'ሰርዝ',
        update: 'አዘምን',
        allItems: 'ሁሉም ንጥሎች',
        all: 'ሁሉም',
        loading: 'በመጫን ላይ...',
        retry: 'እንደገና ሞክር',
        aboutUs: 'ስለ እኛ',
        restaurantInfo: 'የሬስቶራንት መረጃ',
        paymentInfo: 'የክፍያ መረጃ',
        accountNumber: 'የሂሳብ ቁጥር',
        address: 'አድራሻ',
        phone: 'ስልክ',
        mainDishes: 'ዋና ምግቦች',
        appetizers: 'ቅድመ ምግቦች',
        desserts: 'ጣፋጭ ምግቦች',
        beverages: 'መጠጦች',
        specials: 'ልዩ ምግቦች',
        popular: 'ተወዳጅ',
        new: 'አዲስ',
        recommended: 'የሚመከር',
        searchDishes: 'ምግቦች ፈልግ...',
        allCategories: 'ሁሉም',
        ourMenuNav: 'ሜኑታችን',
        aboutUsNav: 'ስለ እኛ',
        contactNav: 'መገናኛ',
        available: 'ይገኛል',
        notAvailable: 'አይገኝም',
    },
};

const I18nContext = createContext({ lang: 'en', t: (k) => k, setLang: () => { } });

export const I18nProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        if (typeof window !== 'undefined') {
            const userPreference = localStorage.getItem('user_language_preference');
            const saved = localStorage.getItem('language');
            return userPreference || saved || 'en';
        }
        return 'en';
    });

    const dict = translations[lang] || translations.en;
    const t = useMemo(() => (key) => dict[key] ?? key, [dict]);

    const translateText = useMemo(() => {
        return async (text) => {
            if (lang === 'en' || !text) return text;
            try {
                return await googleTranslationService.translateText(text, lang);
            } catch (error) {
                console.warn('Translation failed:', error);
                return text;
            }
        };
    }, [lang]);

    const translateTextSync = useMemo(() => (text) => {
        if (lang === 'en' || !text) return text;
        const cacheKey = `${text}_${lang}`;
        if (googleTranslationService.cache.has(cacheKey)) {
            return googleTranslationService.cache.get(cacheKey);
        }
        return text;
    }, [lang]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('language', lang);
            localStorage.setItem('user_language_preference', lang);
        }
    }, [lang]);

    const value = useMemo(() => ({
        lang,
        setLang,
        t,
        translateText,
        translateTextSync
    }), [lang, t, translateText, translateTextSync]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

// Theme Context
const ThemeContext = createContext();

const THEMES = [
    { id: 'default', name: 'Default Orange', font: 'Poppins' },
    { id: 'modern', name: 'Modern Blue', font: 'Inter' },
    { id: 'elegant', name: 'Elegant Purple', font: 'Playfair Display' },
    { id: 'warm', name: 'Warm Red', font: 'Poppins' }
];

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return saved || 'default';
        }
        return 'default';
    });

    const toggleTheme = () => {
        const currentIndex = THEMES.findIndex(t => t.id === theme);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        const newTheme = THEMES[nextIndex].id;
        setTheme(newTheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', newTheme);
        }
    };

    const setThemeById = (themeId) => {
        if (THEMES.find(t => t.id === themeId)) {
            setTheme(themeId);
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', themeId);
            }
        }
    };

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme]);

    const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme: setThemeById,
            toggleTheme,
            themes: THEMES,
            currentTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
