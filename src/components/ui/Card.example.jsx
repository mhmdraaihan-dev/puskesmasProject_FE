import React from 'react';
import Card from './Card';

/**
 * Card Component Usage Examples
 * 
 * This file demonstrates various ways to use the Card component
 * following the design system specifications.
 */

// Example 1: Canvas variant (default) - Main content container
export const CanvasCardExample = () => (
  <Card variant="canvas" padding="xl" rounded="lg">
    <h2 className="text-display-md">Dashboard Overview</h2>
    <p className="text-body-md">
      This is a canvas card with cream background (#faf9f5), 
      perfect for main content areas.
    </p>
  </Card>
);

// Example 2: Surface-card variant - Feature cards, elevated content
export const SurfaceCardExample = () => (
  <Card variant="surface-card" padding="lg" rounded="md">
    <h3 className="text-title-lg">Statistics Card</h3>
    <div className="text-display-lg">1,234</div>
    <p className="text-body-sm text-muted">Total Patients</p>
  </Card>
);

// Example 3: Surface-dark variant - Data tables, dark themed containers
export const SurfaceDarkExample = () => (
  <Card variant="surface-dark" padding="lg" rounded="lg">
    <h3 className="text-title-md" style={{ color: 'var(--color-on-dark)' }}>
      User List
    </h3>
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>John Doe</td>
          <td>john@example.com</td>
          <td>Admin</td>
        </tr>
      </tbody>
    </table>
  </Card>
);

// Example 4: Different padding sizes
export const PaddingSizesExample = () => (
  <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
    <Card padding="sm">
      <p className="text-body-sm">Small padding (12px)</p>
    </Card>
    <Card padding="md">
      <p className="text-body-sm">Medium padding (16px)</p>
    </Card>
    <Card padding="lg">
      <p className="text-body-sm">Large padding (24px)</p>
    </Card>
    <Card padding="xl">
      <p className="text-body-sm">Extra large padding (32px) - default</p>
    </Card>
  </div>
);

// Example 5: Different border radius sizes
export const BorderRadiusExample = () => (
  <div style={{ display: 'flex', gap: '16px' }}>
    <Card rounded="sm" padding="md">
      <p className="text-body-sm">Small radius (6px)</p>
    </Card>
    <Card rounded="md" padding="md">
      <p className="text-body-sm">Medium radius (8px)</p>
    </Card>
    <Card rounded="lg" padding="md">
      <p className="text-body-sm">Large radius (12px) - default</p>
    </Card>
    <Card rounded="xl" padding="md">
      <p className="text-body-sm">Extra large radius (16px)</p>
    </Card>
  </div>
);

// Example 6: Nested cards
export const NestedCardsExample = () => (
  <Card variant="canvas" padding="xl" rounded="lg">
    <h2 className="text-display-md">Dashboard</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
      <Card variant="surface-card" padding="lg" rounded="md">
        <h3 className="text-title-sm">Pending</h3>
        <p className="text-display-lg">45</p>
      </Card>
      <Card variant="surface-card" padding="lg" rounded="md">
        <h3 className="text-title-sm">Approved</h3>
        <p className="text-display-lg">128</p>
      </Card>
      <Card variant="surface-card" padding="lg" rounded="md">
        <h3 className="text-title-sm">Rejected</h3>
        <p className="text-display-lg">12</p>
      </Card>
    </div>
  </Card>
);

// Example 7: Custom className and additional props
export const CustomPropsExample = () => (
  <Card 
    variant="surface-dark" 
    padding="lg" 
    rounded="md"
    className="custom-dashboard-card"
    data-testid="dashboard-card"
    aria-label="Dashboard statistics card"
  >
    <h3 className="text-title-md" style={{ color: 'var(--color-on-dark)' }}>
      Custom Card with Props
    </h3>
    <p className="text-body-md" style={{ color: 'var(--color-on-dark)' }}>
      This card has custom className and additional HTML attributes.
    </p>
  </Card>
);

// Example 8: Responsive card for forms
export const FormCardExample = () => (
  <Card variant="surface-dark" padding="xl" rounded="lg">
    <h2 className="text-display-md" style={{ color: 'var(--color-on-dark)', marginBottom: '24px' }}>
      Add New Patient
    </h2>
    <form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input 
          type="text" 
          placeholder="Full Name" 
          className="input"
        />
        <input 
          type="email" 
          placeholder="Email" 
          className="input"
        />
        <button type="submit" className="btn-primary">
          Submit
        </button>
      </div>
    </form>
  </Card>
);
