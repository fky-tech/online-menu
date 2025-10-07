import React, { createContext, useContext, useMemo, useState } from "react";

const translations = {
  en: {
    appName: "Online Menu",
    tagline: "Finest dishes, made daily",
    ourMenu: "Our Menu",
    discoverSubtitle: "Discover our delicious offerings crafted with the finest ingredients",
    searchPlaceholder: "Search dishes...",
    selectCategory: "Select a category",
    noItems: "No items available",
    noItemsDesc: "There are no items in this category at the moment.",
    priceSuffix: "BIRR",
    contact: "Contact",
    location: "Location",
    hours: "Hours",
    monFri: "Mon-Fri: 11am - 10pm",
    satSun: "Sat-Sun: 10am - 11pm",
    adminLogin: "Admin Login",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    adminDashboard: "Admin Dashboard",
    logout: "Logout",
    categories: "Categories",
    addCategory: "Add Category",
    editCategory: "Edit Category",
    description: "Description",
    name: "Name",
    addItem: "Add Item",
    editItem: "Edit Item",
    menuItems: "Menu Items",
    category: "Category",
    price: "Price (BIRR)",
    image: "Image",
    url: "URL",
    upload: "Upload",
    cancel: "Cancel",
    update: "Update",
    allItems: "All Items",
    all: "All",
  },
  am: {
    appName: "የመረብ ሜኑ",
    tagline: "ምርጥ ምግቦች በዕለት ይዘጋጃሉ",
    ourMenu: "ሜኑታችን",
    discoverSubtitle: "በምርጥ እቃዎች የተዘጋጀ ጣፋጭ ምርጫችንን አስሱ",
    searchPlaceholder: "ምግቦች ፈልግ...",
    selectCategory: "ምድብ ይምረጡ",
    noItems: "ምንም እቃ የለም",
    noItemsDesc: "በዚህ ምድብ ላይ አሁን ምንም እቃ የለም።",
    priceSuffix: "ብር",
    contact: "መገናኛ",
    location: "አካባቢ",
    hours: "ሰዓታት",
    monFri: "ሰኞ-አርብ: 5:00 - 4:00 (LT)",
    satSun: "ቅዳሜ-እሁድ: 4:00 - 5:00 (LT)",
    adminLogin: "የአድሚን መግቢያ",
    email: "ኢሜል",
    password: "የሚስጥር ቁጥር",
    signIn: "ግባ",
    adminDashboard: "የአድሚን ዳሽቦርድ",
    logout: "ውጣ",
    categories: "ምድቦች",
    addCategory: "ምድብ ጨምር",
    editCategory: "ምድብ አርትዕ",
    description: "ማብራሪያ",
    name: "ስም",
    addItem: "ንጥል ጨምር",
    editItem: "ንጥል አርትዕ",
    menuItems: "የሜኑ ንጥሎች",
    category: "ምድብ",
    price: "ዋጋ (ብር)",
    image: "ምስል",
    url: "ዩአርኤል",
    upload: "መጫን",
    cancel: "ሰርዝ",
    update: "አዘምን",
    allItems: "ሁሉም ንጥሎች",
    all: "ሁሉም",
  },
};

const I18nContext = createContext({ lang: 'en', t: (k) => k, setLang: () => {} });

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const dict = translations[lang] || translations.en;
  const t = useMemo(() => (key) => dict[key] ?? key, [dict]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);


