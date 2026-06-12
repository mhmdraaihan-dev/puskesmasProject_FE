# Card Component

A reusable container component for grouping related content with design system surface variants.

## Features

- **Three visual variants**: canvas, surface-card, surface-dark
- **Four padding sizes**: sm (12px), md (16px), lg (24px), xl (32px)
- **Four border radius options**: sm (6px), md (8px), lg (12px), xl (16px)
- **Responsive design**: Automatically reduces padding on mobile devices
- **Accessibility**: Supports all standard HTML attributes and ARIA labels
- **Design system compliant**: Uses CSS custom properties from design-system.css

## Installation

The Card component is located in `src/components/ui/Card.jsx` and can be imported:

```jsx
import Card from '@/components/ui/Card';
// or
import { Card } from '@/components/ui';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'canvas'` \| `'surface-card'` \| `'surface-dark'` | `'canvas'` | Background color variant |
| `padding` | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` | `'xl'` | Internal padding size |
| `rounded` | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` | `'lg'` | Border radius size |
| `children` | `ReactNode` | - | Card content (required) |
| `className` | `string` | `''` | Additional CSS classes |
| `...rest` | - | - | All other HTML div attributes |

## Variants

### Canvas (`variant="canvas"`)
- **Background**: Cream (#faf9f5)
- **Text**: Dark ink (#141413)
- **Use case**: Main content containers, default cards

### Surface Card (`variant="surface-card"`)
- **Background**: Elevated surface (#efe9de)
- **Text**: Dark ink (#141413)
- **Use case**: Feature cards, statistics cards, elevated content sections

### Surface Dark (`variant="surface-dark"`)
- **Background**: Dark navy (#181715)
- **Text**: Cream (#faf9f5)
- **Use case**: Data tables, sidebar content, dark-themed containers

## Usage Examples

### Basic Canvas Card
```jsx
<Card>
  <h2>Dashboard Overview</h2>
  <p>Welcome to your dashboard</p>
</Card>
```

### Statistics Card with Surface-Card Variant
```jsx
<Card variant="surface-card" padding="lg" rounded="md">
  <h3 className="text-title-lg">Total Patients</h3>
  <div className="text-display-lg">1,234</div>
  <p className="text-body-sm text-muted">Active records</p>
</Card>
```

### Dark Data Table Container
```jsx
<Card variant="surface-dark" padding="lg" rounded="lg">
  <h3 style={{ color: 'var(--color-on-dark)' }}>User List</h3>
  <table className="table">
    {/* table content */}
  </table>
</Card>
```

### Custom Padding and Border Radius
```jsx
<Card padding="md" rounded="sm">
  <p>Compact card with small corners</p>
</Card>
```

### With Custom ClassName and Props
```jsx
<Card 
  variant="surface-dark" 
  className="custom-dashboard-card"
  data-testid="dashboard-card"
  aria-label="Dashboard statistics"
>
  <h3>Custom Card</h3>
</Card>
```

## Responsive Behavior

On mobile devices (viewport < 768px):
- `padding="xl"` automatically reduces to `lg` (24px)
- `padding="lg"` automatically reduces to `md` (16px)

## Design System Integration

The Card component uses CSS custom properties from `design-system.css`:

- **Colors**: `--color-canvas`, `--color-surface-card`, `--color-surface-dark`, `--color-ink`, `--color-on-dark`
- **Spacing**: `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`
- **Border Radius**: `--rounded-sm`, `--rounded-md`, `--rounded-lg`, `--rounded-xl`

## Accessibility

- Supports all standard HTML attributes (aria-*, role, data-*)
- Semantic HTML structure (div container)
- Proper color contrast ratios for all variants
- Screen reader compatible

## Testing

The component includes comprehensive unit tests covering:
- All variant combinations
- All padding sizes
- All border radius options
- Custom className application
- Additional props pass-through
- Default prop values

Run tests with:
```bash
npm test -- src/components/ui/Card.test.jsx
```

## Requirements Addressed

This component fulfills the following requirements from the UI Refactor spec:

- **Requirement 2.1**: Uses cream canvas (#faf9f5) as base background
- **Requirement 2.2**: Uses coral primary (#cc785c) and dark navy (#181715) surfaces
- **Requirement 2.6**: Uses surface-card (#efe9de) for feature cards
- **Requirement 9.5**: Provides Card component supporting surface variants
- **Requirement 9.6**: Applies 12px border radius and configurable padding

## Files

- `Card.jsx` - Main component implementation
- `Card.css` - Component styles with design system tokens
- `Card.test.jsx` - Unit tests (18 tests, all passing)
- `Card.example.jsx` - Usage examples
- `Card.README.md` - This documentation file

## Browser Support

Works in all modern browsers supporting CSS custom properties:
- Chrome/Edge 88+
- Firefox 89+
- Safari 14+
