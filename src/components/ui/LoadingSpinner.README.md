# LoadingSpinner Component

A reusable loading spinner component with coral primary color, size variants, and accessibility support.

## Features

- **Three size variants**: sm (24px), md (40px), lg (64px)
- **Coral primary color**: Uses design system's coral color (#cc785c)
- **Smooth animations**: CSS-based rotation and dash animations
- **Centered in container**: Flexbox centering with appropriate spacing
- **Accessibility**: ARIA labels, role attributes, and screen reader support
- **Design system compliant**: Uses CSS custom properties from design-system.css

## Installation

The LoadingSpinner component is located in `src/components/ui/LoadingSpinner.jsx` and can be imported:

```jsx
import LoadingSpinner from '@/components/ui/LoadingSpinner';
// or
import { LoadingSpinner } from '@/components/ui';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Size of the spinner |
| `label` | `string` | `'Loading...'` | Accessible label for screen readers |
| `className` | `string` | `''` | Additional CSS classes |

## Size Variants

### Small (`size="sm"`)
- **Size**: 24px × 24px
- **Use case**: Inline loading indicators, button loading states, small cards

### Medium (`size="md"`, default)
- **Size**: 40px × 40px
- **Use case**: General purpose loading, form submissions, content sections

### Large (`size="lg"`)
- **Size**: 64px × 64px
- **Use case**: Page-level loading, full-screen overlays, major data fetching

## Usage Examples

### Basic Loading Spinner
```jsx
<LoadingSpinner />
```

### Small Spinner for Inline Use
```jsx
<button disabled>
  <LoadingSpinner size="sm" label="Saving..." />
  Saving...
</button>
```

### Large Spinner for Page Loading
```jsx
<div className="page-loader">
  <LoadingSpinner size="lg" label="Loading dashboard data..." />
</div>
```

### Custom Accessible Label
```jsx
<LoadingSpinner label="Fetching user data, please wait" />
```

### With Custom ClassName
```jsx
<LoadingSpinner 
  size="md" 
  className="my-custom-spinner"
  label="Processing..."
/>
```

### In Data Table Loading State
```jsx
import { Card, LoadingSpinner } from '@/components/ui';

function DataTable({ data, loading }) {
  if (loading) {
    return (
      <Card variant="surface-dark" padding="xl" rounded="lg">
        <LoadingSpinner label="Loading table data..." />
      </Card>
    );
  }
  
  return (
    <Card variant="surface-dark">
      <table>{/* table content */}</table>
    </Card>
  );
}
```

### In Form Submission
```jsx
function UserForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" label="Submitting form..." />
            Submitting...
          </>
        ) : (
          'Submit'
        )}
      </button>
    </form>
  );
}
```

## Container Behavior

The LoadingSpinner automatically centers itself in its container:
- Uses flexbox with `align-items: center` and `justify-content: center`
- Default minimum height: 100px
- Full width: 100%

This ensures consistent centering without additional wrapper styles.

## Design System Integration

The LoadingSpinner component uses CSS custom properties from `design-system.css`:

- **Color**: `--color-primary` (#cc785c) for the spinner stroke
- **Animation**: Smooth 1s rotation with easing dash animation

## Accessibility

### ARIA Attributes
- **role="status"**: Indicates the container is a status region
- **aria-live="polite"**: Announces loading state changes to screen readers
- **aria-label**: Provides descriptive label on the spinner element

### Screen Reader Support
- Hidden text with `.sr-only` class provides context
- Custom labels allow descriptive loading messages
- Polite announcement doesn't interrupt user

### Best Practices
```jsx
// Good: Descriptive label
<LoadingSpinner label="Loading patient records from database" />

// Good: Context-specific label
<LoadingSpinner label="Saving changes to user profile" />

// Avoid: Generic label when context is unclear
<LoadingSpinner label="Loading..." /> // Only use for general cases
```

## Animation Details

### Rotation Animation
- **Duration**: 1 second
- **Timing**: Linear, infinite
- **Effect**: Continuous 360° rotation

### Dash Animation
- **Duration**: 1.5 seconds
- **Timing**: Ease-in-out, infinite
- **Effect**: Stroke dash expands and contracts smoothly

The combination creates a polished, professional loading indicator that matches the design system's warm editorial aesthetic.

## Testing

The component includes comprehensive unit tests covering:
- Default rendering with correct structure
- All size variants (sm, md, lg)
- ARIA attributes and accessibility
- Screen reader labels
- Custom className application
- SVG rendering with correct attributes

Run tests with:
```bash
npm test -- src/components/ui/LoadingSpinner.test.jsx
```

## Requirements Addressed

This component fulfills the following requirements from the UI Refactor spec:

- **Requirement 2.1**: Uses coral primary color (#cc785c) for spinner
- **Requirement 2.2**: Supports size variants matching design system
- **Requirement 5.9**: Provides loading state with appropriate aria-label
- **Requirement 11.6**: Provides aria-live regions for dynamic content updates

## Files

- `LoadingSpinner.jsx` - Main component implementation
- `LoadingSpinner.css` - Component styles with animations
- `LoadingSpinner.test.jsx` - Unit tests (13 tests)
- `LoadingSpinner.README.md` - This documentation file

## Browser Support

Works in all modern browsers supporting:
- CSS custom properties
- CSS animations
- SVG rendering
- Flexbox

Tested on:
- Chrome/Edge 88+
- Firefox 89+
- Safari 14+

## Performance

- **Lightweight**: Minimal DOM elements (1 container + 1 spinner div + 1 SVG)
- **CSS animations**: Hardware-accelerated, smooth 60fps
- **No JavaScript animations**: Reduces CPU usage
- **Small bundle size**: ~1KB minified

## Common Patterns

### Conditional Rendering
```jsx
{loading ? <LoadingSpinner /> : <DataContent data={data} />}
```

### With Error Handling
```jsx
{loading && <LoadingSpinner label="Loading data..." />}
{error && <ErrorMessage message={error} />}
{data && <DataDisplay data={data} />}
```

### Overlay Loading
```jsx
<div style={{ position: 'relative', minHeight: '200px' }}>
  {loading && (
    <div style={{ 
      position: 'absolute', 
      inset: 0, 
      background: 'rgba(250, 249, 245, 0.9)',
      zIndex: 10 
    }}>
      <LoadingSpinner label="Refreshing content..." />
    </div>
  )}
  <ContentArea />
</div>
```
