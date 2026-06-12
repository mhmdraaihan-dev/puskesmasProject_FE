import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card Component', () => {
  it('renders children content', () => {
    render(
      <Card>
        <p>Test content</p>
      </Card>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default variant (canvas)', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--canvas');
  });

  it('applies canvas variant correctly', () => {
    const { container } = render(
      <Card variant="canvas">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--canvas');
  });

  it('applies surface-card variant correctly', () => {
    const { container } = render(
      <Card variant="surface-card">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--surface-card');
  });

  it('applies surface-dark variant correctly', () => {
    const { container } = render(
      <Card variant="surface-dark">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--surface-dark');
  });

  it('applies default padding (xl)', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--padding-xl');
  });

  it('applies sm padding correctly', () => {
    const { container } = render(
      <Card padding="sm">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--padding-sm');
  });

  it('applies md padding correctly', () => {
    const { container } = render(
      <Card padding="md">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--padding-md');
  });

  it('applies lg padding correctly', () => {
    const { container } = render(
      <Card padding="lg">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--padding-lg');
  });

  it('applies xl padding correctly', () => {
    const { container } = render(
      <Card padding="xl">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--padding-xl');
  });

  it('applies default rounded (lg)', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--rounded-lg');
  });

  it('applies sm rounded correctly', () => {
    const { container } = render(
      <Card rounded="sm">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--rounded-sm');
  });

  it('applies md rounded correctly', () => {
    const { container } = render(
      <Card rounded="md">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--rounded-md');
  });

  it('applies lg rounded correctly', () => {
    const { container } = render(
      <Card rounded="lg">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--rounded-lg');
  });

  it('applies xl rounded correctly', () => {
    const { container } = render(
      <Card rounded="xl">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card--rounded-xl');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('applies multiple classes correctly', () => {
    const { container } = render(
      <Card variant="surface-dark" padding="md" rounded="sm" className="custom">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('card');
    expect(card).toHaveClass('card--surface-dark');
    expect(card).toHaveClass('card--padding-md');
    expect(card).toHaveClass('card--rounded-sm');
    expect(card).toHaveClass('custom');
  });

  it('passes additional props to the div element', () => {
    const { container } = render(
      <Card data-testid="custom-card" aria-label="Test card">
        <p>Content</p>
      </Card>
    );
    
    const card = container.firstChild;
    expect(card).toHaveAttribute('data-testid', 'custom-card');
    expect(card).toHaveAttribute('aria-label', 'Test card');
  });
});
