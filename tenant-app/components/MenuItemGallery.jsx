'use client';

import React, { useState, useEffect, useMemo } from 'react';
import VirtualizedImageGallery, { VirtualizedImageGrid } from './VirtualizedImageGallery';
import LazyImage from './LazyImage';
import { useLazyImageBatch } from '../hooks/useLazyLoading';
import { resolveImageUrl } from '../utils/imageUtils';

/**
 * Gallery component specifically for menu items with virtualization
 * Useful when you have many menu items with images
 */
const MenuItemGallery = ({ 
  menuItems = [], 
  viewMode = 'grid', // 'grid', 'list', 'masonry'
  onItemClick = null,
  className = '',
  height = 600 
}) => {
  const [selectedItem, setSelectedItem] = useState(null);

  // Transform menu items into image objects for the gallery
  const galleryImages = useMemo(() => {
    return menuItems
      .filter(item => item.image_url) // Only items with images
      .map(item => ({
        id: item.id,
        src: resolveImageUrl(item.image_url),
        alt: item.name,
        title: item.name,
        description: item.description,
        price: item.price,
        is_available: item.is_available,
        props: {
          'data-item-id': item.id,
          'data-price': item.price
        }
      }));
  }, [menuItems]);

  const handleItemClick = (image, index) => {
    const menuItem = menuItems.find(item => item.id === image.id);
    setSelectedItem(menuItem);
    if (onItemClick) {
      onItemClick(menuItem, index);
    }
  };

  // Custom renderer for menu items with overlay information
  const renderMenuItem = ({ index, style }) => {
    const image = galleryImages[index];
    if (!image) return null;

    return (
      <div style={style} className="p-2">
        <div 
          className="relative group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          onClick={() => handleItemClick(image, index)}
        >
          <LazyImage
            src={image.src}
            alt={image.alt}
            className="w-full h-48 object-cover"
            lazyOptions={{
              rootMargin: '100px',
              threshold: 0.1
            }}
            showLoadingSpinner={true}
          />
          
          {/* Overlay with item info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-semibold text-sm mb-1 truncate">{image.title}</h3>
              <p className="text-xs opacity-90 mb-2 line-clamp-2">{image.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Br {Number(image.price).toFixed(2)}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  image.is_available 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {image.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (galleryImages.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No menu items with images found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {viewMode === 'grid' && (
        <VirtualizedImageGrid
          images={galleryImages}
          columnCount={3}
          rowHeight={280}
          height={height}
          onItemClick={handleItemClick}
          renderItem={renderMenuItem}
          lazyOptions={{
            rootMargin: '200px',
            threshold: 0.1
          }}
        />
      )}

      {viewMode === 'list' && (
        <VirtualizedImageGallery
          images={galleryImages}
          itemHeight={120}
          height={height}
          itemsPerRow={1}
          onItemClick={handleItemClick}
          renderItem={({ index, style }) => {
            const image = galleryImages[index];
            if (!image) return null;

            return (
              <div style={style} className="p-2">
                <div 
                  className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleItemClick(image, index)}
                >
                  <LazyImage
                    src={image.src}
                    alt={image.alt}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    lazyOptions={{
                      rootMargin: '100px',
                      threshold: 0.1
                    }}
                    showLoadingSpinner={false}
                  />
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{image.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{image.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xl text-green-600">Br {Number(image.price).toFixed(2)}</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        image.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {image.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
          lazyOptions={{
            rootMargin: '200px',
            threshold: 0.1
          }}
        />
      )}

      {/* Modal for selected item */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <LazyImage
                src={resolveImageUrl(selectedItem.image_url)}
                alt={selectedItem.name}
                className="w-full h-64 object-cover rounded-t-lg"
                showLoadingSpinner={true}
              />
              
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-green-600">
                    Br {Number(selectedItem.price).toFixed(2)}
                  </span>
                  <span className={`px-4 py-2 rounded-full font-medium ${
                    selectedItem.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedItem.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Batch image loader component for preloading multiple images
 * Useful for galleries where you want to preload images in batches
 */
export const BatchImageLoader = ({ imageUrls, onBatchLoaded, className = '' }) => {
  const { ref, loadedImages, loadingStates, errorStates } = useLazyImageBatch(imageUrls, {
    rootMargin: '200px',
    threshold: 0.1
  });

  const loadedCount = Object.keys(loadedImages).length;
  const totalCount = imageUrls.length;
  const progress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0;

  useEffect(() => {
    if (loadedCount === totalCount && totalCount > 0 && onBatchLoaded) {
      onBatchLoaded(loadedImages);
    }
  }, [loadedCount, totalCount, loadedImages, onBatchLoaded]);

  return (
    <div ref={ref} className={`p-4 ${className}`}>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Loading images...</span>
          <span>{loadedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Hidden images for preloading */}
      <div className="hidden">
        {Object.entries(loadedImages).map(([index, src]) => (
          <img key={index} src={src} alt="" />
        ))}
      </div>
    </div>
  );
};

export default MenuItemGallery;
