import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVillageById } from '../../services/api';
import RoleGuard from '../../components/RoleGuard';
import { formatDate } from '../../utils/dateFormatter';
import { getPositionLabel } from '../../utils/roleHelpers';
import '../../App.css';

const VillageDetail = () => {
    const { villageId } = useParams();
    const navigate = useNavigate();
    const [village, setVillage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchVillage();
    }, [villageId]);

    const fetchVillage = async () => {
        try {
            setLoading(true);
            const response = await getVillageById(villageId);
            setVillage(response.data);
        } catch (err) {
            setError('Gagal memuat detail desa');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error || !village) {
        return (
            <div className="dashboard">
                <div className="error-alert">
                    {error || 'Data desa tidak ditemukan'}
                </div>
                <button onClick={() => navigate('/villages')} className="btn-primary" style={{ marginTop: '1rem' }}>
                    Kembali ke Daftar Desa
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>{village.nama_desa}</h2>
                    <p className="text-muted">Detail informasi desa</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/villages')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
                        Kembali
                    </button>
                    <RoleGuard allowedRoles={['ADMIN']}>
                        <button onClick={() => navigate(`/villages/${villageId}/edit`)} className="btn-primary">
                            Edit Desa
                        </button>
                    </RoleGuard>
                </div>
            </div>

            {/* Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="auth-card">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Bidan</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{village.users?.length || 0}</p>
                </div>
                <div className="auth-card">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tempat Praktik</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{village.practice_places?.length || 0}</p>
                </div>
            </div>

            {/* Bidan List */}
            <div className="auth-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Daftar Bidan</h3>
                {village.users && village.users.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nama</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Posisi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {village.users.map((user) => (
                                    <tr key={user.user_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.75rem' }}>{user.full_name}</td>
                                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span className="role-badge">{getPositionLabel(user.position_user)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Belum ada bidan di desa ini</p>
                )}
            </div>

            {/* Practice Places List */}
            <div className="auth-card">
                <h3 style={{ marginBottom: '1rem' }}>Tempat Praktik</h3>
                {village.practice_places && village.practice_places.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {village.practice_places.map((place) => (
                            <div key={place.practice_id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>{place.nama_praktik}</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>📍 {place.alamat}</p>
                                {place.user && (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>👤 {place.user.full_name}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Belum ada tempat praktik di desa ini</p>
                )}
            </div>
        </div>
    );
};

export default VillageDetail;
