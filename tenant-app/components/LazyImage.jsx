'use client';

import React from 'react';
import { useLazyImage } from '../hooks/useLazyLoading';
import { resolveImageUrl, generateTypedPlaceholder } from '../utils/imageUtils';

/**
 * LazyImage component with progressive loading and error handling
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - CSS classes
 * @param {string} props.placeholder - Placeholder image URL or base64
 * @param {string} props.fallback - Fallback image URL when error occurs
 * @param {Object} props.lazyOptions - Options for lazy loading
 * @param {boolean} props.showLoadingSpinner - Whether to show loading spinner
 * @param {Function} props.onLoad - Callback when image loads
 * @param {Function} props.onError - Callback when image fails to load
 * @param {Object} props.style - Inline styles
 * @param {string} props.loadingClassName - CSS classes for loading state
 * @param {string} props.errorClassName - CSS classes for error state
 */
const LazyImage = ({
  src,
  alt = '',
  className = '',
  placeholder = null,
  fallback = null,
  lazyOptions = {},
  showLoadingSpinner = true,
  onLoad = null,
  onError = null,
  style = {},
  loadingClassName = '',
  errorClassName = '',
  placeholderType = 'menu',
  baseUrl = '',
  ...props
}) => {
  // Resolve the image URL
  const resolvedSrc = resolveImageUrl(src, baseUrl);

  // Generate a placeholder if none provided
  const defaultPlaceholder = placeholder || generateTypedPlaceholder(placeholderType, {
    text: 'Loading...'
  });

  const {
    ref,
    imageSrc,
    isLoading,
    hasError,
    hasLoaded,
    shouldLoad
  } = useLazyImage(resolvedSrc, defaultPlaceholder, lazyOptions);

  // Handle load callback
  React.useEffect(() => {
    if (hasLoaded && onLoad) {
      onLoad();
    }
  }, [hasLoaded, onLoad]);

  // Handle error callback
  React.useEffect(() => {
    if (hasError && onError) {
      onError();
    }
  }, [hasError, onError]);

  // Determine final image source
  const finalSrc = hasError && fallback ? fallback : imageSrc;

  // Combine class names based on state
  const finalClassName = [
    className,
    isLoading ? loadingClassName : '',
    hasError ? errorClassName : '',
    'transition-opacity duration-300',
    hasLoaded ? 'opacity-100' : 'opacity-70'
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className="relative inline-block" style={style}>
      {finalSrc && (
        <img
          src={finalSrc}
          alt={alt}
          className={finalClassName}
          style={{
            ...style,
            transition: 'opacity 0.3s ease-in-out'
          }}
          {...props}
        />
      )}
      
      {/* Loading spinner overlay */}
      {isLoading && showLoadingSpinner && shouldLoad && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          <div className="text-center">
            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Failed to load</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
