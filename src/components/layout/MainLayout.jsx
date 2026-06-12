import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../../context/SidebarContext';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import MobileMenuButton from './MobileMenuButton';
import './MainLayout.css';

/**
 * MainLayout Component
 * 
 * Main application layout that combines Sidebar and MainContent.
 * Used as wrapper for all protected routes.
 * 
 * Features:
 * - Sidebar navigation (role-based)
 * - Main content area with cream canvas background
 * - Responsive behavior (mobile hamburger, tablet auto-collapse)
 * - Outlet for nested routes
 * 
 * @component
 * @example
 * // In App.jsx
 * <Route element={<MainLayout />}>
 *   <Route path="/" element={<Dashboard />} />
 *   <Route path="/users" element={<UserList />} />
 * </Route>
 */
const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="app-layout">
        <MobileMenuButton />
        <Sidebar />
        <MainContent>
          <Outlet />
        </MainContent>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
