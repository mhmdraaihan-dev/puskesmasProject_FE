import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PersalinanForm from './PersalinanForm';

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
  createPersalinan: vi.fn(),
  getPasienList: vi.fn(),
  getPersalinanDetail: vi.fn(),
  getPracticePlaces: vi.fn(),
  updatePersalinan: vi.fn(),
}));

import { getPasienList, getPracticePlaces } from '../../services/api';

describe('PersalinanForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPasienList.mockResolvedValue({ data: [] });
    getPracticePlaces.mockResolvedValue({ data: [] });
  });

  it('renders refreshed light section cards', async () => {
    const { container } = render(<PersalinanForm />);

    expect(screen.getByText('Input Data Persalinan')).toBeInTheDocument();
    expect(await screen.findByText('Data Umum')).toBeInTheDocument();
    expect(container.querySelector('.persalinan-form__section-card')).toBeInTheDocument();
  });
});
