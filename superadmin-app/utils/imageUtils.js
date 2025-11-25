/**
 * Utility functions for image handling and placeholder generation
 */

/**
 * Resolves image URL to handle both old MySQL uploads and new Supabase Storage URLs
 * @param {string} imageUrl - Image URL from database
 * @returns {string} Resolved image URL
 */
export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // If it's already a full URL (Supabase Storage or external), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Handle legacy /uploads/ paths (for backward compatibility during migration)
  if (imageUrl.startsWith('/uploads/')) {
    const backendUrl = import.meta.env.VITE_API_STATIC_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}${imageUrl}`;
  }

  // If it's a relative path, assume it's a Supabase Storage path
  if (!imageUrl.startsWith('/')) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/${imageUrl}`;
    }
  }

  return imageUrl;
};

/**
 * Generate a simple SVG placeholder
 * @param {number} width - Width of the placeholder
 * @param {number} height - Height of the placeholder
 * @param {string} text - Text to display in the placeholder
 * @param {string} bgColor - Background color (default: #f3f4f6)
 * @param {string} textColor - Text color (default: #9CA3AF)
 * @returns {string} Base64 encoded SVG data URL
 */
export const generatePlaceholder = (
  width = 400, 
  height = 300, 
  text = 'Loading...', 
  bgColor = '#f3f4f6', 
  textColor = '#9CA3AF'
) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="14" 
        fill="${textColor}" 
        text-anchor="middle" 
        dy=".3em"
      >
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate a gradient placeholder
 * @param {number} width - Width of the placeholder
 * @param {number} height - Height of the placeholder
 * @param {string} color1 - Start color (default: #f3f4f6)
 * @param {string} color2 - End color (default: #e5e7eb)
 * @returns {string} Base64 encoded SVG data URL
 */
export const generateGradientPlaceholder = (
  width = 400, 
  height = 300, 
  color1 = '#f3f4f6', 
  color2 = '#e5e7eb'
) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate a shimmer/skeleton placeholder
 * @param {number} width - Width of the placeholder
 * @param {number} height - Height of the placeholder
 * @returns {string} Base64 encoded SVG data URL
 */
export const generateShimmerPlaceholder = (width = 400, height = 300) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-100 0;100 0;-100 0"
            dur="2s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#shimmer)"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate a low-quality image placeholder (LQIP) from a high-quality image
 * This would typically be done on the server, but here's a client-side approximation
 * @param {string} imageUrl - URL of the high-quality image
 * @param {number} quality - Quality factor (0.1 = 10% quality)
 * @returns {Promise<string>} Promise that resolves to a low-quality data URL
 */
export const generateLQIP = async (imageUrl, quality = 0.1) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set small dimensions for low quality
      const targetWidth = Math.max(20, img.width * quality);
      const targetHeight = Math.max(20, img.height * quality);
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Draw the image at low resolution
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      // Convert to data URL with low quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.3);
      resolve(dataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for LQIP generation'));
    };
    
    img.src = imageUrl;
  });
};



/**
 * Preload an image
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>} Promise that resolves when image is loaded
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images
 * @param {string[]} urls - Array of image URLs
 * @returns {Promise<HTMLImageElement[]>} Promise that resolves when all images are loaded
 */
export const preloadImages = async (urls) => {
  const promises = urls.map(url => preloadImage(url));
  return Promise.all(promises);
};

/**
 * Get image dimensions without loading the full image
 * @param {string} src - Image source URL
 * @returns {Promise<{width: number, height: number}>} Promise that resolves with dimensions
 */
export const getImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Check if an image URL is valid and accessible
 * @param {string} src - Image source URL
 * @returns {Promise<boolean>} Promise that resolves to true if image is valid
 */
export const isImageValid = async (src) => {
  try {
    await preloadImage(src);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generate responsive image srcSet
 * @param {string} baseUrl - Base image URL
 * @param {number[]} widths - Array of widths for responsive images
 * @returns {string} srcSet string for responsive images
 */
export const generateSrcSet = (baseUrl, widths = [320, 640, 960, 1280]) => {
  return widths
    .map(width => `${baseUrl}?w=${width} ${width}w`)
    .join(', ');
};

/**
 * Common placeholder configurations
 */
export const PLACEHOLDER_CONFIGS = {
  menu: {
    width: 400,
    height: 300,
    text: 'Menu Item',
    bgColor: '#f9fafb',
    textColor: '#6b7280'
  },
  avatar: {
    width: 100,
    height: 100,
    text: '👤',
    bgColor: '#f3f4f6',
    textColor: '#9ca3af'
  },
  logo: {
    width: 200,
    height: 100,
    text: 'Logo',
    bgColor: '#ffffff',
    textColor: '#d1d5db'
  },
  gallery: {
    width: 300,
    height: 200,
    text: '🖼️',
    bgColor: '#f8fafc',
    textColor: '#94a3b8'
  }
};

/**
 * Generate placeholder for specific use cases
 * @param {string} type - Type of placeholder (menu, avatar, logo, gallery)
 * @param {Object} overrides - Override default configuration
 * @returns {string} Base64 encoded SVG data URL
 */
export const generateTypedPlaceholder = (type = 'menu', overrides = {}) => {
  const config = { ...PLACEHOLDER_CONFIGS[type], ...overrides };
  return generatePlaceholder(
    config.width,
    config.height,
    config.text,
    config.bgColor,
    config.textColor
  );
};
