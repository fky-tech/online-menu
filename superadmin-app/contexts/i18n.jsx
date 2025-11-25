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
        appName: '\u12e8\u1218\u1228\u1265 \u121c\u1291',
        tagline: '\u121d\u122d\u1325 \u121d\u130d\u1266\u127d \u1260\u12d5\u1208\u1275 \u12ed\u12d8\u130b\u1303\u1209',
        ourMenu: '\u121c\u1291\u12cb\u127d\u1295',
        discoverSubtitle: '\u1260\u121d\u122d\u1325 \u12a5\u1243\u12ce\u127d \u12e8\u1270\u12d8\u130b\u1300 \u1323\u134b\u132d \u121d\u122d\u132b\u127d\u1295\u1295 \u12a0\u1235\u1231',
        searchPlaceholder: '\u121d\u130d\u1266\u127d \u1348\u120d\u130d...',
        selectCategory: '\u121d\u12f5\u1265 \u12ed\u121d\u1228\u1321',
        noItems: '\u121d\u1295\u121d \u12a5\u1243 \u12e8\u1208\u121d',
        noItemsDesc: '\u1260\u12da\u1205 \u121d\u12f5\u1265 \u120b\u12ed \u12a0\u1201\u1295 \u121d\u1295\u121d \u12a5\u1243 \u12e8\u1208\u121d\u1362',
        priceSuffix: '\u1265\u122d',
        contact: '\u1218\u1308\u1293\u129b',
        location: '\u12a0\u12ab\u1263\u1262',
        hours: '\u1230\u12d3\u1273\u1275',
        monFri: '\u1230\u129e-\u12a0\u122d\u1265: 5:00 - 4:00 (LT)',
        satSun: '\u1245\u12f3\u121c-\u12a5\u1201\u12f5: 4:00 - 5:00 (LT)',
        adminLogin: '\u12e8\u12a0\u12f5\u121a\u1295 \u1218\u130d\u1262\u12eb',
        email: '\u12a2\u121c\u120d',
        password: '\u12e8\u121a\u1235\u1325\u122d \u1241\u1325\u122d',
        signIn: '\u130d\u1263',
        adminDashboard: '\u12e8\u12a0\u12f5\u121a\u1295 \u12f3\u123d\u1266\u122d\u12f5',
        logout: '\u12cd\u1323',
        categories: '\u121d\u12f5\u1266\u127d',
        addCategory: '\u121d\u12f5\u1265 \u1328\u121d\u122d',
        editCategory: '\u121d\u12f5\u1265 \u12a0\u122d\u1275\u12d5',
        description: '\u121b\u1265\u122b\u122a\u12eb',
        name: '\u1235\u121d',
        addItem: '\u1295\u1325\u120d \u1328\u121d\u122d',
        editItem: '\u1295\u1325\u120d \u12a0\u122d\u1275\u12d5',
        menuItems: '\u12e8\u121c\u1291 \u1295\u1325\u120e\u127d',
        category: '\u121d\u12f5\u1265',
        price: '\u12cb\u130b (\u1265\u122d)',
        image: '\u121d\u1235\u120d',
        url: '\u12e9\u12a0\u122d\u12a4\u120d',
        upload: '\u1218\u132b\u1295',
        cancel: '\u1230\u122d\u12dd',
        update: '\u12a0\u12d8\u121d\u1295',
        allItems: '\u1201\u1209\u121d \u1295\u1325\u120e\u127d',
        all: '\u1201\u1209\u121d',
        loading: '\u1260\u1218\u132b\u1295 \u120b\u12ed...',
        retry: '\u12a5\u1295\u12f0\u1308\u1293 \u121e\u12ad\u122d',
        aboutUs: '\u1235\u1208 \u12a5\u129b',
        restaurantInfo: '\u12e8\u122c\u1235\u1276\u122b\u1295\u1275 \u1218\u1228\u1303',
        paymentInfo: '\u12e8\u12ad\u134d\u12eb \u1218\u1228\u1303',
        accountNumber: '\u12e8\u1202\u1233\u1265 \u1241\u1325\u122d',
        address: '\u12a0\u12f5\u122b\u123b',
        phone: '\u1235\u120d\u12ad',
        mainDishes: '\u12cb\u1293 \u121d\u130d\u1266\u127d',
        appetizers: '\u1245\u12f5\u1218 \u121d\u130d\u1266\u127d',
        desserts: '\u1323\u134b\u132d \u121d\u130d\u1266\u127d',
        beverages: '\u1218\u1320\u1326\u127d',
        specials: '\u120d\u12e9 \u121d\u130d\u1266\u127d',
        popular: '\u1270\u12c8\u12f3\u1305',
        new: '\u12a0\u12f2\u1235',
        recommended: '\u12e8\u121a\u1218\u12a8\u122d',
        searchDishes: '\u121d\u130d\u1266\u127d \u1348\u120d\u130d...',
    },
};

export const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
    const [lang, setLang] = useState('en');

    // Load language from localStorage on client-side mount (after SSR hydration)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userPreference = localStorage.getItem('user_language_preference');
            const saved = localStorage.getItem('language');
            const initialLang = userPreference || saved || 'en';
            console.log('\ud83d\udd35 I18nProvider mounting - loading lang from localStorage:', initialLang);
            if (initialLang !== 'en') {
                setLang(initialLang);
            }
        }
    }, []);

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
