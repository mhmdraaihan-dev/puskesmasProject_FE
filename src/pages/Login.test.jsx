import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Login from './Login';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the simplified login layout without signup or showcase copy', () => {
    const { container } = render(<Login />);

    expect(screen.getByRole('heading', { name: 'Masuk' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument();
    expect(screen.queryByText('Portal Internal Puskesmas')).not.toBeInTheDocument();
    expect(screen.queryByText(/Daftar di sini/i)).not.toBeInTheDocument();
    expect(container.querySelector('.login-shell--single')).toBeInTheDocument();
  });
});
