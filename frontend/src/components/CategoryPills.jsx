import React, { useRef, useEffect, useState, useLayoutEffect } from "react";

const CategoryPills = ({ categories, selectedId, onSelect }) => {
  const containerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const buttonsRef = useRef(new Map());
  const [indicatorLeft, setIndicatorLeft] = useState(0);
  const [indicatorWidth, setIndicatorWidth] = useState(0);

  // Check if scrolling is available
  useEffect(() => {
    const checkScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      
      // Add a small buffer to account for rounding issues
      const buffer = 2;
      setShowLeftScroll(container.scrollLeft > buffer);
      setShowRightScroll(
        container.scrollLeft < container.scrollWidth - container.clientWidth - buffer
      );
    };

    // Initial check with a slight delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
    }
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkScroll);
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
    };
  }, [categories]);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    
    // Calculate scroll amount based on container width for better responsiveness
    const scrollAmount = Math.min(container.clientWidth * 0.7, 300);
    container.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  // Keep underline aligned to the selected tab
  useLayoutEffect(() => {
    const container = containerRef.current;
    const selectedButton = buttonsRef.current.get(selectedId);
    if (!container || !selectedButton) return;

    const update = () => {
      // Account for container padding in calculation
      const containerRect = container.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();
      
      const left = buttonRect.left - containerRect.left + container.scrollLeft;
      const width = selectedButton.offsetWidth;
      
      setIndicatorLeft(left);
      setIndicatorWidth(width);
    };

    update();
    
    const onScroll = () => requestAnimationFrame(update);
    const onResize = () => {
      requestAnimationFrame(update);
    };
    
    container.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    
    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [selectedId, categories]);

  // Ensure selected category is visible
  useEffect(() => {
    if (!selectedId) return;
    
    const container = containerRef.current;
    const selectedButton = buttonsRef.current.get(selectedId);
    
    if (container && selectedButton) {
      // Wait for the next frame to ensure all measurements are correct
      requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = selectedButton.getBoundingClientRect();
        
        // Check if button is outside visible area
        if (buttonRect.left < containerRect.left) {
          // Scroll to make button visible on left side
          container.scrollTo({
            left: selectedButton.offsetLeft - 10,
            behavior: 'smooth'
          });
        } else if (buttonRect.right > containerRect.right) {
          // Scroll to make button visible on right side
          container.scrollTo({
            left: selectedButton.offsetLeft - containerRect.width + selectedButton.offsetWidth + 10,
            behavior: 'smooth'
          });
        }
      });
    }
  }, [selectedId]);

  // Create "All" category object
  const allCategory = { id: 'all', name: 'All' };
  
  // Split categories into two groups for mobile, including "All" button
  const categoriesWithAll = [allCategory, ...categories];
  const midPoint = Math.ceil(categoriesWithAll.length / 2);
  const leftGroup = categoriesWithAll.slice(0, midPoint);
  const rightGroup = categoriesWithAll.slice(midPoint);

  return (
    <div className="relative mb-6">
      {/* Mobile: Two groups layout */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-4">
          {/* Left Group */}
          <div className="space-y-2">
            {leftGroup.map((category) => {
              const isSelected = selectedId === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onSelect(category)}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 touch-manipulation ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-amber-300 hover:text-amber-700 active:scale-95'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Right Group */}
          <div className="space-y-2">
            {rightGroup.map((category) => {
              const isSelected = selectedId === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onSelect(category)}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 touch-manipulation ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-amber-300 hover:text-amber-700 active:scale-95'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop: Horizontal scrolling layout */}
      <div className="hidden lg:block relative">
        {/* Scroll container with better desktop touch handling */}
        <div
          ref={containerRef}
          className="flex gap-3 overflow-x-auto py-3 px-4 scrollbar-hide"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {categoriesWithAll.map((category) => {
            const isSelected = selectedId === category.id;
            return (
              <button
                key={category.id}
                ref={(el) => {
                  if (el) {
                    buttonsRef.current.set(category.id, el);
                  } else {
                    buttonsRef.current.delete(category.id);
                  }
                }}
                onClick={() => onSelect(category)}
                className={`flex-shrink-0  px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 touch-manipulation ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-amber-300 hover:text-amber-700 active:scale-95'
                }`}
                style={{ 
                  minWidth: '100px',
                  touchAction: 'manipulation'
                }}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Active indicator - desktop only */}
        <div className="h-1 bg-stone-100 mt-3 rounded-full relative">
          <div
            className="absolute top-0 left-0 h-full bg-amber-600 rounded-full transition-all duration-300 ease-out shadow-sm"
            style={{
              transform: `translateX(${indicatorLeft}px)`,
              width: `${indicatorWidth}px`,
            }}
          />
        </div>
      </div>

      {/* Desktop scroll controls - hidden on mobile for cleaner look */}
      <div className="hidden lg:block">
        {showLeftScroll && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-stone-600 hover:text-amber-600 hover:shadow-xl transition-all duration-200"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {showRightScroll && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-stone-600 hover:text-amber-600 hover:shadow-xl transition-all duration-200"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Desktop gradient edges */}
        {showLeftScroll && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-stone-50 to-transparent pointer-events-none z-10" />
        )}
        {showRightScroll && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-stone-50 to-transparent pointer-events-none z-10" />
        )}
      </div>
    </div>
  );
};

export default CategoryPills;