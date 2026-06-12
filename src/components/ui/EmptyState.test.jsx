import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState Component', () => {
  it('renders message correctly', () => {
    render(<EmptyState message="Belum ada data" />);
    
    expect(screen.getByText('Belum ada data')).toBeInTheDocument();
  });

  it('applies muted color to message', () => {
    const { container } = render(<EmptyState message="Test message" />);
    
    const message = container.querySelector('.empty-state__message');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent('Test message');
  });

  it('does not render action button when action prop is not provided', () => {
    const { container } = render(<EmptyState message="No data" />);
    
    const actionButton = container.querySelector('.empty-state__action');
    expect(actionButton).not.toBeInTheDocument();
  });

  it('renders action button when action prop is provided', () => {
    const mockOnClick = vi.fn();
    render(
      <EmptyState 
        message="Belum ada data pasien" 
        action={{
          label: "Tambah Data Baru",
          onClick: mockOnClick
        }}
      />
    );
    
    expect(screen.getByText('Tambah Data Baru')).toBeInTheDocument();
  });

  it('calls onClick handler when action button is clicked', () => {
    const mockOnClick = vi.fn();
    render(
      <EmptyState 
        message="Belum ada data" 
        action={{
          label: "Add New",
          onClick: mockOnClick
        }}
      />
    );
    
    const button = screen.getByText('Add New');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState message="Test" className="custom-class" />
    );
    
    const emptyState = container.firstChild;
    expect(emptyState).toHaveClass('empty-state');
    expect(emptyState).toHaveClass('custom-class');
  });

  it('centers content vertically and horizontally', () => {
    const { container } = render(<EmptyState message="Centered content" />);
    
    const emptyState = container.firstChild;
    expect(emptyState).toHaveClass('empty-state');
  });

  it('applies body-md typography to message', () => {
    const { container } = render(<EmptyState message="Typography test" />);
    
    const message = container.querySelector('.empty-state__message');
    // The CSS should have font-size: 1rem (16px) and font-weight: 400
    expect(message).toHaveClass('empty-state__message');
  });

  it('renders with both message and action button', () => {
    const mockOnClick = vi.fn();
    render(
      <EmptyState 
        message="Belum ada data pemeriksaan kehamilan" 
        action={{
          label: "Tambah Data Baru",
          onClick: mockOnClick
        }}
      />
    );
    
    expect(screen.getByText('Belum ada data pemeriksaan kehamilan')).toBeInTheDocument();
    expect(screen.getByText('Tambah Data Baru')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Tambah Data Baru'));
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('action button has correct type attribute', () => {
    const mockOnClick = vi.fn();
    render(
      <EmptyState 
        message="Test" 
        action={{
          label: "Action",
          onClick: mockOnClick
        }}
      />
    );
    
    const button = screen.getByText('Action');
    expect(button).toHaveAttribute('type', 'button');
  });
});
