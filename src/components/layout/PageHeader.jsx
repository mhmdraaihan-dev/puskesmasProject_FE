import React from 'react';
import PropTypes from 'prop-types';
import './PageHeader.css';

/**
 * PageHeader Component
 * 
 * Header section for page content with title and optional action buttons.
 * Uses serif font for h1 headlines following design system.
 * 
 * @component
 * @example
 * // Simple header with title only
 * <PageHeader title="Daftar Pengguna" />
 * 
 * @example
 * // Using heading prop (alias for title)
 * <PageHeader heading="Daftar Pengguna" />
 * 
 * @example
 * // Header with subtitle
 * <PageHeader 
 *   title="Dashboard" 
 *   subtitle="Selamat datang, Admin Puskesmas"
 * />
 * 
 * @example
 * // Header with action buttons
 * <PageHeader 
 *   title="Daftar Pasien"
 *   actions={
 *     <button className="btn-primary">
 *       Tambah Pasien
 *     </button>
 *   }
 * />
 */
const PageHeader = ({ title, heading, subtitle, actions, className = '' }) => {
  // Support both 'title' and 'heading' props (heading takes precedence)
  const displayTitle = heading || title;
  
  return (
    <header className={`page-header ${className}`}>
      <div className="page-header__content">
        <div className="page-header__text">
          <h1 className="page-header__title">{displayTitle}</h1>
          {subtitle && (
            <p className="page-header__subtitle">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="page-header__actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

PageHeader.propTypes = {
  /**
   * Page title (h1) - use either title or heading
   */
  title: PropTypes.string,
  
  /**
   * Page heading (h1) - alias for title, takes precedence if both provided
   */
  heading: PropTypes.string,
  
  /**
   * Optional subtitle text
   */
  subtitle: PropTypes.string,
  
  /**
   * Optional action buttons or elements
   */
  actions: PropTypes.node,
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
};

export default PageHeader;
