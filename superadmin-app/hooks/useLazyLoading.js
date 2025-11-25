import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for lazy loading using Intersection Observer
 * @param {Object} options - Intersection Observer options
 * @param {string} options.rootMargin - Margin around the root (default: '50px')
 * @param {number} options.threshold - Threshold for intersection (default: 0.1)
 * @param {boolean} options.triggerOnce - Whether to trigger only once (default: true)
 * @returns {Object} - { ref, isIntersecting, hasIntersected }
 */
export const useLazyLoading = (options = {}) => {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, triggerOnce, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
};

/**
 * Hook for lazy loading images with progressive loading states
 * @param {string} src - Image source URL
 * @param {string} placeholder - Placeholder image URL (optional)
 * @param {Object} options - Lazy loading options
 * @returns {Object} - { ref, imageSrc, isLoading, hasError, hasLoaded }
 */
export const useLazyImage = (src, placeholder = null, options = {}) => {
  const { ref, hasIntersected } = useLazyLoading(options);
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!hasIntersected || !src) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasLoaded(true);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      // Keep placeholder if available, otherwise set to null
      if (!placeholder) {
        setImageSrc(null);
      }
    };
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [hasIntersected, src, placeholder]);

  return {
    ref,
    imageSrc,
    isLoading,
    hasError,
    hasLoaded,
    shouldLoad: hasIntersected
  };
};

/**
 * Hook for batch lazy loading multiple images
 * @param {Array} imageUrls - Array of image URLs
 * @param {Object} options - Lazy loading options
 * @returns {Object} - { ref, loadedImages, loadingStates, errorStates }
 */
export const useLazyImageBatch = (imageUrls = [], options = {}) => {
  const { ref, hasIntersected } = useLazyLoading(options);
  const [loadedImages, setLoadedImages] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});

  const loadImage = useCallback((url, index) => {
    if (!url) return;

    setLoadingStates(prev => ({ ...prev, [index]: true }));
    setErrorStates(prev => ({ ...prev, [index]: false }));

    const img = new Image();
    
    img.onload = () => {
      setLoadedImages(prev => ({ ...prev, [index]: url }));
      setLoadingStates(prev => ({ ...prev, [index]: false }));
    };
    
    img.onerror = () => {
      setLoadingStates(prev => ({ ...prev, [index]: false }));
      setErrorStates(prev => ({ ...prev, [index]: true }));
    };
    
    img.src = url;
  }, []);

  useEffect(() => {
    if (!hasIntersected) return;

    imageUrls.forEach((url, index) => {
      if (!loadedImages[index] && !loadingStates[index] && !errorStates[index]) {
        loadImage(url, index);
      }
    });
  }, [hasIntersected, imageUrls, loadedImages, loadingStates, errorStates, loadImage]);

  return {
    ref,
    loadedImages,
    loadingStates,
    errorStates,
    shouldLoad: hasIntersected
  };
};
