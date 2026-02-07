import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingData, approveHealthData, rejectHealthData } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/dateFormatter';
import { getJenisDataLabel } from '../../utils/roleHelpers';
import '../../App.css';

const PendingDataList = () => {
    const [pendingData, setPendingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rejectDialog, setRejectDialog] = useState({ isOpen: false, dataId: null, patientName: '' });
    const [rejectReason, setRejectReason] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPendingData();
    }, []);

    const fetchPendingData = async () => {
        try {
            setLoading(true);
            const response = await getPendingData();
            setPendingData(response.data || []);
        } catch (err) {
            setError('Gagal memuat data pending');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (dataId, patientName) => {
        if (!confirm(`Setujui data kesehatan pasien "${patientName}"?`)) return;

        try {
            await approveHealthData(dataId);
            alert('Data berhasil disetujui!');
            await fetchPendingData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyetujui data');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Alasan penolakan wajib diisi');
            return;
        }

        try {
            await rejectHealthData(rejectDialog.dataId, rejectReason);
            alert('Data berhasil ditolak');
            setRejectDialog({ isOpen: false, dataId: null, patientName: '' });
            setRejectReason('');
            await fetchPendingData();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menolak data');
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>Verifikasi Data Kesehatan</h2>
                    <p className="text-muted">Data yang menunggu verifikasi</p>
                </div>
                <div>
                    <button onClick={() => navigate('/')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
                        Kembali
                    </button>
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
            ) : pendingData.length === 0 ? (
                <div className="auth-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Tidak ada data yang menunggu verifikasi</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {pendingData.map((data) => (
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
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Bidan Praktik</p>
                                    <p>{data.practice_place?.user?.full_name || '-'}</p>
                                </div>
                                {data.jumlah_revisi > 0 && (
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Revisi Ke-</p>
                                        <p>{data.jumlah_revisi}</p>
                                    </div>
                                )}
                            </div>

                            {data.catatan && (
                                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Catatan:</p>
                                    <p style={{ fontSize: '0.875rem' }}>{data.catatan}</p>
                                </div>
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
                                <button
                                    onClick={() => handleApprove(data.data_id, data.nama_pasien)}
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.875rem',
                                        backgroundColor: 'rgba(16, 185, 129, 0.3)',
                                        border: '1px solid #10b981'
                                    }}
                                >
                                    ✓ Setujui
                                </button>
                                <button
                                    onClick={() => setRejectDialog({ isOpen: true, dataId: data.data_id, patientName: data.nama_pasien })}
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.875rem',
                                        backgroundColor: 'rgba(239, 68, 68, 0.3)',
                                        border: '1px solid #ef4444'
                                    }}
                                >
                                    ✗ Tolak
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Dialog */}
            {rejectDialog.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="auth-card" style={{ maxWidth: '500px', margin: '1rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Tolak Data Kesehatan</h3>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                            Pasien: <strong>{rejectDialog.patientName}</strong>
                        </p>

                        <div className="form-group">
                            <label className="form-label">Alasan Penolakan *</label>
                            <textarea
                                className="form-input"
                                rows="4"
                                placeholder="Jelaskan alasan penolakan data ini..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => {
                                    setRejectDialog({ isOpen: false, dataId: null, patientName: '' });
                                    setRejectReason('');
                                }}
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    border: '1px solid var(--glass-border)'
                                }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleReject}
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                                    border: '1px solid #ef4444'
                                }}
                            >
                                Tolak Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingDataList;
