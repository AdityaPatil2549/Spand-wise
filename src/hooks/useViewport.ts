import { useEffect, useState } from 'react';

/**
 * Hook to manage viewport height, especially useful for mobile browsers
 * where the virtual keyboard can cause unexpected layout jumps.
 */
export const useViewport = () => {
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      // Use visualViewport if available for more accurate keyboard handling
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    updateViewport();

    // Listen to resize and visualViewport resize
    window.addEventListener('resize', updateViewport);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
    }

    return () => {
      window.removeEventListener('resize', updateViewport);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
      }
    };
  }, []);

  return { viewportHeight };
};
