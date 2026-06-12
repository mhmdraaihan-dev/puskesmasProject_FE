import React from 'react';
import PropTypes from 'prop-types';
import { Menu, X } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import './SidebarHeader.css';

/**
 * SidebarHeader Component
 * 
 * Sidebar header containing logo/title and collapse toggle button.
 * Shows full title when expanded, icon-only when collapsed.
 * 
 * @component
 * @example
 * <SidebarHeader
 *   collapsed={false}
 *   onToggleCollapse={() => {}}
 * />
 */
const SidebarHeader = ({ collapsed, onToggleCollapse }) => {
  return (
    <div className="sidebar-header">
      <div className="sidebar-header__brand">
        <div className="sidebar-header__logo">
          <img
            src="/logo.jpeg"
            alt="Logo Puskesmas Lebakwangi"
            className="sidebar-header__logo-image"
          />
        </div>
        {!collapsed && (
          <div className="sidebar-header__text">
            <h1 className="sidebar-header__title">Puskesmas Lebakwangi</h1>
            <p className="sidebar-header__subtitle">Portal layanan kesehatan</p>
          </div>
        )}
      </div>

      {/* Toggle button - only show on desktop */}
      <div className="sidebar-header__toggle">
        {collapsed ? (
          <Tooltip content="Expand Sidebar" placement="right">
            <button
              onClick={onToggleCollapse}
              className="sidebar-header__toggle-btn"
              aria-label="Expand sidebar"
              aria-expanded="false"
              type="button"
            >
              <Menu size={20} />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="sidebar-header__toggle-btn"
            aria-label="Collapse sidebar"
            aria-expanded="true"
            type="button"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

SidebarHeader.propTypes = {
  /**
   * Whether sidebar is collapsed
   */
  collapsed: PropTypes.bool.isRequired,
  
  /**
   * Callback when collapse toggle is clicked
   */
  onToggleCollapse: PropTypes.func.isRequired,
};

export default SidebarHeader;
