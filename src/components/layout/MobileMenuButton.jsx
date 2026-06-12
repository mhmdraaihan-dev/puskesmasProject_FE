import React from 'react';
import { Menu } from 'lucide-react';
import { useSidebar } from '../../hooks/useSidebar';
import './MobileMenuButton.css';

/**
 * MobileMenuButton Component
 * 
 * Hamburger menu button for mobile devices.
 * Only visible on screens < 768px.
 * 
 * @component
 */
const MobileMenuButton = () => {
  const { toggleMobileMenu, isMobile } = useSidebar();

  if (!isMobile) {
    return null;
  }

  return (
    <button
      onClick={toggleMobileMenu}
      className="mobile-menu-btn"
      aria-label="Open menu"
      type="button"
    >
      <Menu size={24} />
    </button>
  );
};

export default MobileMenuButton;
