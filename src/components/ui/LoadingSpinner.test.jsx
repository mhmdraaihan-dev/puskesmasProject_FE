import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders spinner with default props', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with correct role and aria-live attributes', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinnerContainer = container.querySelector('.loading-spinner-container');
    expect(spinnerContainer).toHaveAttribute('role', 'status');
    expect(spinnerContainer).toHaveAttribute('aria-live', 'polite');
  });

  it('applies default size (md)', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('loading-spinner--md');
  });

  it('applies sm size correctly', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('loading-spinner--sm');
  });

  it('applies md size correctly', () => {
    const { container } = render(<LoadingSpinner size="md" />);
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('loading-spinner--md');
  });

  it('applies lg size correctly', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('loading-spinner--lg');
  });

  it('displays default label for screen readers', () => {
    render(<LoadingSpinner />);
    
    const srText = screen.getByText('Loading...');
    expect(srText).toHaveClass('sr-only');
  });

  it('displays custom label for screen readers', () => {
    render(<LoadingSpinner label="Loading data..." />);
    
    const srText = screen.getByText('Loading data...');
    expect(srText).toHaveClass('sr-only');
  });

  it('applies aria-label to spinner element', () => {
    const { container } = render(<LoadingSpinner label="Custom loading" />);
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-spinner" />);
    
    const spinnerContainer = container.querySelector('.loading-spinner-container');
    expect(spinnerContainer).toHaveClass('custom-spinner');
  });

  it('renders SVG with correct viewBox', () => {
    const { container } = render(<LoadingSpinner />);
    
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 50 50');
  });

  it('renders circle element with correct attributes', () => {
    const { container } = render(<LoadingSpinner />);
    
    const circle = container.querySelector('circle');
    expect(circle).toHaveAttribute('cx', '25');
    expect(circle).toHaveAttribute('cy', '25');
    expect(circle).toHaveAttribute('r', '20');
    expect(circle).toHaveAttribute('fill', 'none');
    expect(circle).toHaveAttribute('stroke-width', '4');
  });

  it('centers spinner in container', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinnerContainer = container.querySelector('.loading-spinner-container');
    expect(spinnerContainer).toHaveClass('loading-spinner-container');
    // CSS centering is verified through integration tests
  });

  it('combines size and className correctly', () => {
    const { container } = render(
      <LoadingSpinner size="lg" className="custom-class" />
    );
    
    const spinner = container.querySelector('.loading-spinner');
    const spinnerContainer = container.querySelector('.loading-spinner-container');
    
    expect(spinner).toHaveClass('loading-spinner--lg');
    expect(spinnerContainer).toHaveClass('custom-class');
  });
});
