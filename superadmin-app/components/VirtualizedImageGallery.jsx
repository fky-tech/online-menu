'use client';

import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import LazyImage from './LazyImage';

/**
 * Virtualized Image Gallery component for handling large lists of images efficiently
 * @param {Object} props
 * @param {Array} props.images - Array of image objects with { src, alt, id, ...otherProps }
 * @param {number} props.itemHeight - Height of each item in pixels (default: 200)
 * @param {number} props.height - Height of the container in pixels (default: 400)
 * @param {number} props.width - Width of the container (default: '100%')
 * @param {number} props.itemsPerRow - Number of items per row (default: 1)
 * @param {Function} props.renderItem - Custom render function for each item
 * @param {Object} props.lazyOptions - Options passed to LazyImage components
 * @param {string} props.className - CSS classes for the container
 * @param {Function} props.onItemClick - Callback when an item is clicked
 */
const VirtualizedImageGallery = ({
  images = [],
  itemHeight = 200,
  height = 400,
  width = '100%',
  itemsPerRow = 1,
  renderItem = null,
  lazyOptions = {},
  className = '',
  onItemClick = null,
  ...props
}) => {
  // Group images into rows based on itemsPerRow
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < images.length; i += itemsPerRow) {
      result.push(images.slice(i, i + itemsPerRow));
    }
    return result;
  }, [images, itemsPerRow]);

  // Default item renderer
  const defaultRenderItem = ({ index, style }) => {
    const row = rows[index];
    if (!row) return null;

    return (
      <div style={style} className="flex gap-2 p-2">
        {row.map((image, colIndex) => (
          <div
            key={image.id || `${index}-${colIndex}`}
            className="flex-1 cursor-pointer"
            onClick={() => onItemClick && onItemClick(image, index * itemsPerRow + colIndex)}
          >
            <LazyImage
              src={image.src}
              alt={image.alt || `Image ${index * itemsPerRow + colIndex + 1}`}
              className="w-full h-full object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
              lazyOptions={{
                rootMargin: '100px',
                ...lazyOptions
              }}
              showLoadingSpinner={true}
              fallback="/api/placeholder/200/200"
              {...image.props}
            />
          </div>
        ))}
        {/* Fill empty slots in the last row */}
        {row.length < itemsPerRow && (
          Array.from({ length: itemsPerRow - row.length }).map((_, emptyIndex) => (
            <div key={`empty-${emptyIndex}`} className="flex-1" />
          ))
        )}
      </div>
    );
  };

  const itemRenderer = renderItem || defaultRenderItem;

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No images to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={height}
        width={width}
        itemCount={rows.length}
        itemSize={itemHeight}
        {...props}
      >
        {itemRenderer}
      </List>
    </div>
  );
};

/**
 * Grid-based virtualized gallery for more complex layouts
 */
export const VirtualizedImageGrid = ({
  images = [],
  columnCount = 3,
  rowHeight = 200,
  height = 400,
  width = '100%',
  gap = 8,
  renderItem = null,
  lazyOptions = {},
  className = '',
  onItemClick = null,
  ...props
}) => {
  // Calculate rows needed
  const rowCount = Math.ceil(images.length / columnCount);

  const defaultRenderCell = ({ columnIndex, rowIndex, style }) => {
    const imageIndex = rowIndex * columnCount + columnIndex;
    const image = images[imageIndex];

    if (!image) return null;

    return (
      <div
        style={{
          ...style,
          left: style.left + gap / 2,
          top: style.top + gap / 2,
          width: style.width - gap,
          height: style.height - gap,
        }}
        className="cursor-pointer"
        onClick={() => onItemClick && onItemClick(image, imageIndex)}
      >
        <LazyImage
          src={image.src}
          alt={image.alt || `Image ${imageIndex + 1}`}
          className="w-full h-full object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
          lazyOptions={{
            rootMargin: '100px',
            ...lazyOptions
          }}
          showLoadingSpinner={true}
          fallback="/api/placeholder/200/200"
          {...image.props}
        />
      </div>
    );
  };

  const cellRenderer = renderItem || defaultRenderCell;

  return (
    <div className={className}>
      <List
        height={height}
        width={width}
        itemCount={rowCount}
        itemSize={rowHeight}
        {...props}
      >
        {({ index, style }) => (
          <div style={style} className="flex">
            {Array.from({ length: columnCount }).map((_, colIndex) => {
              const imageIndex = index * columnCount + colIndex;
              const image = images[imageIndex];
              
              return (
                <div
                  key={colIndex}
                  className="flex-1 p-1 cursor-pointer"
                  onClick={() => image && onItemClick && onItemClick(image, imageIndex)}
                >
                  {image && (
                    <LazyImage
                      src={image.src}
                      alt={image.alt || `Image ${imageIndex + 1}`}
                      className="w-full h-full object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      lazyOptions={{
                        rootMargin: '100px',
                        ...lazyOptions
                      }}
                      showLoadingSpinner={true}
                      {...image.props}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </List>
    </div>
  );
};

export default VirtualizedImageGallery;
