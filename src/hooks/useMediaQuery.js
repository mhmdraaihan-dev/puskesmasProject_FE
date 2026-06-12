import { useState, useEffect } from 'react';

/**
 * useMediaQuery Hook
 * 
 * Detects viewport breakpoints and returns boolean for each category:
 * - mobile: < 768px
 * - tablet: 768px - 1023px
 * - desktop: >= 1024px
 * 
 * Uses window.matchMedia with event listeners for responsive updates.
 * Cleans up listeners on unmount.
 * 
 * @returns {{ isMobile: boolean, isTablet: boolean, isDesktop: boolean }}
 * 
 * @example
 * const { isMobile, isTablet, isDesktop } = useMediaQuery();
 * if (isMobile) {
 *   // Render mobile layout
 * }
 */
const useMediaQuery = () => {
  // Define breakpoint queries
  const mobileQuery = '(max-width: 767px)';
  const tabletQuery = '(min-width: 768px) and (max-width: 1023px)';
  const desktopQuery = '(min-width: 1024px)';

  // Initialize state with current matches
  const [breakpoints, setBreakpoints] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    // Create MediaQueryList objects
    const mobileMediaQuery = window.matchMedia(mobileQuery);
    const tabletMediaQuery = window.matchMedia(tabletQuery);
    const desktopMediaQuery = window.matchMedia(desktopQuery);

    // Update state based on current matches
    const updateBreakpoints = () => {
      setBreakpoints({
        isMobile: mobileMediaQuery.matches,
        isTablet: tabletMediaQuery.matches,
        isDesktop: desktopMediaQuery.matches,
      });
    };

    // Set initial state
    updateBreakpoints();

    // Event handler for media query changes
    const handleChange = () => {
      updateBreakpoints();
    };

    // Add event listeners
    mobileMediaQuery.addEventListener('change', handleChange);
    tabletMediaQuery.addEventListener('change', handleChange);
    desktopMediaQuery.addEventListener('change', handleChange);

    // Cleanup listeners on unmount
    return () => {
      mobileMediaQuery.removeEventListener('change', handleChange);
      tabletMediaQuery.removeEventListener('change', handleChange);
      desktopMediaQuery.removeEventListener('change', handleChange);
    };
  }, []); // Empty dependency array - only run on mount/unmount

  return breakpoints;
};

export default useMediaQuery;
