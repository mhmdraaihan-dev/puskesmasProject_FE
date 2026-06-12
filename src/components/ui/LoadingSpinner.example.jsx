import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';

/**
 * LoadingSpinner Component Usage Examples
 * 
 * This file demonstrates various ways to use the LoadingSpinner component
 * following the design system specifications.
 */

// Example 1: Default spinner (medium size)
export const DefaultSpinnerExample = () => (
  <div>
    <h3>Default Spinner</h3>
    <LoadingSpinner />
  </div>
);

// Example 2: All size variants
export const SizeVariantsExample = () => (
  <div style={{ display: 'flex', gap: '32px', alignItems: 'center', padding: '24px' }}>
    <div style={{ textAlign: 'center' }}>
      <p className="text-body-sm" style={{ marginBottom: '16px' }}>Small (24px)</p>
      <LoadingSpinner size="sm" />
    </div>
    <div style={{ textAlign: 'center' }}>
      <p className="text-body-sm" style={{ marginBottom: '16px' }}>Medium (40px)</p>
      <LoadingSpinner size="md" />
    </div>
    <div style={{ textAlign: 'center' }}>
      <p className="text-body-sm" style={{ marginBottom: '16px' }}>Large (64px)</p>
      <LoadingSpinner size="lg" />
    </div>
  </div>
);

// Example 3: Loading state in data table
export const TableLoadingExample = () => {
  const [loading] = useState(true);
  
  return (
    <Card variant="surface-dark" padding="lg" rounded="lg">
      <h3 className="text-title-md" style={{ color: 'var(--color-on-dark)', marginBottom: '16px' }}>
        User List
      </h3>
      {loading ? (
        <LoadingSpinner label="Loading user data..." />
      ) : (
        <table className="table">
          {/* table content */}
        </table>
      )}
    </Card>
  );
};

// Example 4: Button loading state
export const ButtonLoadingExample = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 2000);
  };
  
  return (
    <button 
      onClick={handleSubmit}
      disabled={isSubmitting}
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      {isSubmitting && <LoadingSpinner size="sm" label="Submitting form..." />}
      {isSubmitting ? 'Submitting...' : 'Submit Form'}
    </button>
  );
};

// Example 5: Page-level loading
export const PageLoadingExample = () => (
  <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <LoadingSpinner size="lg" label="Loading dashboard data, please wait..." />
  </div>
);

// Example 6: Loading with custom label
export const CustomLabelExample = () => (
  <div>
    <h3>Custom Accessible Label</h3>
    <LoadingSpinner label="Fetching patient records from database..." />
  </div>
);

// Example 7: Inline loading indicator
export const InlineLoadingExample = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <LoadingSpinner size="sm" label="Saving changes..." />
    <span className="text-body-md text-muted">Saving your changes...</span>
  </div>
);

// Example 8: Loading overlay
export const OverlayLoadingExample = () => {
  const [loading] = useState(true);
  
  return (
    <div style={{ position: 'relative', minHeight: '200px', padding: '24px' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(250, 249, 245, 0.9)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LoadingSpinner label="Refreshing content..." />
        </div>
      )}
      <Card>
        <h3>Content Area</h3>
        <p>This content is covered by loading overlay</p>
      </Card>
    </div>
  );
};

// Example 9: Multiple loading states
export const MultipleLoadingExample = () => {
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card variant="surface-card" padding="lg" rounded="md">
        <h3 className="text-title-sm">Statistics</h3>
        {loadingStats ? (
          <LoadingSpinner size="sm" label="Loading statistics..." />
        ) : (
          <p className="text-display-lg">1,234</p>
        )}
      </Card>
      
      <Card variant="surface-dark" padding="lg" rounded="lg">
        <h3 className="text-title-md" style={{ color: 'var(--color-on-dark)' }}>
          Data Table
        </h3>
        {loadingTable ? (
          <LoadingSpinner label="Loading table data..." />
        ) : (
          <div>Table content here</div>
        )}
      </Card>
    </div>
  );
};

// Example 10: Conditional loading with error handling
export const ConditionalLoadingExample = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  return (
    <Card variant="canvas" padding="xl" rounded="lg">
      <h2 className="text-display-md">Data Display</h2>
      
      {loading && <LoadingSpinner label="Loading data..." />}
      
      {error && (
        <div style={{ color: 'var(--color-danger)', padding: '16px' }}>
          <p>Error: {error}</p>
          <button onClick={() => setLoading(true)}>Retry</button>
        </div>
      )}
      
      {data && (
        <div>
          <p>Data loaded successfully!</p>
        </div>
      )}
    </Card>
  );
};

// Example 11: Form submission loading
export const FormSubmissionExample = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => setIsSubmitting(false), 2000);
  };
  
  return (
    <Card variant="surface-dark" padding="xl" rounded="lg">
      <h2 className="text-display-md" style={{ color: 'var(--color-on-dark)' }}>
        Add New User
      </h2>
      <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email" required />
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px' 
            }}
          >
            {isSubmitting && <LoadingSpinner size="sm" label="Creating user..." />}
            {isSubmitting ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </Card>
  );
};

// Example 12: Custom className usage
export const CustomClassExample = () => (
  <div>
    <h3>Custom Styled Spinner</h3>
    <LoadingSpinner 
      size="md" 
      className="my-custom-spinner"
      label="Processing..."
    />
    <style>{`
      .my-custom-spinner {
        background: var(--color-canvas-card);
        border-radius: 12px;
        padding: 24px;
      }
    `}</style>
  </div>
);
