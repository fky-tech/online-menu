'use client';

import React, { useState, useEffect } from 'react';
import LazyImage from '@/components/LazyImage';
import VirtualizedImageGallery, { VirtualizedImageGrid } from '@/components/VirtualizedImageGallery';
import MenuItemGallery, { BatchImageLoader } from '@/components/MenuItemGallery';
import { useLazyLoading, useLazyImage, useLazyImageBatch } from '../hooks/useLazyLoading';

const LazyLoadingDemo = () => {
  const [activeDemo, setActiveDemo] = useState('basic');
  const [menuItems, setMenuItems] = useState([]);

  // Generate sample data for demos
  useEffect(() => {
    const sampleItems = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Menu Item ${i + 1}`,
      description: `Delicious description for menu item ${i + 1}. This is a longer description to show how text wraps.`,
      price: (Math.random() * 50 + 10).toFixed(2),
      image_url: `https://picsum.photos/400/300?random=${i + 1}`,
      is_available: Math.random() > 0.2
    }));
    setMenuItems(sampleItems);
  }, []);

  const demoSections = {
    basic: 'Basic Lazy Loading',
    progressive: 'Progressive Loading',
    batch: 'Batch Loading',
    virtualized: 'Virtualized Gallery',
    menu: 'Menu Item Gallery'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Lazy Loading Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore different lazy loading implementations including Intersection Observer, 
            progressive loading, virtualization, and specialized components.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.entries(demoSections).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveDemo(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeDemo === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeDemo === 'basic' && <BasicLazyLoadingDemo />}
          {activeDemo === 'progressive' && <ProgressiveLoadingDemo />}
          {activeDemo === 'batch' && <BatchLoadingDemo />}
          {activeDemo === 'virtualized' && <VirtualizedGalleryDemo />}
          {activeDemo === 'menu' && <MenuGalleryDemo menuItems={menuItems} />}
        </div>
      </div>
    </div>
  );
};

// Basic Lazy Loading Demo
const BasicLazyLoadingDemo = () => {
  const { ref, isIntersecting, hasIntersected } = useLazyLoading({
    rootMargin: '100px',
    threshold: 0.1
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Basic Lazy Loading with Intersection Observer</h2>
      <p className="text-gray-600 mb-6">
        Scroll down to see images load as they enter the viewport. The hook provides 
        intersection states for custom loading logic.
      </p>
      
      <div className="space-y-8">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Image {i + 1}</h3>
            <LazyImage
              src={`https://picsum.photos/600/300?random=${i + 100}`}
              alt={`Demo image ${i + 1}`}
              className="w-full h-64 object-cover rounded-lg"
              lazyOptions={{
                rootMargin: '50px',
                threshold: 0.1
              }}
              showLoadingSpinner={true}
            />
          </div>
        ))}
        
        {/* Intersection Observer Demo */}
        <div ref={ref} className="border-2 border-dashed border-blue-300 p-8 text-center">
          <h3 className="font-semibold mb-2">Intersection Observer Status</h3>
          <div className="space-y-2">
            <p>Is Intersecting: <span className={isIntersecting ? 'text-green-600' : 'text-red-600'}>
              {isIntersecting ? 'Yes' : 'No'}
            </span></p>
            <p>Has Intersected: <span className={hasIntersected ? 'text-green-600' : 'text-red-600'}>
              {hasIntersected ? 'Yes' : 'No'}
            </span></p>
          </div>
          {hasIntersected && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg">
              <p className="text-green-800">🎉 This content loaded when you scrolled to it!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Progressive Loading Demo
const ProgressiveLoadingDemo = () => {
  const generatePlaceholder = (width, height, text) => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#9CA3AF" text-anchor="middle" dy=".3em">${text}</text>
      </svg>
    `)}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Progressive Image Loading</h2>
      <p className="text-gray-600 mb-6">
        Images load progressively with placeholders, loading states, and error handling.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="space-y-2">
            <h3 className="font-medium">Progressive Image {i + 1}</h3>
            <LazyImage
              src={`https://picsum.photos/400/300?random=${i + 200}`}
              alt={`Progressive demo ${i + 1}`}
              placeholder={generatePlaceholder(400, 300, `Loading ${i + 1}...`)}
              className="w-full h-48 object-cover rounded-lg"
              lazyOptions={{
                rootMargin: '100px',
                threshold: 0.1
              }}
              showLoadingSpinner={true}
              fallback={generatePlaceholder(400, 300, 'Failed to load')}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Batch Loading Demo
const BatchLoadingDemo = () => {
  const imageUrls = Array.from({ length: 20 }, (_, i) => 
    `https://picsum.photos/200/200?random=${i + 300}`
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Batch Image Loading</h2>
      <p className="text-gray-600 mb-6">
        Load multiple images in batches with progress tracking.
      </p>
      
      <BatchImageLoader
        imageUrls={imageUrls}
        onBatchLoaded={(loadedImages) => {
          console.log('Batch loaded:', loadedImages);
        }}
        className="mb-6"
      />
      
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {imageUrls.map((url, index) => (
          <LazyImage
            key={index}
            src={url}
            alt={`Batch image ${index + 1}`}
            className="w-full h-20 object-cover rounded"
            lazyOptions={{
              rootMargin: '200px',
              threshold: 0.1
            }}
            showLoadingSpinner={false}
          />
        ))}
      </div>
    </div>
  );
};

// Virtualized Gallery Demo
const VirtualizedGalleryDemo = () => {
  const [viewMode, setViewMode] = useState('grid');
  
  const images = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    src: `https://picsum.photos/300/200?random=${i + 400}`,
    alt: `Gallery image ${i + 1}`,
    title: `Image ${i + 1}`,
    description: `This is a description for image ${i + 1}`
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Virtualized Image Gallery</h2>
      <p className="text-gray-600 mb-6">
        Handle thousands of images efficiently with virtualization. Only visible items are rendered.
      </p>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Grid View
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          List View
        </button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {viewMode === 'grid' ? (
          <VirtualizedImageGrid
            images={images}
            columnCount={4}
            rowHeight={200}
            height={600}
            onItemClick={(image, index) => {
              alert(`Clicked image ${index + 1}: ${image.title}`);
            }}
          />
        ) : (
          <VirtualizedImageGallery
            images={images}
            itemHeight={120}
            height={600}
            itemsPerRow={1}
            onItemClick={(image, index) => {
              alert(`Clicked image ${index + 1}: ${image.title}`);
            }}
          />
        )}
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        📊 Rendering {images.length} images efficiently with virtualization
      </p>
    </div>
  );
};

// Menu Gallery Demo
const MenuGalleryDemo = ({ menuItems }) => {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Menu Item Gallery</h2>
      <p className="text-gray-600 mb-6">
        Specialized gallery for menu items with overlay information and modal view.
      </p>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Grid View
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          List View
        </button>
      </div>
      
      <MenuItemGallery
        menuItems={menuItems}
        viewMode={viewMode}
        height={600}
        onItemClick={(item, index) => {
          console.log('Selected menu item:', item);
        }}
        className="border rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default LazyLoadingDemo;
