import React from 'react';
import PropTypes from 'prop-types';
import { useSidebar } from '../../hooks/useSidebar';
import './MainContent.css';

/**
 * MainContent Component
 * 
 * Main content area wrapper that adjusts margin based on sidebar state.
 * Uses cream canvas background from design system.
 * 
 * @component
 * @example
 * <MainContent>
 *   <PageHeader title="Dashboard" />
 *   <div>Page content here...</div>
 * </MainContent>
 */
const MainContent = ({ children, className = '' }) => {
  const { collapsed } = useSidebar();

  return (
    <main 
      className={`main-content ${collapsed ? 'main-content--expanded' : ''} ${className}`}
      id="main-content"
    >
      <div className="main-content__inner">
        {children}
      </div>
    </main>
  );
};

MainContent.propTypes = {
  /**
   * Page content
   */
  children: PropTypes.node.isRequired,
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
};

export default MainContent;
