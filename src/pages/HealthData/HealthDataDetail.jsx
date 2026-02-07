import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHealthDataById } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import RoleGuard from '../../components/RoleGuard';
import { formatDate, formatDateTime } from '../../utils/dateFormatter';
import { getJenisDataLabel, canEditHealthData, canDeleteHealthData } from '../../utils/roleHelpers';
import '../../App.css';

const HealthDataDetail = () => {
    const { dataId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [dataId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getHealthDataById(dataId);
            setData(response.data);
        } catch (err) {
            setError('Gagal memuat detail data kesehatan');
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

    if (error || !data) {
        return (
            <div className="dashboard">
                <div className="error-alert">
                    {error || 'Data kesehatan tidak ditemukan'}
                </div>
                <button onClick={() => navigate('/health-data')} className="btn-primary" style={{ marginTop: '1rem' }}>
                    Kembali ke Daftar
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>Detail Data Kesehatan</h2>
                    <p className="text-muted">Informasi lengkap data pasien</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/health-data')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
                        Kembali
                    </button>
                    {canEditHealthData(user, data) && (
                        <button onClick={() => navigate(`/health-data/${dataId}/edit`)} className="btn-primary">
                            Edit Data
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Status Section */}
                <div className="auth-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Status Verifikasi</p>
                        <StatusBadge status={data.status_verifikasi} />
                    </div>
                    {data.status_verifikasi === 'REJECTED' && (
                        <div style={{ textAlign: 'right' }}>
                            <button
                                onClick={() => navigate(`/revision/${dataId}/revise`)}
                                className="btn-primary"
                                style={{ backgroundColor: 'rgba(251, 191, 36, 0.3)', border: '1px solid #fbbf24' }}
                            >
                                🔄 Revisi Sekarang
                            </button>
                        </div>
                    )}
                </div>

                {/* Patient Information */}
                <div className="auth-card">
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        Informasi Pasien
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nama Pasien</p>
                            <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>{data.nama_pasien}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Umur</p>
                            <p style={{ fontSize: '1.125rem' }}>{data.umur_pasien} Tahun</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Jenis Data</p>
                            <p style={{ fontSize: '1.125rem' }}>{getJenisDataLabel(data.jenis_data)}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tanggal Periksa</p>
                            <p style={{ fontSize: '1.125rem' }}>{formatDate(data.tanggal_periksa)}</p>
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                <div className="auth-card">
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        Lokasi Pemeriksaan
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tempat Praktik</p>
                            <p style={{ fontSize: '1.125rem' }}>{data.practice_place?.nama_praktik || '-'}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Desa</p>
                            <p style={{ fontSize: '1.125rem' }}>{data.practice_place?.village?.nama_desa || '-'}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Bidan Pemeriksa</p>
                            <p style={{ fontSize: '1.125rem' }}>{data.practice_place?.user?.full_name || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="auth-card">
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        Catatan Medis
                    </h3>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', minHeight: '100px' }}>
                        {data.catatan ? (
                            <p style={{ whiteSpace: 'pre-line' }}>{data.catatan}</p>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tidak ada catatan.</p>
                        )}
                    </div>
                </div>

                {/* Verification/Rejection History */}
                {data.status_verifikasi !== 'PENDING' && (
                    <div className="auth-card">
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                            Riwayat Verifikasi
                        </h3>
                        {data.verifier && (
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Diverifikasi Oleh</p>
                                <p>{data.verifier.full_name} ({data.verifier.email})</p>
                            </div>
                        )}
                        {data.tanggal_verifikasi && (
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tanggal Verifikasi</p>
                                <p>{formatDateTime(data.tanggal_verifikasi)}</p>
                            </div>
                        )}
                        {data.alasan_penolakan && (
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <p style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '0.5rem' }}>Alasan Penolakan:</p>
                                <p>{data.alasan_penolakan}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthDataDetail;
