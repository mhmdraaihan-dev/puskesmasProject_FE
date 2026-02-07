import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPracticePlaceById } from '../../services/api';
import RoleGuard from '../../components/RoleGuard';
import '../../App.css';

const PracticePlaceDetail = () => {
    const { practiceId } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPracticePlace();
    }, [practiceId]);

    const fetchPracticePlace = async () => {
        try {
            setLoading(true);
            const response = await getPracticePlaceById(practiceId);
            setPlace(response.data);
        } catch (err) {
            setError('Gagal memuat detail tempat praktik');
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

    if (error || !place) {
        return (
            <div className="dashboard">
                <div className="error-alert">
                    {error || 'Tempat praktik tidak ditemukan'}
                </div>
                <button onClick={() => navigate('/practice-places')} className="btn-primary" style={{ marginTop: '1rem' }}>
                    Kembali ke Daftar
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>{place.nama_praktik}</h2>
                    <p className="text-muted">Detail informasi tempat praktik</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/practice-places')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
                        Kembali
                    </button>
                    <RoleGuard allowedRoles={['ADMIN']}>
                        <button onClick={() => navigate(`/practice-places/${practiceId}/edit`)} className="btn-primary">
                            Edit
                        </button>
                    </RoleGuard>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Informasi Utama */}
                <div className="auth-card">
                    <h3 style={{ marginBottom: '1rem' }}>Informasi Utama</h3>

                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Bidan Penanggung Jawab</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>{place.user?.full_name || '-'}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{place.user?.email}</p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Desa</p>
                        <p style={{ fontSize: '1.125rem' }}>{place.village?.nama_desa || '-'}</p>
                    </div>

                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Alamat Lengkap</p>
                        <p>{place.alamat}</p>
                    </div>
                </div>

                {/* Statistik */}
                <div className="auth-card">
                    <h3 style={{ marginBottom: '1rem' }}>Statistik Data Kehatahan</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Data</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{place._count?.health_data || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Riwayat Data Kesehatan (Preview Recent) */}
            <div className="auth-card" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Riwayat Data Kesehatan</h3>
                    <button
                        onClick={() => navigate(`/health-data?practice_id=${practiceId}`)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                        Lihat Semua &rarr;
                    </button>
                </div>

                {place.health_data && place.health_data.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Pasien</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tanggal</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {place.health_data.slice(0, 5).map(data => (
                                <tr key={data.data_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '0.75rem' }}>{data.nama_pasien}</td>
                                    <td style={{ padding: '0.75rem' }}>{new Date(data.tanggal_periksa).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.75rem' }}>{data.status_verifikasi}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Belum ada data kesehatan</p>
                )}
            </div>
        </div>
    );
};

export default PracticePlaceDetail;
