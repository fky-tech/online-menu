'use client';

import React, { useState } from 'react';
import LazyImage from './LazyImage';
import api from '@/lib/api';

const MenuItemModal = ({ open, item, onClose, lang = 'en', hasScanToken, restaurant, theme }) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  if (!open || !item) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const useCookies = process.env.NEXT_PUBLIC_USE_SCAN_COOKIES === 'true';

      const payload = {
        comment_text: commentText.trim(),
        menu_item_name: item.name
      };

      // Always try to add token from localStorage as fallback
      const storedToken = localStorage.getItem('scan_token');
      console.log('Client - Stored token from localStorage:', storedToken);

      if (storedToken) {
        payload.scan_token = storedToken;
      }

      console.log('Client - Final payload being sent:', payload);

      await api.post('/comments', payload);

      setCommentText('');
      setShowCommentForm(false);
      alert(lang === 'am' ? 'አስተያየት ተልኳል!' : 'Comment submitted successfully!');
    } catch (error) {
      console.error('Comment submission error:', error);
      alert(lang === 'am' ? 'አስተያየት መልክ አልተሳካም።' : 'Failed to submit comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-h-[90vh] inline-flex flex-col overflow-hidden max-w-[90vw] min-w-[300px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative overflow-hidden w-full">
          <LazyImage
            src={item.image_url}
            alt={item.name}
            className="block max-w-full h-auto max-h-96 object-cover"
            placeholderType="menu"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 w-full">
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{item.name}</h2>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-amber-600">
                Br {Number(item.price).toFixed(2)}
              </span>

              {typeof item.is_available !== 'undefined' && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  <span className={`w-2 h-2 rounded-full mr-2 ${item.is_available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {item.is_available ? (lang === 'am' ? 'ይገኛል' : 'Available') : (lang === 'am' ? 'አይገኝም' : 'Not available')}
                </span>
              )}
            </div>
          </div>

          {item.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {lang === 'am' ? 'ማብራሪያ' : 'Description'}
              </h3>
              <p className="text-gray-700 leading-relaxed text-base">{item.description}</p>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {hasScanToken && restaurant?.comment && (
              <button
                onClick={() => setShowCommentForm(true)}
                style={{ backgroundColor: theme?.primary_color || '#b46113' }}
                className="flex-1 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-colors duration-200"
              >
                {lang === 'am' ? 'አስተያየት ይስጡ' : 'Leave a Comment'}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              {lang === 'am' ? 'ዝጋ' : 'Close'}
            </button>
          </div>
        </div>
      </div>

      {showCommentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {lang === 'am' ? 'አስተያየት ይስጡ' : 'Leave a Comment'}
            </h3>

            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={lang === 'am' ? 'አስተያየትዎን ይፃፉ...' : 'Write your comment...'}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                rows="4"
                maxLength="500"
                disabled={submittingComment}
                required
              />

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{commentText.length}/500</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCommentForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  disabled={submittingComment}
                >
                  {lang === 'am' ? 'ተወው' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  style={{ backgroundColor: theme?.primary_color || '#b46113' }}
                  className="flex-1 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingComment
                    ? (lang === 'am' ? 'በማስተላለፍ ላይ...' : 'Submitting...')
                    : (lang === 'am' ? 'አስተላልፍ' : 'Submit')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemModal;