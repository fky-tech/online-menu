'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

const ThemeModal = ({ isOpen, onClose, restaurant, themeInfo, onThemeUpdate }) => {
  const [themeForm, setThemeForm] = useState({
    font_family: "Arial",
    text_color: "#000000",
    background_color: "#ffffff",
    primary_color: "#3b82f6",
    secondary_color: "#6b7280"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/my-restaurant/theme', themeForm);
      if (response.data.success) {
        setSuccess('Theme updated successfully!');
        onThemeUpdate && onThemeUpdate(response.data.data);

        // Dispatch theme update event for Layout component to reload theme
        window.dispatchEvent(new CustomEvent('themeUpdated', { detail: response.data.data }));

        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      }
    } catch (e) {
      setError('Failed to save theme: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Theme Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={themeForm.font_family}
                onChange={(e) => setThemeForm({...themeForm, font_family: e.target.value})}
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Poppins">Poppins</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    value={themeForm.text_color}
                    onChange={(e) => setThemeForm({...themeForm, text_color: e.target.value})}
                  />
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={themeForm.text_color}
                    onChange={(e) => setThemeForm({...themeForm, text_color: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    value={themeForm.background_color}
                    onChange={(e) => setThemeForm({...themeForm, background_color: e.target.value})}
                  />
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={themeForm.background_color}
                    onChange={(e) => setThemeForm({...themeForm, background_color: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    value={themeForm.primary_color}
                    onChange={(e) => setThemeForm({...themeForm, primary_color: e.target.value})}
                  />
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={themeForm.primary_color}
                    onChange={(e) => setThemeForm({...themeForm, primary_color: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    value={themeForm.secondary_color}
                    onChange={(e) => setThemeForm({...themeForm, secondary_color: e.target.value})}
                  />
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={themeForm.secondary_color}
                    onChange={(e) => setThemeForm({...themeForm, secondary_color: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {themeInfo && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Current Theme</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Font:</strong> {themeInfo.font_family}</p>
                  <p><strong>Text Color:</strong> <span className="inline-block w-4 h-4 rounded border ml-1" style={{backgroundColor: themeInfo.text_color}}></span> {themeInfo.text_color}</p>
                  <p><strong>Primary Color:</strong> <span className="inline-block w-4 h-4 rounded border ml-1" style={{backgroundColor: themeInfo.primary_color}}></span> {themeInfo.primary_color}</p>
                  <p><strong>Last Updated:</strong> {new Date(themeInfo.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors"
              >
                {loading ? 'Saving...' : 'Save Theme'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;
