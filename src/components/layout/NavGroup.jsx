import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import NavItem from './NavItem';
import './NavGroup.css';

/**
 * NavGroup Component
 * 
 * Collapsible navigation group containing multiple NavItems.
 * Automatically expands when it contains the active route.
 * Persists expanded state in localStorage.
 * 
 * @component
 * @example
 * <NavGroup
 *   group={{
 *     id: 'user-management',
 *     label: 'Manajemen Pengguna',
 *     items: [...]
 *   }}
 *   collapsed={false}
 *   isExpanded={true}
 *   onToggle={() => {}}
 * />
 */
const NavGroup = ({ group, collapsed, isExpanded, onToggle }) => {
  const location = useLocation();
  const [shouldExpand, setShouldExpand] = useState(isExpanded);

  // Auto-expand if group contains active route
  useEffect(() => {
    const hasActiveRoute = group.items.some(item => {
      if (item.path === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(item.path);
    });

    if (hasActiveRoute && !isExpanded) {
      onToggle();
    }
  }, [location.pathname, group.items, isExpanded, onToggle]);

  useEffect(() => {
    setShouldExpand(isExpanded);
  }, [isExpanded]);

  const handleToggle = () => {
    onToggle();
  };

  // For groups with only one item, render without group header
  if (group.items.length === 1 && !group.label) {
    return (
      <div className="nav-group nav-group--single">
        <NavItem item={group.items[0]} collapsed={collapsed} />
      </div>
    );
  }

  return (
    <div className={`nav-group ${shouldExpand ? 'nav-group--expanded' : ''}`}>
      {!collapsed && group.label && (
        <button
          onClick={handleToggle}
          className="nav-group__header"
          aria-expanded={shouldExpand}
          type="button"
        >
          <span className="nav-group__label">{group.label}</span>
          <ChevronDown 
            size={16} 
            className="nav-group__chevron"
          />
        </button>
      )}
      
      <div className="nav-group__items">
        {group.items.map(item => (
          <NavItem 
            key={item.id} 
            item={item} 
            collapsed={collapsed}
          />
        ))}
      </div>
    </div>
  );
};

NavGroup.propTypes = {
  /**
   * Navigation group data
   */
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
    })).isRequired,
  }).isRequired,
  
  /**
   * Whether sidebar is collapsed
   */
  collapsed: PropTypes.bool.isRequired,
  
  /**
   * Whether this group is expanded
   */
  isExpanded: PropTypes.bool.isRequired,
  
  /**
   * Callback when group is toggled
   */
  onToggle: PropTypes.func.isRequired,
};

export default NavGroup;
