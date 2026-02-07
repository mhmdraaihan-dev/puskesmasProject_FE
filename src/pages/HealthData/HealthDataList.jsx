import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHealthData, deleteHealthData } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/dateFormatter';
import { getJenisDataLabel, canEditHealthData, canDeleteHealthData } from '../../utils/roleHelpers';
import '../../App.css';

const HealthDataList = () => {
    const [healthData, setHealthData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({ status: '', jenis: '' });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, dataId: null, patientName: '' });
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchHealthData();
    }, [filter]);

    const fetchHealthData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter.status) params.status_verifikasi = filter.status;
            if (filter.jenis) params.jenis_data = filter.jenis;

            const response = await getHealthData(params);
            setHealthData(response.data || []);
        } catch (err) {
            setError('Gagal memuat data kesehatan');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteHealthData(deleteDialog.dataId);
            setDeleteDialog({ isOpen: false, dataId: null, patientName: '' });
            await fetchHealthData();
            alert('Data kesehatan berhasil dihapus');
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus data kesehatan');
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>Data Kesehatan</h2>
                    <p className="text-muted">Kelola data kesehatan pasien</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
                        Kembali
                    </button>
                    <button onClick={() => navigate('/health-data/add')} className="btn-primary">
                        + Input Data Baru
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="auth-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.875rem' }}>Status Verifikasi</label>
                        <select
                            className="form-input"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="">Semua Status</option>
                            <option value="PENDING">Menunggu Verifikasi</option>
                            <option value="APPROVED">Disetujui</option>
                            <option value="REJECTED">Ditolak</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.875rem' }}>Jenis Data</label>
                        <select
                            className="form-input"
                            value={filter.jenis}
                            onChange={(e) => setFilter({ ...filter, jenis: e.target.value })}
                        >
                            <option value="">Semua Jenis</option>
                            <option value="ibu_hamil">Ibu Hamil</option>
                            <option value="ibu_bersalin">Ibu Bersalin</option>
                            <option value="ibu_nifas">Ibu Nifas</option>
                            <option value="bayi">Bayi</option>
                            <option value="balita">Balita</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-alert" style={{ marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>Memuat data...</p>
                </div>
            ) : healthData.length === 0 ? (
                <div className="auth-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Belum ada data kesehatan</p>
                    <button onClick={() => navigate('/health-data/add')} className="btn-primary" style={{ marginTop: '1rem' }}>
                        Input Data Pertama
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {healthData.map((data) => (
                        <div key={data.data_id} className="auth-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{data.nama_pasien}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        {data.umur_pasien} tahun • {getJenisDataLabel(data.jenis_data)}
                                    </p>
                                </div>
                                <StatusBadge status={data.status_verifikasi} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tanggal Periksa</p>
                                    <p>{formatDate(data.tanggal_periksa)}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tempat Praktik</p>
                                    <p>{data.practice_place?.nama_praktik || '-'}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Desa</p>
                                    <p>{data.practice_place?.village?.nama_desa || '-'}</p>
                                </div>
                                {data.jumlah_revisi > 0 && (
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Revisi</p>
                                        <p>{data.jumlah_revisi}x</p>
                                    </div>
                                )}
                            </div>

                            {data.catatan && (
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                                    "{data.catatan}"
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <button
                                    onClick={() => navigate(`/health-data/${data.data_id}`)}
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.875rem',
                                        backgroundColor: 'rgba(59, 130, 246, 0.3)',
                                        border: '1px solid #60a5fa'
                                    }}
                                >
                                    Detail
                                </button>
                                {canEditHealthData(user, data) && (
                                    <button
                                        onClick={() => navigate(`/health-data/${data.data_id}/edit`)}
                                        className="btn-primary"
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            fontSize: '0.875rem',
                                            backgroundColor: 'rgba(168, 85, 247, 0.3)',
                                            border: '1px solid #a855f7'
                                        }}
                                    >
                                        Edit
                                    </button>
                                )}
                                {canDeleteHealthData(user, data) && (
                                    <button
                                        onClick={() => setDeleteDialog({ isOpen: true, dataId: data.data_id, patientName: data.nama_pasien })}
                                        className="btn-primary"
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            fontSize: '0.875rem',
                                            backgroundColor: 'rgba(239, 68, 68, 0.3)',
                                            border: '1px solid #ef4444'
                                        }}
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, dataId: null, patientName: '' })}
                onConfirm={handleDelete}
                title="Hapus Data Kesehatan"
                message={`Apakah Anda yakin ingin menghapus data kesehatan pasien "${deleteDialog.patientName}"?`}
                confirmText="Hapus"
                cancelText="Batal"
                type="danger"
            />
        </div>
    );
};

export default HealthDataList;
