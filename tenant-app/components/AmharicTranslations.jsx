'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

const AmharicTranslations = ({ adminLanguage: propAdminLanguage, setAdminLanguage: propSetAdminLanguage }) => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [translations, setTranslations] = useState({});
  const [categoryTranslations, setCategoryTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');
  // Use props if provided, otherwise use local state
  const [localAdminLanguage, setLocalAdminLanguage] = useState('en');
  const adminLanguage = propAdminLanguage || localAdminLanguage;
  const setAdminLanguage = propSetAdminLanguage || setLocalAdminLanguage;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories and menu items
      const [categoriesRes, menuItemsRes] = await Promise.all([
        api.get('/my-restaurant/categories'),
        api.get('/my-restaurant/menu-items')
      ]);

      setCategories(categoriesRes.data?.data || []);
      setMenuItems(menuItemsRes.data?.data || []);

      // Fetch existing Amharic translations from new tables
      try {
        const [translationsRes, categoryTranslationsRes] = await Promise.all([
          api.get('/my-restaurant/menu-items-amharic'),
          api.get('/my-restaurant/categories-amharic')
        ]);

        // Convert translations to lookup objects
        const translationLookup = {};
        (translationsRes.data?.data || []).forEach(t => {
          translationLookup[t.menu_item_id] = {
            translated_name: t.name,
            translated_description: t.description
          };
        });

        const categoryTranslationLookup = {};
        (categoryTranslationsRes.data?.data || []).forEach(t => {
          categoryTranslationLookup[t.category_id] = {
            translated_name: t.name,
            translated_description: t.description
          };
        });

        setTranslations(translationLookup);
        setCategoryTranslations(categoryTranslationLookup);
      } catch (translationError) {
        console.log('Amharic translation endpoints not available yet:', translationError);
        setTranslations({});
        setCategoryTranslations({});
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (itemId, field, value) => {
    setTranslations(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleCategoryTranslationChange = (categoryId, field, value) => {
    setCategoryTranslations(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value
      }
    }));
  };

  const autoTranslate = async (text, itemId, field, isCategory = false) => {
    try {
      const response = await api.post('/translate', {
        text,
        targetLang: 'am'
      });

      if (response.data?.success && response.data?.translatedText) {
        if (isCategory) {
          handleCategoryTranslationChange(itemId, field, response.data.translatedText);
        } else {
          handleTranslationChange(itemId, field, response.data.translatedText);
        }
      }
    } catch (error) {
      console.error('Auto-translation failed:', error);
      alert('Auto-translation failed. Please enter translation manually.');
    }
  };

  const saveTranslations = async () => {
    try {
      setSaving(true);

      // Prepare menu item translations
      const menuItemTranslations = [];
      Object.entries(translations).forEach(([itemId, translation]) => {
        if (translation.translated_name) {
          menuItemTranslations.push({
            menu_item_id: parseInt(itemId),
            name: translation.translated_name,
            description: translation.translated_description || ''
          });
        }
      });

      // Prepare category translations
      const categoryTranslationsList = [];
      Object.entries(categoryTranslations).forEach(([categoryId, translation]) => {
        if (translation.translated_name) {
          categoryTranslationsList.push({
            category_id: parseInt(categoryId),
            name: translation.translated_name,
            description: translation.translated_description || ''
          });
        }
      });

      // Save both types of translations to new Amharic tables
      const promises = [];
      if (menuItemTranslations.length > 0) {
        promises.push(api.post('/my-restaurant/menu-items-amharic/batch', {
          translations: menuItemTranslations
        }));
      }
      if (categoryTranslationsList.length > 0) {
        promises.push(api.post('/my-restaurant/categories-amharic/batch', {
          translations: categoryTranslationsList
        }));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        alert('Translations saved successfully!');
        // Refresh data to show saved translations
        await fetchData();
      } else {
        alert('No translations to save. Please add some translations first.');
      }
    } catch (error) {
      console.error('Error saving translations:', error);
      alert('Failed to save translations. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2">Loading translations...</span>
      </div>
    );
  }

  // Translation labels based on admin language
  const labels = {
    en: {
      title: 'Amharic Translations',
      subtitle: 'Add Amharic translations for your menu categories and items. Customers will see these translations when they switch to Amharic language.',
      categories: 'Categories',
      menuItems: 'Menu Items',
      english: 'English',
      amharic: 'Amharic (አማርኛ)',
      name: 'Name',
      description: 'Description',
      amharicName: 'Name (ስም)',
      amharicDescription: 'Description (ማብራሪያ)',
      autoTranslate: 'Auto',
      saveAll: 'Save All Translations',
      adminLanguage: 'Admin Language',
      saving: 'Saving...'
    },
    am: {
      title: 'የአማርኛ ትርጉሞች',
      subtitle: 'የምናሌ ምድቦች እና ንጥሎች የአማርኛ ትርጉሞችን ይጨምሩ። ደንበኞች ወደ አማርኛ ሲቀይሩ እነዚህን ትርጉሞች ያያሉ።',
      categories: 'ምድቦች',
      menuItems: 'የምናሌ ንጥሎች',
      english: 'እንግሊዝኛ',
      amharic: 'አማርኛ',
      name: 'ስም',
      description: 'ማብራሪያ',
      amharicName: 'ስም',
      amharicDescription: 'ማብራሪያ',
      autoTranslate: 'ራስ-ተርጉም',
      saveAll: 'ሁሉንም ትርጉሞች አስቀምጥ',
      adminLanguage: 'የአስተዳዳሪ ቋንቋ',
      saving: 'በማስቀመጥ ላይ...'
    }
  };

  const t = labels[adminLanguage];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          {/* Admin Language Toggle */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-medium text-gray-700">{t.adminLanguage}:</span>
            <button
              onClick={() => setAdminLanguage(adminLanguage === 'en' ? 'am' : 'en')}
              className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
            >
              <span>{adminLanguage === 'en' ? 'አማ' : 'EN'}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </button>
          </div>
        </div>
        <button
          onClick={saveTranslations}
          disabled={saving}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          {saving ? t.saving : t.saveAll}
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        <p>{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t.categories} ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'items'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t.menuItems} ({menuItems.length})
          </button>
        </nav>
      </div>

      {/* Category Translations */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No categories found. Add some categories first.</p>
          ) : (
            categories.map(category => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t.english}</h3>
                    <p className="text-sm text-gray-600 mb-1"><strong>{t.name}:</strong> {category.name}</p>
                    <p className="text-sm text-gray-600"><strong>{t.description}:</strong> {category.description || 'No description'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t.amharic}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{t.amharicName}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={categoryTranslations[category.id]?.translated_name || ''}
                            onChange={(e) => handleCategoryTranslationChange(category.id, 'translated_name', e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Enter Amharic name"
                          />
                          <button
                            onClick={() => autoTranslate(category.name, category.id, 'translated_name', true)}
                            className="bg-blue-500 text-white px-3 py-2 rounded text-xs hover:bg-blue-600 transition-colors"
                            title="Auto-translate using AI"
                          >
                            🔄 {t.autoTranslate}
                          </button>
                        </div>
                      </div>
                      {category.description && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">{t.amharicDescription}</label>
                          <div className="flex gap-2">
                            <textarea
                              value={categoryTranslations[category.id]?.translated_description || ''}
                              onChange={(e) => handleCategoryTranslationChange(category.id, 'translated_description', e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                              rows="2"
                              placeholder="Enter Amharic description"
                            />
                            <button
                              onClick={() => autoTranslate(category.description, category.id, 'translated_description', true)}
                              className="bg-blue-500 text-white px-3 py-2 rounded text-xs hover:bg-blue-600 transition-colors"
                              title="Auto-translate using AI"
                            >
                              🔄 Auto
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Menu Item Translations */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          {menuItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No menu items found. Add some menu items first.</p>
          ) : (
            menuItems.map(item => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t.english}</h3>
                    <p className="text-sm text-gray-600 mb-1"><strong>{t.name}:</strong> {item.name}</p>
                    <p className="text-sm text-gray-600 mb-1"><strong>Price:</strong> {item.price} BIRR</p>
                    <p className="text-sm text-gray-600"><strong>{t.description}:</strong> {item.description || 'No description'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t.amharic}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{t.amharicName}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={translations[item.id]?.translated_name || ''}
                            onChange={(e) => handleTranslationChange(item.id, 'translated_name', e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Enter Amharic name"
                          />
                          <button
                            onClick={() => autoTranslate(item.name, item.id, 'translated_name')}
                            className="bg-blue-500 text-white px-3 py-2 rounded text-xs hover:bg-blue-600 transition-colors"
                            title="Auto-translate using AI"
                          >
                            🔄 {t.autoTranslate}
                          </button>
                        </div>
                      </div>
                      {item.description && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">{t.amharicDescription}</label>
                          <div className="flex gap-2">
                            <textarea
                              value={translations[item.id]?.translated_description || ''}
                              onChange={(e) => handleTranslationChange(item.id, 'translated_description', e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                              rows="2"
                              placeholder="Enter Amharic description"
                            />
                            <button
                              onClick={() => autoTranslate(item.description, item.id, 'translated_description')}
                              className="bg-blue-500 text-white px-3 py-2 rounded text-xs hover:bg-blue-600 transition-colors"
                              title="Auto-translate using AI"
                            >
                              🔄 {t.autoTranslate}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AmharicTranslations;
