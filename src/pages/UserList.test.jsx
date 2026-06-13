import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserList from './UserList';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api', () => ({
  getUsers: vi.fn(),
  updateUserStatus: vi.fn(),
}));

import { getUsers, updateUserStatus } from '../services/api';

describe('UserList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUsers.mockResolvedValue({
      data: [
        {
          user_id: 'user-1',
          full_name: 'Faisal',
          email: 'faisal@example.com',
          role: 'USER',
          position_user: 'bidan_desa',
          status_user: 'ACTIVE',
        },
      ],
    });
    updateUserStatus.mockResolvedValue({});
    window.alert = vi.fn();
  });

  it('renders refreshed user management surfaces without leave action', async () => {
    const { container } = render(<UserList />);

    expect(await screen.findByText('Daftar Pengguna')).toBeInTheDocument();
    expect(screen.getByText('Faisal')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cuti' })).not.toBeInTheDocument();
    expect(container.querySelector('.user-list-filter-card')).toBeInTheDocument();
    expect(container.querySelector('.user-list-table')).toBeInTheDocument();
  });

  it('keeps the remaining actions working', async () => {
    render(<UserList />);

    await screen.findByText('Faisal');

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(mockNavigate).toHaveBeenCalledWith('/edit-user/user-1');

    fireEvent.click(screen.getByRole('button', { name: 'Disable' }));
    await waitFor(() => {
      expect(updateUserStatus).toHaveBeenCalledWith('user-1', 'INACTIVE');
    });
  });
});
