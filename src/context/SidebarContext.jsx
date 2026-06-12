import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'sidebar-state';

const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return { collapsed: false, expandedGroups: [] };
};

const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
};

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const location = useLocation();
  const [state, setState] = useState(getInitialState);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleCollapsed = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, collapsed: !prev.collapsed };
      saveState(newState);
      return newState;
    });
  }, []);

  const toggleGroup = useCallback((groupId) => {
    setState(prev => {
      const expandedGroups = prev.expandedGroups.includes(groupId)
        ? prev.expandedGroups.filter(id => id !== groupId)
        : [...prev.expandedGroups, groupId];
      const newState = { ...prev, expandedGroups };
      saveState(newState);
      return newState;
    });
  }, []);

  const isGroupExpanded = useCallback((groupId) => {
    return state.expandedGroups.includes(groupId);
  }, [state.expandedGroups]);

  const isActive = useCallback((path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }, [location.pathname]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <SidebarContext.Provider value={{
      collapsed: state.collapsed,
      toggleCollapsed,
      expandedGroups: state.expandedGroups,
      toggleGroup,
      isGroupExpanded,
      isActive,
      isMobile,
      mobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
