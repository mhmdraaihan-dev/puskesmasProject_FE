/**
 * Tooltip Component Tests
 * 
 * Unit tests for the Tooltip component ensuring proper rendering,
 * positioning, and interaction behaviors.
 * 
 * **Validates: Requirements 1.5, 2.1, 2.2, 11.5**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tooltip from './Tooltip';

describe('Tooltip Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders trigger element without tooltip initially', () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByRole('button', { name: /hover me/i })).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', async () => {
    render(
      <Tooltip content="Help text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    
    // Tooltip should not appear immediately
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    
    // Fast-forward time past delay
    vi.advanceTimersByTime(200);
    
    // Tooltip should now be visible
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });
  });

  it('hides tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Help text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    fireEvent.mouseLeave(trigger);
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('cancels tooltip display if mouse leaves before delay', async () => {
    render(
      <Tooltip content="Help text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    
    // Leave before delay completes
    vi.advanceTimersByTime(100);
    fireEvent.mouseLeave(trigger);
    
    // Fast-forward remaining time
    vi.advanceTimersByTime(200);
    
    // Tooltip should not appear
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus for keyboard accessibility', async () => {
    render(
      <Tooltip content="Help text" delay={200}>
        <button>Focus me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.focus(trigger);
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('hides tooltip on blur for keyboard accessibility', async () => {
    render(
      <Tooltip content="Help text" delay={200}>
        <button>Focus me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.focus(trigger);
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    fireEvent.blur(trigger);
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('does not show tooltip when disabled', async () => {
    render(
      <Tooltip content="Help text" disabled={true} delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    vi.advanceTimersByTime(200);
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not show tooltip when content is empty', async () => {
    render(
      <Tooltip content="" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    vi.advanceTimersByTime(200);
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies correct placement class for top placement', async () => {
    render(
      <Tooltip content="Help text" placement="top" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('tooltip--top');
    });
  });

  it('applies correct placement class for right placement', async () => {
    render(
      <Tooltip content="Help text" placement="right" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('tooltip--right');
    });
  });

  it('applies correct placement class for bottom placement', async () => {
    render(
      <Tooltip content="Help text" placement="bottom" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('tooltip--bottom');
    });
  });

  it('applies correct placement class for left placement', async () => {
    render(
      <Tooltip content="Help text" placement="left" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('tooltip--left');
    });
  });

  it('includes aria-live attribute for accessibility', async () => {
    render(
      <Tooltip content="Help text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('applies custom className when provided', async () => {
    render(
      <Tooltip content="Help text" className="custom-tooltip" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('custom-tooltip');
    });
  });

  it('renders tooltip with fixed positioning', async () => {
    render(
      <Tooltip content="Help text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveStyle({ position: 'fixed' });
    });
  });

  it('renders arrow element inside tooltip', async () => {
    render(
      <Tooltip content="Help text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      const arrow = tooltip.querySelector('.tooltip__arrow');
      expect(arrow).toBeInTheDocument();
    });
  });

  it('uses default delay of 200ms when not specified', async () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    
    // Should not appear before delay
    vi.advanceTimersByTime(100);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    
    // Should appear after default delay
    vi.advanceTimersByTime(100);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('respects custom delay value', async () => {
    render(
      <Tooltip content="Help text" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    
    fireEvent.mouseEnter(trigger);
    
    // Should not appear before custom delay
    vi.advanceTimersByTime(200);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    
    // Should appear after custom delay
    vi.advanceTimersByTime(300);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });
});
