import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChangePassword from './ChangePassword';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ userId: 'user-1' }),
  };
});

vi.mock('../services/api', () => ({
  changePassword: vi.fn(),
}));

describe('ChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the refreshed change password layout', () => {
    const { container } = render(<ChangePassword />);

    expect(screen.getByText('Ubah Kata Sandi')).toBeInTheDocument();
    expect(screen.getByText('Form Kata Sandi')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Masukkan password lama')).toBeInTheDocument();
    expect(container.querySelector('.change-password-card')).toBeInTheDocument();
    expect(container.querySelector('.change-password-info-box')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ubah Password' })).toBeInTheDocument();
  });
});
