'use client';

import React from 'react';

const ToastModal = ({ open, onClose, message, success = true, timeout = 2500 }) => {
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose(), timeout);
    return () => clearTimeout(t);
  }, [open, onClose, timeout]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center p-4 pointer-events-none">
      <div
        role="alert"
        className={`pointer-events-auto max-w-sm w-full rounded-lg shadow-lg p-4 ${
          success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 w-3 h-3 rounded-full ${success ? 'bg-green-500' : 'bg-red-500'}`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>{message}</p>
          </div>
          <button onClick={onClose} className="text-sm text-stone-500 ml-3">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ToastModal;
