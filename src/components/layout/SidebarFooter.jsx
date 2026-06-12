import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LogOut, User, ChevronUp } from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import './SidebarFooter.css';

/**
 * SidebarFooter Component
 * 
 * Footer section with user info and logout button.
 * Shows user menu when expanded, icon-only when collapsed.
 * 
 * @component
 * @example
 * <SidebarFooter
 *   user={{
 *     full_name: 'John Doe',
 *     email: 'john@example.com',
 *     position_user: 'bidan_desa'
 *   }}
 *   collapsed={false}
 *   onLogout={() => {}}
 * />
 */
const SidebarFooter = ({ user, collapsed, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getRoleLabel = (role, position) => {
    if (role === 'ADMIN') return 'Administrator';
    if (position === 'bidan_koordinator') return 'Bidan Koordinator';
    if (position === 'bidan_desa') return 'Bidan Desa';
    if (position === 'bidan_praktik') return 'Bidan Praktik';
    return 'User';
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  if (!user) {
    return null;
  }

  // Collapsed view: icon button with tooltip
  if (collapsed) {
    return (
      <div className="sidebar-footer sidebar-footer--collapsed">
        <Tooltip content={`${user.full_name} - ${getRoleLabel(user.role, user.position_user)}`} placement="right">
          <button
            onClick={handleLogout}
            className="sidebar-footer__logout-icon"
            aria-label="Logout"
            type="button"
          >
            <LogOut size={20} />
          </button>
        </Tooltip>
      </div>
    );
  }

  // Expanded view: full user menu
  return (
    <div className="sidebar-footer">
      <div className={`sidebar-footer__user ${menuOpen ? 'sidebar-footer__user--open' : ''}`}>
        <button
          onClick={toggleMenu}
          className="sidebar-footer__user-btn"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          type="button"
        >
          <div className="sidebar-footer__avatar">
            <User size={16} />
          </div>
          <div className="sidebar-footer__user-info">
            <p className="sidebar-footer__user-name">{user.full_name}</p>
            <p className="sidebar-footer__user-role">
              {getRoleLabel(user.role, user.position_user)}
            </p>
          </div>
          <ChevronUp size={16} className="sidebar-footer__chevron" />
        </button>

        {menuOpen && (
          <div className="sidebar-footer__menu">
            <button
              onClick={handleLogout}
              className="sidebar-footer__menu-item"
              type="button"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

SidebarFooter.propTypes = {
  /**
   * Current user object
   */
  user: PropTypes.shape({
    full_name: PropTypes.string.isRequired,
    email: PropTypes.string,
    role: PropTypes.string.isRequired,
    position_user: PropTypes.string,
  }),
  
  /**
   * Whether sidebar is collapsed
   */
  collapsed: PropTypes.bool.isRequired,
  
  /**
   * Callback when logout is clicked
   */
  onLogout: PropTypes.func.isRequired,
};

export default SidebarFooter;
