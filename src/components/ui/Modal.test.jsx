import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Modal from './Modal';

describe('Modal Component', () => {
  let mockOnClose;
  let mockOnConfirm;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnConfirm = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <Modal
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Modal"
          message="Test message"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render modal with correct title and message when isOpen is true', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Delete Confirmation"
          message="Are you sure you want to delete this item?"
        />
      );

      expect(screen.getByText('Delete Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    });

    it('should render default button texts when not provided', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('should render custom button texts when provided', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
          confirmText="Delete"
          cancelText="Back"
        />
      );

      expect(screen.getByText('Back')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should show "Processing..." text when isProcessing is true', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
          confirmText="Submit"
          isProcessing={true}
        />
      );

      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });
  });

  describe('Button Types', () => {
    it('should apply danger class for danger type', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
          type="danger"
        />
      );

      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('modal-btn-danger');
    });

    it('should apply success class for success type', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
          type="success"
        />
      );

      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('modal-btn-success');
    });

    it('should apply warning class for warning type', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
          type="warning"
        />
      );

      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('modal-btn-warning');
    });

    it('should use default primary class for info type', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
          type="info"
        />
      );

      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('modal-btn-primary');
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm when confirm button is clicked', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );

      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking inside modal content', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );

      const modalContent = screen.getByText('Test').closest('.modal');
      fireEvent.click(modalContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not call callbacks when buttons are disabled (isProcessing)', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
          isProcessing={true}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      const confirmButton = screen.getByText('Processing...');

      fireEvent.click(cancelButton);
      fireEvent.click(confirmButton);

      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should call onClose when Escape key is pressed', async () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should not close on Escape when isProcessing is true', async () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
          isProcessing={true}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });

    it('should not close on backdrop click when isProcessing is true', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
          isProcessing={true}
        />
      );

      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Modal"
          message="Test message"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
    });

    it('should have correct id attributes for title and description', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Modal"
          message="Test message"
        />
      );

      const title = screen.getByText('Test Modal');
      const message = screen.getByText('Test message');

      expect(title).toHaveAttribute('id', 'modal-title');
      expect(message).toHaveAttribute('id', 'modal-description');
    });

    it('should have type="button" on all buttons', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Design System Styling', () => {
    it('should apply correct CSS classes for backdrop and modal', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );

      const backdrop = screen.getByRole('dialog');
      expect(backdrop).toHaveClass('modal-backdrop');

      const modal = backdrop.querySelector('.modal');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('modal');
    });

    it('should apply correct classes to buttons', () => {
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );

      const cancelButton = screen.getByText('Cancel');
      const confirmButton = screen.getByText('Confirm');

      expect(cancelButton).toHaveClass('modal-btn', 'modal-btn-secondary');
      expect(confirmButton).toHaveClass('modal-btn', 'modal-btn-primary');
    });
  });

  describe('Body Scroll Lock', () => {
    it('should prevent body scroll when modal is open', () => {
      const { rerender } = render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );

      expect(document.body.style.overflow).toBe('');
    });
  });
});
