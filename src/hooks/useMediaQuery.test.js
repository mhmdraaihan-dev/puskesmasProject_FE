import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useMediaQuery from './useMediaQuery';

/**
 * Tests for useMediaQuery hook
 * Validates Requirements 8.1, 8.2, 8.3
 */
describe('useMediaQuery', () => {
  let listeners = {};

  beforeEach(() => {
    // Reset listeners
    listeners = {};

    // Mock window.matchMedia
    window.matchMedia = vi.fn((query) => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn((event, handler) => {
          if (!listeners[query]) {
            listeners[query] = [];
          }
          listeners[query].push(handler);
        }),
        removeEventListener: vi.fn((event, handler) => {
          if (listeners[query]) {
            listeners[query] = listeners[query].filter((h) => h !== handler);
          }
        }),
        dispatchEvent: vi.fn(),
      };
    });
  });

  it('should return isMobile: true for viewport < 768px', () => {
    window.matchMedia = vi.fn((query) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return isTablet: true for viewport between 768px and 1023px', () => {
    window.matchMedia = vi.fn((query) => ({
      matches: query === '(min-width: 768px) and (max-width: 1023px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return isDesktop: true for viewport >= 1024px', () => {
    window.matchMedia = vi.fn((query) => ({
      matches: query === '(min-width: 1024px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should update breakpoints when viewport changes', () => {
    let mockMatches = {
      mobile: true,
      tablet: false,
      desktop: false,
    };

    window.matchMedia = vi.fn((query) => ({
      matches:
        (query === '(max-width: 767px)' && mockMatches.mobile) ||
        (query === '(min-width: 768px) and (max-width: 1023px)' &&
          mockMatches.tablet) ||
        (query === '(min-width: 1024px)' && mockMatches.desktop),
      media: query,
      addEventListener: vi.fn((event, handler) => {
        if (!listeners[query]) {
          listeners[query] = [];
        }
        listeners[query].push(handler);
      }),
      removeEventListener: vi.fn(),
    }));

    const { result, rerender } = renderHook(() => useMediaQuery());

    // Initially mobile
    expect(result.current.isMobile).toBe(true);

    // Simulate viewport change to desktop
    act(() => {
      mockMatches = { mobile: false, tablet: false, desktop: true };
      listeners['(max-width: 767px)']?.forEach((handler) => handler());
      listeners['(min-width: 1024px)']?.forEach((handler) => handler());
    });

    rerender();
    expect(result.current.isDesktop).toBe(true);
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerMock = vi.fn();

    window.matchMedia = vi.fn(() => ({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerMock,
    }));

    const { unmount } = renderHook(() => useMediaQuery());

    unmount();

    // Should have called removeEventListener for each media query (3 times)
    expect(removeEventListenerMock).toHaveBeenCalledTimes(3);
  });

  it('should handle all breakpoints being false (edge case)', () => {
    window.matchMedia = vi.fn(() => ({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });
});
