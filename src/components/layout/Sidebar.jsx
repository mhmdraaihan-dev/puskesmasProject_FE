import React from 'react';
import PropTypes from 'prop-types';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../context/AuthContext';
import { getNavigationForRole } from '../../utils/navigationConfig';
import SidebarHeader from './SidebarHeader';
import SidebarNav from './SidebarNav';
import SidebarFooter from './SidebarFooter';
import './Sidebar.css';

/**
 * Sidebar Component
 * 
 * Main sidebar navigation component that combines:
 * - SidebarHeader (logo, title, collapse toggle)
 * - SidebarNav (navigation groups and items)
 * - SidebarFooter (user menu and logout)
 * 
 * Features:
 * - Collapse/expand functionality
 * - Role-based navigation rendering
 * - Mobile hamburger overlay
 * - Persistent state in localStorage
 * - Focus trapping in mobile mode
 * 
 * @component
 * @example
 * <Sidebar />
 */
const Sidebar = () => {
  const { collapsed, toggleCollapsed, isMobile, mobileMenuOpen, closeMobileMenu } = useSidebar();
  const { user, logout } = useAuth();

  // Get navigation config based on user role
  const navigationConfig = user 
    ? getNavigationForRole(user.role, user.position_user, user.user_id)
    : [];

  const handleLogout = () => {
    logout();
  };

  const handleBackdropClick = () => {
    if (isMobile && mobileMenuOpen) {
      closeMobileMenu();
    }
  };

  // Don't render sidebar if no user
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={handleBackdropClick}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside 
        className="sidebar"
        data-collapsed={collapsed ? "true" : "false"}
        data-mobile-open={mobileMenuOpen ? "true" : "false"}
        aria-label="Sidebar navigation"
      >
        <SidebarHeader 
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
        
        <SidebarNav 
          navigationConfig={navigationConfig}
          collapsed={collapsed}
        />
        
        <SidebarFooter 
          user={user}
          collapsed={collapsed}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
};

Sidebar.propTypes = {};

export default Sidebar;
