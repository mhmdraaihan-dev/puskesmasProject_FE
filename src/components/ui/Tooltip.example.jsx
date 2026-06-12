/**
 * Tooltip Component Usage Examples
 * 
 * Demonstrates various use cases for the Tooltip component,
 * particularly for collapsed sidebar icons.
 */

import React from 'react';
import Tooltip from './Tooltip';
import './Tooltip.css';

// Mock icons for demonstration
const HomeIcon = () => <span style={{ fontSize: '24px' }}>🏠</span>;
const UserIcon = () => <span style={{ fontSize: '24px' }}>👤</span>;
const SettingsIcon = () => <span style={{ fontSize: '24px' }}>⚙️</span>;
const PlusIcon = () => <span style={{ fontSize: '24px' }}>➕</span>;

const TooltipExamples = () => {
  return (
    <div style={{ 
      padding: '100px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '80px',
      background: 'var(--color-canvas)',
      minHeight: '100vh'
    }}>
      <div>
        <h2 className="text-display-md text-ink" style={{ marginBottom: '32px' }}>
          Tooltip Examples
        </h2>
        <p className="text-body-md text-body" style={{ marginBottom: '48px' }}>
          Hover over or focus on the icons to see tooltips in different placements.
        </p>
      </div>

      {/* Example 1: Default top placement */}
      <div>
        <h3 className="text-title-md text-ink" style={{ marginBottom: '16px' }}>
          Top Placement (Default)
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '24px',
          padding: '24px',
          background: 'var(--color-surface-dark)',
          borderRadius: 'var(--rounded-lg)',
          width: 'fit-content'
        }}>
          <Tooltip content="Home">
            <button 
              style={{ 
                width: '48px', 
                height: '48px', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--rounded-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Home"
            >
              <HomeIcon />
            </button>
          </Tooltip>

          <Tooltip content="Users">
            <button 
              style={{ 
                width: '48px', 
                height: '48px', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--rounded-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Users"
            >
              <UserIcon />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Example 2: Right placement for collapsed sidebar */}
      <div>
        <h3 className="text-title-md text-ink" style={{ marginBottom: '16px' }}>
          Right Placement (Collapsed Sidebar)
        </h3>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '8px',
          padding: '16px',
          background: 'var(--color-surface-dark)',
          borderRadius: 'var(--rounded-lg)',
          width: '64px'
        }}>
          <Tooltip content="Dashboard" placement="right">
            <button 
              style={{ 
                width: '48px', 
                height: '48px', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--rounded-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Dashboard"
            >
              <HomeIcon />
            </button>
          </Tooltip>

          <Tooltip content="User Management" placement="right">
            <button 
              style={{ 
                width: '48px', 
                height: '48px', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--rounded-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="User Management"
            >
              <UserIcon />
            </button>
          </Tooltip>

          <Tooltip content="Settings" placement="right">
            <button 
              style={{ 
                width: '48px', 
                height: '48px', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--rounded-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Settings"
            >
              <SettingsIcon />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Example 3: Bottom placement */}
      <div style={{ marginTop: '100px' }}>
        <h3 className="text-title-md text-ink" style={{ marginBottom: '16px' }}>
          Bottom Placement
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '24px',
          padding: '24px',
          background: 'var(--color-surface-dark)',
          borderRadius: 'var(--rounded-lg)',
          width: 'fit-content'
        }}>
          <Tooltip content="Add New Item" placement="bottom">
            <button 
              style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--color-primary)',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--rounded-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Add New Item"
            >
              <PlusIcon />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Example 4: Left placement */}
      <div>
        <h3 className="text-title-md text-ink" style={{ marginBottom: '16px' }}>
          Left Placement
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '24px',
          padding: '24px',
          background: 'var(--color-surface-dark)',
          borderRadius: 'var(--rounded-lg)',
          width: 'fit-content',
          marginLeft: '200px'
        }}>
          <Tooltip content="Settings Menu" placement="left">
            <button 
              style={{ 
                width: '48px', 
                height: '48px', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--rounded-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Settings Menu"
            >
              <SettingsIcon />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Example 5: Disabled tooltip */}
      <div>
        <h3 className="text-title-md text-ink" style={{ marginBottom: '16px' }}>
          Disabled Tooltip
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '24px',
          padding: '24px',
          background: 'var(--color-surface-dark)',
          borderRadius: 'var(--rounded-lg)',
          width: 'fit-content'
        }}>
          <Tooltip content="This tooltip is disabled" disabled={true}>
            <button 
              style={{ 
                width: '48px', 
                height: '48px', 
                background: 'transparent',
                border: 'none',
                cursor: 'not-allowed',
                borderRadius: 'var(--rounded-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.5
              }}
              aria-label="Disabled action"
              disabled
            >
              <UserIcon />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Example 6: Long content */}
      <div>
        <h3 className="text-title-md text-ink" style={{ marginBottom: '16px' }}>
          Long Content with Word Wrap
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '24px',
          padding: '24px',
          background: 'var(--color-surface-dark)',
          borderRadius: 'var(--rounded-lg)',
          width: 'fit-content'
        }}>
          <Tooltip 
            content="This is a longer tooltip content that will wrap to multiple lines when it exceeds the maximum width of 240px"
            placement="top"
          >
            <button 
              style={{ 
                width: '48px', 
                height: '48px', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--rounded-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Show long tooltip"
            >
              <HomeIcon />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Example 7: Custom delay */}
      <div>
        <h3 className="text-title-md text-ink" style={{ marginBottom: '16px' }}>
          Custom Delay (500ms)
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '24px',
          padding: '24px',
          background: 'var(--color-surface-dark)',
          borderRadius: 'var(--rounded-lg)',
          width: 'fit-content'
        }}>
          <Tooltip content="Tooltip with longer delay" delay={500}>
            <button 
              style={{ 
                width: '48px', 
                height: '48px', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--rounded-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Custom delay"
            >
              <SettingsIcon />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default TooltipExamples;
