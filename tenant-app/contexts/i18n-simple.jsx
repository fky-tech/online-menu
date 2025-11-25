'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';

const I18nContext = createContext();

const translations = {
    en: {
        appName: 'Online Menu',
        searchPlaceholder: 'Search dishes...',
        allCategories: 'All Categories',
        noItems: 'No items available',
    },
    am: {
        appName: 'Online Menu',
        searchPlaceholder: 'ምግቦችን ይፈልጉ...',
        allCategories: 'ሁሉም ምድቦች',
        noItems: 'ምንም ንጥሎች የሉም',
    }
};

export const I18nProvider = ({ children }) => {
    const [lang, setLang] = useState('en');

    const t = (key) => {
        return translations[lang]?.[key] || key;
    };

    const value = {
        lang,
        setLang,
        t,
        dir: 'ltr'
    };

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};
