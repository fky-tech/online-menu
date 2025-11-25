'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@/lib/react-router-compat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api, { getAuthToken, clearAuthToken } from "@/lib/api";
import { signOut } from "@/lib/supabase";
import PasswordUpdateModal from '@/components/PasswordUpdateModal';
import SettingsDropdown from '@/components/SettingsDropdown';
import ThemeModal from '@/components/ThemeModal';
import AmharicTranslations from '@/components/AmharicTranslations';
import { useI18n } from '@/contexts/i18n';

const AdminTenant = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const isAuthed = useMemo(() => Boolean(getAuthToken()), []);
  const { lang, setLang } = useI18n();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, comments, theme, translations
  const [adminLanguage, setAdminLanguage] = useState('en'); // Admin interface language
  const [toast, setToast] = useState(""); // Toast notification

  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);

  const [newItem, setNewItem] = useState({ category_id: "", name: "", description: "", price: "", image_url: "", imageFile: null, is_available: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageInputMode, setImageInputMode] = useState("url");

  // Payment info state
  const [paymentForm, setPaymentForm] = useState({ bank_name: "", account_number: "", account_holder: "", logo_url: "", logoFile: null });

  // Password update state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [paymentLogoMode, setPaymentLogoMode] = useState('url');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme state
  const [themeForm, setThemeForm] = useState({
    font_family: "Arial",
    text_color: "#000000",
    background_color: "#ffffff",
    primary_color: "#3b82f6",
    secondary_color: "#6b7280"
  });

  // Restaurant data query
  const { data: restaurantData, isLoading: restaurantLoading, error: restaurantError } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      const restRes = await api.get('/my-restaurant');
      return restRes.data?.data;
    },
    enabled: isAuthed,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Categories query
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories', slug, adminLanguage],
    queryFn: async () => {
      if (adminLanguage === 'am') {
        try {
          const res = await api.get('/my-restaurant/categories-amharic');
          return res.data?.data || [];
        } catch (amharicErr) {
          console.log('No Amharic data found, showing empty lists:', amharicErr);
          return [];
        }
      } else {
        const res = await api.get('/categories');
        return res.data?.data || [];
      }
    },
    enabled: isAuthed,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Menu items query
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['menu-items', slug, adminLanguage],
    queryFn: async () => {
      if (adminLanguage === 'am') {
        try {
          const res = await api.get('/my-restaurant/menu-items-amharic');
          return res.data?.data || [];
        } catch (amharicErr) {
          console.log('No Amharic data found, showing empty lists:', amharicErr);
          return [];
        }
      } else {
        const res = await api.get('/menu-items');
        return res.data?.data || [];
      }
    },
    enabled: isAuthed,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Payment info query
  const { data: paymentData, isLoading: paymentLoading, error: paymentError } = useQuery({
    queryKey: ['payment-info', slug],
    queryFn: async () => {
      try {
        const res = await api.get('/my-restaurant/payment-info');
        return res.data?.data;
      } catch (err) {
        console.log('No payment info found:', err);
        return null;
      }
    },
    enabled: isAuthed,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Theme info query
  const { data: themeData, isLoading: themeLoading, error: themeError } = useQuery({
    queryKey: ['theme', slug],
    queryFn: async () => {
      try {
        const res = await api.get('/my-restaurant/theme');
        return res.data?.data;
      } catch (err) {
        console.log('No theme found:', err);
        return null;
      }
    },
    enabled: isAuthed,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Comments query
  const { data: commentsData, isLoading: commentsLoading, error: commentsError } = useQuery({
    queryKey: ['comments', slug],
    queryFn: async () => {
      try {
        const res = await api.get('/comments');
        return res.data?.data || [];
      } catch (err) {
        console.log('No comments found:', err);
        return [];
      }
    },
    enabled: isAuthed,
    staleTime: 1 * 60 * 1000, // 1 minute - comments change more frequently
  });

  // Combined loading and error states
  const isLoading = restaurantLoading || categoriesLoading || itemsLoading || paymentLoading || themeLoading || commentsLoading;
  const hasError = restaurantError || categoriesError || itemsError || paymentError || themeError || commentsError;

  // Set data from queries
  const restaurant = restaurantData;
  const categories = categoriesData || [];
  const items = itemsData || [];
  const paymentInfo = paymentData;
  const themeInfo = themeData;
  const comments = commentsData || [];

  // Update forms when data loads
  useEffect(() => {
    if (paymentInfo) {
      setPaymentForm({
        account_details: paymentInfo.account_details || "",
        logo_url: paymentInfo.logo_url || "",
        logoFile: null
      });
    }
  }, [paymentInfo]);

  useEffect(() => {
    if (themeInfo) {
      setThemeForm({
        font_family: themeInfo.font_family || "Arial",
        text_color: themeInfo.text_color || "#000000",
        background_color: themeInfo.background_color || "#ffffff",
        primary_color: themeInfo.primary_color || "#3b82f6",
        secondary_color: themeInfo.secondary_color || "#6b7280"
      });
    }
  }, [themeInfo]);

  // Auth check
  useEffect(() => {
    if (!isAuthed) {
      navigate(`/admin/restaurant/${slug}/login`, { replace: true });
    }
  }, [isAuthed, navigate, slug]);

  const logout = async () => {
    try {
      await signOut();
      clearAuthToken();
      navigate(`/admin/restaurant/${slug}/login`, { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
      clearAuthToken();
      navigate(`/admin/restaurant/${slug}/login`, { replace: true });
    }
  };

  // Translation labels based on admin language
  const labels = {
    en: {
      dashboard: 'Dashboard',
      comments: 'Comments',
      theme: 'Theme',
      translations: 'Amharic Translations',
      categories: 'Categories',
      menuItems: 'Menu Items',
      paymentInfo: 'Payment Info',
      name: 'Name',
      description: 'Description',
      price: 'Price',
      addCategory: 'Add Category',
      addMenuItem: 'Add Menu Item',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      update: 'Update',
      create: 'Create',
      adminLanguage: 'Admin Language',
      accountNumber: 'Account Number',
      logo: 'Logo',
      available: 'Available',
      unavailable: 'Unavailable',
      tenantAdmin: 'Tenant Admin',
      settings: 'Settings',
      language: 'Language',
      changeTheme: 'Change Theme',
      updatePassword: 'Update Password',
      logout: 'Logout'
    },
    am: {
      dashboard: 'ዳሽቦርድ',
      comments: 'አስተያየቶች',
      theme: 'ገጽታ',
      translations: 'የአማርኛ ትርጉሞች',
      categories: 'የምድቦች ማስገቢያ',
      menuItems: 'የሜኑ ማስገቢያ',
      paymentInfo: 'የክፍያ መረጃ',
      name: 'ስም',
      description: 'ማብራሪያ',
      price: 'ዋጋ',
      addCategory: 'ምድብ ጨምር',
      addMenuItem: 'ምግብ ጨምር',
      save: 'አስቀምጥ',
      cancel: 'ሰርዝ',
      edit: 'አርም',
      delete: 'ሰርዝ',
      update: 'አርም',
      create: 'ፍጠር',
      adminLanguage: 'የአስተዳዳሪ ቋንቋ',
      accountNumber: 'የሂሳብ ቁጥር',
      logo: 'አርማ',
      available: 'ይገኛል',
      unavailable: 'አይገኝም',
      tenantAdmin: 'አስተዳዳሪ',
      settings: 'ቅንብሮች',
      language: 'ቋንቋ',
      changeTheme: 'ገጽታ ለውጥ',
      updatePassword: 'የይለፍ ቃል ለውጥ',
      logout: 'ውጣ'
    }
  };

  const t = labels[adminLanguage];

  // Admin writes with restaurant_id require restaurant id; get from restaurant
  const restaurantId = restaurant?.id;

  // For tenant admin routes, we need to set the restaurant context
  // The middleware will use the user's restaurant_id from the token

  // Category ops
  const createCategory = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newCategory,
        adminLanguage: adminLanguage // Pass admin language to determine which table to save to
      };

      // Use different endpoints based on admin language
      const endpoint = adminLanguage === 'am' ? '/my-restaurant/categories-amharic' : '/categories';
      const response = await api.post(endpoint, payload);

      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['categories', slug, adminLanguage] });
      queryClient.invalidateQueries({ queryKey: ['menu-items', slug, adminLanguage] }); // Also invalidate items since category might affect them

      setToast("Category created successfully");
      setTimeout(() => setToast(""), 3000);
      setNewCategory({ name: "", description: "" });
    } catch (error) {
      console.error('Create category error:', error);
      // Since operations work despite errors, only show alert for critical failures
      if (error.response?.status >= 500) {
        alert('Server error occurred, but category may have been created');
      }
      // Don't show alerts for 4xx errors or network issues since operations seem to work
    }
  };
  const startEditCategory = (cat) => setEditingCategory({ ...cat });
  const cancelEditCategory = () => setEditingCategory(null);
  const updateCategory = async (e) => {
    e.preventDefault();
    try {
      const { id, name, description } = editingCategory;

      // Use different endpoints based on admin language
      if (adminLanguage === 'am') {
        const endpoint = `/my-restaurant/categories-amharic`;
        await api.post(endpoint, { id, name, description });
      } else {
        const endpoint = `/categories/${id}`;
        await api.put(endpoint, { name, description });
      }

      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['categories', slug, adminLanguage] });

      setToast("Category updated successfully");
      setTimeout(() => setToast(""), 3000);
      setEditingCategory(null);
    } catch (error) {
      console.error('Update category error:', error);
      if (error.response?.status >= 500) {
        alert('Server error occurred, but category may have been updated');
      }
    }
  };
  const deleteCategory = async (id) => {
    try {
      // Use different endpoints based on admin language
      const endpoint = adminLanguage === 'am' ? `/my-restaurant/categories-amharic/${id}` : `/categories/${id}`;
      await api.delete(endpoint);

      // Invalidate and refetch both categories and items
      queryClient.invalidateQueries({ queryKey: ['categories', slug, adminLanguage] });
      queryClient.invalidateQueries({ queryKey: ['menu-items', slug, adminLanguage] });

      setToast("Category deleted successfully");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error('Delete category error:', error);
      if (error.response?.status >= 500) {
        alert('Server error occurred, but category may have been deleted');
      }
    }
  };

  // Items ops
  const createItem = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('category_id', newItem.category_id);
      formData.append('name', newItem.name);
      formData.append('description', newItem.description || '');
      formData.append('price', Number(newItem.price));
      formData.append('is_available', newItem.is_available ?? 1);

      // Handle image upload
      if (imageInputMode === 'upload' && newItem.imageFile) {
        formData.append('image', newItem.imageFile);
      } else if (imageInputMode === 'url' && newItem.image_url) {
        formData.append('image_url', newItem.image_url);
      }

      // Use different endpoints based on admin language
      const endpoint = adminLanguage === 'am' ? '/my-restaurant/menu-items-amharic' : '/menu-items';
      await api.post(endpoint, formData);

      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ['menu-items', slug, adminLanguage] });

      setToast("Menu item created successfully");
      setTimeout(() => setToast(""), 3000);
      setNewItem({ category_id: "", name: "", description: "", price: "", image_url: "", imageFile: null, is_available: 1 });
    } catch (error) {
      console.error('Create item error:', error);
      if (error.response?.status >= 500) {
        alert('Server error occurred, but item may have been created');
      }
    }
  };
  const startEditItem = (it) => { setEditingItem({ ...it, price: String(it.price) }); setImageInputMode('url'); };
  const cancelEditItem = () => setEditingItem(null);
  const updateItem = async (e) => {
    e.preventDefault();
    try {
      const { id, category_id, name, description, price, image_url, imageFile, is_available } = editingItem;
      let finalImageUrl = image_url;

      // Handle image upload to Supabase Storage
      if (imageInputMode === 'upload' && imageFile) {
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${imageFile.name}`;
        const filePath = `menu-images/${fileName}`;

        await uploadFile('menu-images', filePath, imageFile);
        finalImageUrl = getPublicUrl('menu-images', filePath);
      }

      const payload = {
        category_id,
        name,
        description,
        price: Number(price),
        image_url: finalImageUrl,
        is_available
      };

      // Use different endpoints based on admin language
      if (adminLanguage === 'am') {
        const endpoint = `/my-restaurant/menu-items-amharic`;
        const amharicPayload = {
          id,
          category_id: payload.category_id,
          name: payload.name,
          description: payload.description,
          price: payload.price,
          image_url: payload.image_url,
          is_available: payload.is_available
        };
        await api.post(endpoint, amharicPayload);
      } else {
        const endpoint = `/menu-items/${id}`;
        await api.put(endpoint, payload);
      }

      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ['menu-items', slug, adminLanguage] });

      setToast("Menu item updated successfully");
      setTimeout(() => setToast(""), 3000);
      setEditingItem(null);
    } catch (error) {
      console.error('Update item error:', error);
      if (error.response?.status >= 500) {
        alert('Server error occurred, but item may have been updated');
      }
    }
  };
  const deleteItem = async (id) => {
    try {
      // Use different endpoints based on admin language
      const endpoint = adminLanguage === 'am' ? `/my-restaurant/menu-items-amharic/${id}` : `/menu-items/${id}`;
      await api.delete(endpoint);

      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ['menu-items', slug, adminLanguage] });

      setToast("Menu item deleted successfully");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error('Delete item error:', error);
      if (error.response?.status >= 500) {
        alert('Server error occurred, but item may have been deleted');
      }
    }
  };

  // Payment info functions
  const savePaymentInfo = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('bank_name', paymentForm.bank_name || '');
      formData.append('account_number', paymentForm.account_number || '');
      formData.append('account_holder', paymentForm.account_holder || '');

      // Handle logo upload
      if (paymentLogoMode === 'upload' && paymentForm.logoFile) {
        formData.append('logo', paymentForm.logoFile);
      } else if (paymentLogoMode === 'url' && paymentForm.logo_url) {
        formData.append('logo_url', paymentForm.logo_url);
      }

      await api.post('/my-restaurant/payment-info', formData);

      // Invalidate and refetch payment info
      queryClient.invalidateQueries({ queryKey: ['payment-info', slug] });

      setToast("Payment information saved successfully");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error('Save payment error:', error);
      if (error.response?.status >= 500) {
        alert('Server error occurred, but payment info may have been saved');
      }
    }
  };

  // Theme functions
  const saveTheme = async (e) => {
    e.preventDefault();
    try {
      await api.post('/my-restaurant/theme', themeForm);

      // Invalidate and refetch theme info
      queryClient.invalidateQueries({ queryKey: ['theme', slug] });

      setToast("Theme saved successfully");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error('Save theme error:', error);
      if (error.response?.status >= 500) {
        alert('Server error occurred, but theme may have been saved');
      }
    }
  };

  if (!isAuthed) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.tenantAdmin} - {restaurant?.name || slug}</h1>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {/* Admin Language Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{t.adminLanguage}:</span>
                <button
                  onClick={() => setAdminLanguage(adminLanguage === 'en' ? 'am' : 'en')}
                  className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
                >
                  <span>{adminLanguage === 'en' ? 'አማ' : 'EN'}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </button>
              </div>
              <SettingsDropdown
                adminLanguage={adminLanguage}
                onLanguageToggle={async () => {
                  console.log('Language toggle clicked, current lang:', lang);
                  const newLang = lang === 'en' ? 'am' : 'en';
                  console.log('Setting new lang:', newLang);

                  try {
                    // Save language setting to database for the restaurant
                    await api.post('/my-restaurant/language', {
                      primary_language: newLang,
                      supported_languages: ['en', 'am']
                    });

                    // Update local state
                    setLang(newLang);

                    // Dispatch event to notify main menu to refresh
                    window.dispatchEvent(new CustomEvent('languageUpdated', {
                      detail: { language: newLang }
                    }));

                    console.log('Language saved to database:', newLang);
                  } catch (error) {
                    console.error('Failed to save language setting:', error);
                    alert('Failed to save language setting: ' + (error.response?.data?.message || error.message));
                  }
                }}
                onThemeChange={() => setShowThemeModal(true)}
                onPasswordUpdate={() => setShowPasswordModal(true)}
              />
              <button onClick={logout} className="px-3 py-2 text-xs md:text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t.logout}</button>
            </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">{t.adminLanguage}:</span>
                  <button
                    onClick={() => setAdminLanguage(adminLanguage === 'en' ? 'am' : 'en')}
                    className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
                  >
                    <span>{adminLanguage === 'en' ? 'አማ' : 'EN'}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </button>
                </div>
                <div className="px-3 py-2">
                  <SettingsDropdown
                    adminLanguage={adminLanguage}
                    onLanguageToggle={async () => {
                      console.log('Language toggle clicked, current lang:', lang);
                      const newLang = lang === 'en' ? 'am' : 'en';
                      console.log('Setting new lang:', newLang);

                      try {
                        // Save language setting to database for the restaurant
                        await api.post('/my-restaurant/language', {
                          primary_language: newLang,
                          supported_languages: ['en', 'am']
                        });

                        // Update local state
                        setLang(newLang);

                        // Dispatch event to notify main menu to refresh
                        window.dispatchEvent(new CustomEvent('languageUpdated', {
                          detail: { language: newLang }
                        }));

                        console.log('Language saved to database:', newLang);
                      } catch (error) {
                        console.error('Failed to save language setting:', error);
                        alert('Failed to save language setting: ' + (error.response?.data?.message || error.message));
                      }
                    }}
                    onThemeChange={() => setShowThemeModal(true)}
                    onPasswordUpdate={() => setShowPasswordModal(true)}
                  />
                </div>
                <div className="px-3 py-2">
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">{t.logout}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : hasError ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">Failed to load restaurant data</div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {t.dashboard}
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'comments'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {t.comments}
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'comments' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg md:text-xl font-medium text-gray-900">{t.comments}</h2>
                </div>
                <div className="p-4 sm:p-6">
                  {comments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">💬</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {adminLanguage === 'am' ? 'አስተያየቶች ገና አልተለቁም' : 'No Comments Yet'}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {adminLanguage === 'am'
                          ? 'የሬስቶራንት ተጠቃሚዎች ብሎን ለማለስ እና አስተያየት ለመስጠት ይጠብቁ።'
                          : 'Customer comments will appear here once they scan QR codes and leave feedback.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          {comment.menu_item_name && (
                            <div className="text-lg font-semibold text-gray-900 mb-2">
                              {comment.menu_item_name}
                            </div>
                          )}
                          <div className="text-sm text-gray-600 mb-2">
                            {new Date(comment.created_at).toLocaleDateString(
                              adminLanguage === 'am' ? 'am-ET' : 'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )}
                          </div>
                          <p className="text-gray-900">{comment.comment_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 md:grid-cols-2">
                {/* Categories */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg md:text-xl font-medium text-gray-900">{t.categories}</h2>
                  </div>
                  <div className="p-4 sm:p-6">
                    <form onSubmit={createCategory} className="bg-gray-50 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 space-y-3">
                      <h3 className="font-medium">{t.addCategory}</h3>
                      <input className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder={t.name} value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
                      <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder={t.description} value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} rows="3" />
                      <div className="flex justify-end">
                        <button type="submit" className="px-3 py-2 bg-amber-600 text-white rounded-md">{t.create}</button>
                      </div>
                    </form>
                    {editingCategory && (
                      <form onSubmit={updateCategory} className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5 mb-4 space-y-3">
                        <h3 className="font-medium">{t.edit} {t.categories}</h3>
                        <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} required />
                        <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" value={editingCategory.description || ''} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} rows="3" />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={cancelEditCategory} className="px-3 py-2 border rounded-md">{t.cancel}</button>
                          <button type="submit" className="px-3 py-2 bg-amber-600 text-white rounded-md">{t.update}</button>
                        </div>
                      </form>
                    )}
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {categories.map(c => (
                        <div key={c.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                          <div>
                            <div className="font-medium text-gray-900">{c.name}</div>
                            {c.description && <div className="text-sm text-gray-600">{c.description}</div>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingCategory(c)} className="px-2 py-1.5 border rounded-md text-xs">{t.edit}</button>
                            <button onClick={() => deleteCategory(c.id)} className="px-2 py-1.5 border rounded-md text-xs text-red-700">{t.delete}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg md:text-xl font-medium text-gray-900">{t.menuItems}</h2>
                  </div>
                  <div className="p-4 sm:p-6">
                    <form onSubmit={createItem} className="bg-gray-50 rounded-lg p-4 sm:p-5 mb-4 space-y-3">
                      <h3 className="font-medium">{t.addMenuItem}</h3>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2" value={newItem.category_id} onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })} required>
                        <option value="" disabled>Select category</option>
                        {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input className="border border-gray-300 rounded-md px-3 py-2" placeholder={t.name} value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} required />
                        <input type="number" min="0" step="0.01" className="border border-gray-300 rounded-md px-3 py-2" placeholder={t.price} value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} required />
                      </div>
                      <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder={t.description} rows="3" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                      <div className="flex items-center gap-2">
                        <button type="button" className={`px-2 py-1.5 rounded-md text-xs ${imageInputMode === 'url' ? 'bg-amber-100 border border-amber-300' : 'border border-gray-300'}`} onClick={() => setImageInputMode('url')}>{adminLanguage === 'am' ? 'ዩአርኤል' : 'URL'}</button>
                        <button type="button" className={`px-2 py-1.5 rounded-md text-xs ${imageInputMode === 'upload' ? 'bg-amber-100 border border-amber-300' : 'border border-gray-300'}`} onClick={() => setImageInputMode('upload')}>{adminLanguage === 'am' ? 'አስገባ' : 'Upload'}</button>
                      </div>
                      {imageInputMode === 'url' ? (
                        <input className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="https://..." value={newItem.image_url || ''} onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value, imageFile: null })} />
                      ) : (
                        <input type="file" accept="image/*" className="w-full border border-gray-300 rounded-md px-3 py-2" onChange={(e) => setNewItem({ ...newItem, imageFile: e.target.files?.[0] || null, image_url: '' })} />
                      )}
                      <div>
                        <label htmlFor="itemAvailability" className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                        <select
                          id="itemAvailability"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          value={newItem.is_available}
                          onChange={(e) => setNewItem({ ...newItem, is_available: Number(e.target.value) })}
                        >
                          <option value={1}>{t.available}</option>
                          <option value={0}>{t.unavailable}</option>
                        </select>
                      </div>

                      <div className="flex justify-end">
                        <button type="submit" className="px-3 py-2 bg-amber-600 text-white rounded-md">{t.create}</button>
                      </div>
                    </form>

                    {editingItem && (
                      <form onSubmit={updateItem} className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5 mb-4 space-y-3">
                        <h3 className="font-medium">{t.edit} {t.menuItems}</h3>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2" value={editingItem.category_id} onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })} required>
                          {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                        </select>

                        <div>
                          <label htmlFor="editItemAvailability" className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                          <select
                            id="editItemAvailability"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            value={editingItem.is_available}
                            onChange={(e) => setEditingItem({ ...editingItem, is_available: Number(e.target.value) })}
                          >
                            <option value={1}>{t.available}</option>
                            <option value={0}>{t.unavailable}</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input className="border border-gray-300 rounded-md px-3 py-2" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} required />
                          <input type="number" min="0" step="0.01" className="border border-gray-300 rounded-md px-3 py-2" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })} required />
                        </div>
                        <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" rows="3" value={editingItem.description || ''} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} />
                        <div className="flex items-center gap-2">
                          <button type="button" className={`px-2 py-1.5 rounded-md text-xs ${imageInputMode === 'url' ? 'bg-amber-100 border border-amber-300' : 'border border-gray-300'}`} onClick={() => setImageInputMode('url')}>{adminLanguage === 'am' ? 'ዩአርኤል' : 'URL'}</button>
                          <button type="button" className={`px-2 py-1.5 rounded-md text-xs ${imageInputMode === 'upload' ? 'bg-amber-100 border border-amber-300' : 'border border-gray-300'}`} onClick={() => setImageInputMode('upload')}>{adminLanguage === 'am' ? 'አስገባ' : 'Upload'}</button>
                        </div>
                        {imageInputMode === 'url' ? (
                          <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={editingItem.image_url || ''} onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value, imageFile: null })} placeholder="https://..." />
                        ) : (
                          <input type="file" accept="image/*" className="w-full border border-gray-300 rounded-md px-3 py-2" onChange={(e) => setEditingItem({ ...editingItem, imageFile: e.target.files?.[0] || null, image_url: '' })} />
                        )}
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={cancelEditItem} className="px-3 py-2 border rounded-md">{t.cancel}</button>
                          <button type="submit" className="px-3 py-2 bg-amber-600 text-white rounded-md">{t.update}</button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {items.map(it => (
                        <div key={it.id} className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900">{it.name} <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{it.price} BIRR</span></div>
                            {it.description && <div className="text-sm text-gray-600">{it.description}</div>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingItem({ ...it, price: String(it.price) })} className="px-2 py-1.5 border rounded-md text-xs">{t.edit}</button>
                            <button onClick={() => deleteItem(it.id)} className="px-2 py-1.5 border rounded-md text-xs text-red-700">{t.delete}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-1 md:col-span-2">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg md:text-xl font-medium text-gray-900">{t.paymentInfo}</h2>
                  </div>
                  <div className="p-4 sm:p-6">
                    <form onSubmit={savePaymentInfo} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.accountNumber}</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                          placeholder={adminLanguage === 'am' ? 'የሂሳብ ቁጥር አስገባ' : 'Enter account number'}
                          value={paymentForm.account_number || ""}
                          onChange={(e) => setPaymentForm({ ...paymentForm, account_number: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.logo}</label>
                        <div className="flex items-center gap-2 mb-3">
                          <button
                            type="button"
                            className={`px-3 py-1.5 rounded-md text-sm ${paymentLogoMode === 'url' ? 'bg-amber-100 border border-amber-300' : 'border border-gray-300'}`}
                            onClick={() => setPaymentLogoMode('url')}
                          >
                            {adminLanguage === 'am' ? 'ዩአርኤል' : 'URL'}
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-1.5 rounded-md text-sm ${paymentLogoMode === 'upload' ? 'bg-amber-100 border border-amber-300' : 'border border-gray-300'}`}
                            onClick={() => setPaymentLogoMode('upload')}
                          >
                            {adminLanguage === 'am' ? 'አስገባ' : 'Upload'}
                          </button>
                        </div>

                        {paymentLogoMode === 'url' ? (
                          <input
                            type="url"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                            placeholder={adminLanguage === 'am' ? 'https://example.com/logo.png' : 'https://example.com/logo.png'}
                            value={paymentForm.logo_url || ""}
                            onChange={(e) => setPaymentForm({ ...paymentForm, logo_url: e.target.value, logoFile: null })}
                          />
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                            onChange={(e) => setPaymentForm({ ...paymentForm, logoFile: e.target.files?.[0] || null, logo_url: '' })}
                          />
                        )}
                      </div>

                      {/* Current logo preview */}
                      {(paymentInfo?.logo_url || paymentForm.logo_url) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Logo</label>
                          <img
                            src={paymentInfo?.logo_url?.startsWith('/uploads/')
                              ? `http://localhost:5000${paymentInfo.logo_url}`
                              : paymentInfo?.logo_url || paymentForm.logo_url
                            }
                            alt="Payment logo"
                            className="w-20 h-20 object-contain border border-gray-200 rounded-md"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 btn-brand rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{ focusRingColor: 'var(--brand-primary)' }}
                        >
                          {adminLanguage === 'am' ? 'የክፍያ መረጃ ጨምር' : 'Add Payment Info'}
                        </button>
                      </div>
                    </form>

                    {paymentInfo && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">{adminLanguage === 'am' ? 'የክፍያ መረጃ አሁን ካለ' : 'Current Payment Information'}</h3>
                        <div className="text-sm text-gray-600">
                          <p><strong>{adminLanguage === 'am' ? 'የሂሳብ ቁጥር:' : 'Account Number:'}</strong> {paymentInfo.account_details}</p>
                          <p><strong>{adminLanguage === 'am' ? 'መጨረሻ የተሻሻለበት:' : 'Last Updated:'}</strong> {new Date(paymentInfo.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>



              </div>
            )}

          </>
        )}
      </main>

      {/* Password Update Modal */}
      <PasswordUpdateModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        requiresPasswordUpdate={false}
      />

      {/* Theme Modal */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        restaurant={restaurant}
        themeInfo={themeInfo}
        onThemeUpdate={(updatedTheme) => {
          // Invalidate theme query to refetch
          queryClient.invalidateQueries({ queryKey: ['theme', slug] });
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-md z-50">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminTenant;


