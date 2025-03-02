/**
 * Image styling utility functions for consistent image display across the app
 */

/**
 * Returns styling for responsive images based on display type
 * 
 * @param {string} type - The type of image display ('contain', 'flexible', 'tile', 'full')
 * @returns {Object} - Style object for the image
 */
export const getImageStyle = (type = 'flexible') => {
  const styles = {
    // Preserves aspect ratio, ensures entire image is visible
    contain: {
      objectFit: 'contain',
      width: '100%',
      height: 'auto',
      maxHeight: '100%',
    },
    
    // Fills container while maintaining aspect ratio
    flexible: {
      objectFit: 'scale-down',
      width: '100%',
      height: 'auto',
    },
    
    // Creates a repeating pattern
    tile: {
      backgroundSize: 'auto',
      backgroundRepeat: 'repeat',
      width: '100%',
      height: '100%',
    },
    
    // Full bleed image that fills container
    full: {
      objectFit: 'fill',
      width: '100%',
      height: '100%',
    }
  };
  
  return styles[type] || styles.flexible;
};

/**
 * Returns styling for background images
 * 
 * @param {string} url - The image URL
 * @param {string} type - The type of background ('cover', 'contain', 'pattern', 'fixed')
 * @returns {Object} - Style object for the background
 */
export const getBackgroundStyle = (url, type = 'pattern') => {
  const baseStyle = {
    backgroundImage: `url("${url}")`,
    backgroundPosition: 'center',
  };
  
  switch (type) {
    case 'cover':
      return {
        ...baseStyle,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      };
      
    case 'contain':
      return {
        ...baseStyle,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
      };
      
    case 'pattern':
      return {
        ...baseStyle,
        backgroundSize: '400px auto', // Set a specific size for the pattern
        backgroundRepeat: 'repeat',
      };
      
    case 'fixed':
      return {
        ...baseStyle,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      };
      
    default:
      return baseStyle;
  }
};
