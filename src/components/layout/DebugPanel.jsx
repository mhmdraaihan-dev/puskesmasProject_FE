import React from 'react';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../context/AuthContext';

/**
 * Temporary Debug Panel - Remove after fixing sidebar
 */
const DebugPanel = () => {
  const sidebarState = useSidebar();
  const { user } = useAuth();
  
  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'white',
      border: '2px solid red',
      padding: '10px',
      zIndex: 99999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4>Debug Info:</h4>
      <p>Collapsed: {String(sidebarState?.collapsed)}</p>
      <p>Is Mobile: {String(sidebarState?.isMobile)}</p>
      <p>User Role: {user?.role}</p>
      <p>User Position: {user?.position_user}</p>
      <button 
        onClick={() => sidebarState?.toggleCollapsed()}
        style={{
          background: 'blue',
          color: 'white',
          padding: '5px 10px',
          border: 'none',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Toggle Sidebar (Test)
      </button>
    </div>
  );
};

export default DebugPanel;
