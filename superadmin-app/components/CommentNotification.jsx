'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/i18n';

const CommentNotification = ({ hasScanToken, restaurant, onClose }) => {
  const { lang } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if notification should be shown
    const shouldShow = hasScanToken && restaurant?.comment && !isDismissed;

    // Show notification after a short delay for better UX
    if (shouldShow) {
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Show after 3 seconds

      // Auto-hide after 5 seconds if not dismissed
      const hideTimer = setTimeout(() => {
        if (!isDismissed) {
          setIsVisible(false);
        }
      }, 9000); // Hide after 7 seconds total (3s delay + 6s visible)

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setIsVisible(false);
    }
  }, [hasScanToken, restaurant, isDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    onClose?.();
  };

  if (!isVisible) return null;

  const message = lang === 'am'
    ? 'ሰላም፣ አስተያየት መስጠት እንዳትርሱ እባክዎ ያስታውሱ።'
    : 'Hello, please don\'t forget to leave a comment.';

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-out animate-in slide-in-from-top-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-5">
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4 text-white/70 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentNotification;
