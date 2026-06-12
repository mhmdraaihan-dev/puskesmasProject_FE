import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Tooltip from '../ui/Tooltip';
import './NavItem.css';

/**
 * NavItem Component
 * 
 * Individual navigation link item in sidebar.
 * Shows icon and label when sidebar is expanded, icon-only with tooltip when collapsed.
 * Highlights active route with coral accent.
 * 
 * @component
 * @example
 * <NavItem
 *   item={{
 *     id: 'dashboard',
 *     label: 'Beranda',
 *     path: '/',
 *     icon: HomeIcon
 *   }}
 *   collapsed={false}
 * />
 */
const NavItem = ({ item, collapsed }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => 
        `nav-item ${isActive ? 'nav-item--active' : ''}`
      }
      end={item.path === '/'}
      title={collapsed ? item.label : undefined} // Native tooltip as fallback
    >
      {collapsed ? (
        // Collapsed: Show tooltip on icon
        <Tooltip content={item.label} placement="right">
          <span className="nav-item__icon">
            <Icon size={20} />
          </span>
        </Tooltip>
      ) : (
        // Expanded: Show icon + label + badge
        <>
          <span className="nav-item__icon">
            <Icon size={20} />
          </span>
          <span className="nav-item__label">{item.label}</span>
          {item.badge && (
            <span className={`nav-item__badge nav-item__badge--${item.badge.variant}`}>
              {item.badge.text}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

NavItem.propTypes = {
  /**
   * Navigation item data
   */
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    badge: PropTypes.shape({
      text: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(['primary', 'warning', 'error']).isRequired,
    }),
  }).isRequired,
  
  /**
   * Whether sidebar is collapsed
   */
  collapsed: PropTypes.bool.isRequired,
};

export default NavItem;
