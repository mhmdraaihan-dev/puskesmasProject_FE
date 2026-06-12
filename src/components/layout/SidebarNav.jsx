import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import NavGroup from './NavGroup';
import './SidebarNav.css';

/**
 * SidebarNav Component
 * 
 * Main navigation container that renders all navigation groups.
 * Manages expanded state for each group and persists to localStorage.
 * 
 * @component
 * @example
 * <SidebarNav
 *   navigationConfig={getNavigationForRole(user.role, user.position_user)}
 *   collapsed={false}
 * />
 */
const SidebarNav = ({ navigationConfig, collapsed }) => {
  const STORAGE_KEY = 'sidebar-expanded-groups';
  
  // Initialize expanded groups from localStorage
  const [expandedGroups, setExpandedGroups] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load expanded groups from localStorage:', error);
    }
    
    // Default: expand all groups initially
    return navigationConfig.map(group => group.id);
  });

  // Persist expanded groups to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedGroups));
    } catch (error) {
      console.error('Failed to save expanded groups to localStorage:', error);
    }
  }, [expandedGroups]);

  // When sidebar is collapsed, expand all groups
  useEffect(() => {
    if (collapsed) {
      const allGroupIds = navigationConfig.map(group => group.id);
      setExpandedGroups(allGroupIds);
    }
  }, [collapsed, navigationConfig]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  if (!navigationConfig || navigationConfig.length === 0) {
    return null;
  }

  return (
    <nav className="sidebar-nav" aria-label="Main navigation">
      {navigationConfig.map(group => (
        <NavGroup
          key={group.id}
          group={group}
          collapsed={collapsed}
          isExpanded={expandedGroups.includes(group.id)}
          onToggle={() => toggleGroup(group.id)}
        />
      ))}
    </nav>
  );
};

SidebarNav.propTypes = {
  /**
   * Navigation configuration (array of groups from getNavigationForRole)
   */
  navigationConfig: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      items: PropTypes.array.isRequired,
    })
  ).isRequired,
  
  /**
   * Whether sidebar is collapsed
   */
  collapsed: PropTypes.bool.isRequired,
};

export default SidebarNav;
