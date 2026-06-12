import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import KBForm from './KBForm';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      role: 'USER',
      position_user: 'bidan_praktik',
    },
  }),
}));

vi.mock('../../services/api', () => ({
  createKB: vi.fn(),
  getKBDetail: vi.fn(),
  getPasienList: vi.fn(),
  getPracticePlaces: vi.fn(),
  updateKB: vi.fn(),
}));

import { getPasienList, getPracticePlaces } from '../../services/api';

describe('KBForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPasienList.mockResolvedValue({ data: [] });
    getPracticePlaces.mockResolvedValue({ data: [] });
  });

  it('renders refreshed light section cards', async () => {
    const { container } = render(<KBForm />);

    expect(screen.getByText('Input Data KB')).toBeInTheDocument();
    expect(await screen.findByText('Informasi Pasien')).toBeInTheDocument();
    expect(container.querySelector('.kb-form__section-card')).toBeInTheDocument();
  });
});
