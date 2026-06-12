import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHealthDataById } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/dateFormatter';
import { getJenisDataLabel, canEditHealthData } from '../../utils/roleHelpers';
import '../../styles/design-system.css';
import './HealthDataDetail.css';

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
            <div className="health-data-detail-page">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="health-data-detail-page">
                <div className="error-alert">
                    {error || 'Data kesehatan tidak ditemukan'}
                </div>
                <Button variant="secondary" onClick={() => navigate('/health-data')}>
                    Kembali ke Daftar
                </Button>
            </div>
        );
    }

    return (
        <div className="health-data-detail-page">
            <PageHeader
                title="Detail Data Kesehatan"
                subtitle={`ID: ${dataId} • ${formatDate(data.tanggal_periksa)}`}
                actions={
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <StatusBadge status={data.status_verifikasi} />
                        {canEditHealthData(user, data) && (
                            <Button variant="primary" onClick={() => navigate(`/health-data/${dataId}/edit`)}>
                                Edit Data
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => navigate('/health-data')}>
                            Kembali
                        </Button>
                    </div>
                }
            />

            {/* Rejection Banner */}
            {data.status_verifikasi === 'REJECTED' && (
                <Card variant="canvas" padding="lg" className="rejection-banner">
                    <div className="rejection-icon">⚠️</div>
                    <div className="rejection-content">
                        <h4 className="rejection-title">Data Ditolak - Perlu Revisi</h4>
                        <p className="rejection-message">Data ini ditolak dan memerlukan perbaikan sebelum dapat diverifikasi ulang.</p>
                        <Button
                            variant="warning"
                            size="sm"
                            onClick={() => navigate(`/revision/${dataId}/revise`)}
                        >
                            🔄 Revisi Sekarang
                        </Button>
                    </div>
                </Card>
            )}

            {/* Patient Information Summary */}
            <Card variant="surface-card" padding="xl">
                <div className="detail-grid">
                    <div className="detail-item">
                        <div className="detail-label">Nama Pasien</div>
                        <div className="detail-value detail-value--highlight">{data.nama_pasien}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-label">Jenis Data</div>
                        <div className="detail-value">{getJenisDataLabel(data.jenis_data)}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-label">Umur Pasien</div>
                        <div className="detail-value">{data.umur_pasien} Tahun</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-label">Tanggal Periksa</div>
                        <div className="detail-value">{formatDate(data.tanggal_periksa)}</div>
                    </div>
                </div>
            </Card>

            {/* 2-Column Layout for Service Details and Status */}
            <div className="content-grid">
                {/* Left Column - Service Details */}
                <div className="content-column">
                    {/* Location Information */}
                    <Card variant="surface-dark" padding="xl">
                        <h3 className="card-title">Lokasi Pemeriksaan</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <div className="detail-label">Tempat Praktik</div>
                                <div className="detail-value">{data.practice_place?.nama_praktik || '-'}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Desa</div>
                                <div className="detail-value">{data.practice_place?.village?.nama_desa || '-'}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Bidan Pemeriksa</div>
                                <div className="detail-value">{data.practice_place?.user?.full_name || '-'}</div>
                            </div>
                        </div>
                    </Card>

                    {/* Notes Card */}
                    <Card variant="surface-dark" padding="xl">
                        <h3 className="card-title">Catatan Medis</h3>
                        <div className="notes-content">
                            {data.catatan ? (
                                <p className="notes-text">{data.catatan}</p>
                            ) : (
                                <p className="notes-empty">Tidak ada catatan medis.</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column - Status and Verification */}
                <div className="content-column">
                    {/* Verification History */}
                    {data.status_verifikasi !== 'PENDING' && (
                        <Card variant="surface-dark" padding="xl">
                            <h3 className="card-title">Riwayat Verifikasi</h3>
                            <div className="detail-grid">
                                {data.verifier && (
                                    <div className="detail-item detail-item--full">
                                        <div className="detail-label">Diverifikasi Oleh</div>
                                        <div className="detail-value">
                                            {data.verifier.full_name}
                                            <span className="detail-meta">({data.verifier.email})</span>
                                        </div>
                                    </div>
                                )}
                                {data.tanggal_verifikasi && (
                                    <div className="detail-item detail-item--full">
                                        <div className="detail-label">Tanggal Verifikasi</div>
                                        <div className="detail-value">{formatDateTime(data.tanggal_verifikasi)}</div>
                                    </div>
                                )}
                            </div>

                            {data.alasan_penolakan && (
                                <div className="rejection-reason">
                                    <div className="rejection-reason-title">Alasan Penolakan:</div>
                                    <p className="rejection-reason-text">{data.alasan_penolakan}</p>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Pending Status Info */}
                    {data.status_verifikasi === 'PENDING' && (
                        <Card variant="surface-dark" padding="xl">
                            <h3 className="card-title">Status Verifikasi</h3>
                            <div className="pending-info">
                                <div className="pending-icon">⏳</div>
                                <div>
                                    <p className="pending-title">Menunggu Verifikasi</p>
                                    <p className="pending-text">Data sedang menunggu verifikasi dari Bidan Desa. Anda dapat mengedit data selama masih dalam status PENDING.</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HealthDataDetail;
