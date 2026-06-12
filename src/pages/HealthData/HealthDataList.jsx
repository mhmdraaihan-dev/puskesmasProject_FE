import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHealthData, deleteHealthData } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Table from '../../components/ui/Table';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/dateFormatter';
import { getJenisDataLabel, canEditHealthData, canDeleteHealthData, isBidanPraktik } from '../../utils/roleHelpers';
import '../../styles/design-system.css';
import './HealthDataList.css';

const HealthDataList = () => {
    const [healthData, setHealthData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({ status: '', jenis: '', search: '' });
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, dataId: null, patientName: '' });
    const navigate = useNavigate();
    const { user } = useAuth();

    const canAddData = isBidanPraktik(user);

    const stats = useMemo(() => {
        const total = healthData.length;
        const pending = healthData.filter(item => item.status_verifikasi === 'PENDING').length;
        const approved = healthData.filter(item => item.status_verifikasi === 'APPROVED').length;
        const rejected = healthData.filter(item => item.status_verifikasi === 'REJECTED').length;

        return { total, pending, approved, rejected };
    }, [healthData]);

    useEffect(() => {
        fetchHealthData();
    }, []);

    const fetchHealthData = async (overrideFilter = filter) => {
        try {
            setLoading(true);
            const params = {};
            if (overrideFilter.status) params.status_verifikasi = overrideFilter.status;
            if (overrideFilter.jenis) params.jenis_data = overrideFilter.jenis;
            if (overrideFilter.search) params.search = overrideFilter.search;

            const response = await getHealthData(params);
            setHealthData(response.data || []);
            setError('');
        } catch (err) {
            setError('Gagal memuat data kesehatan');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchHealthData();
    };

    const handleReset = () => {
        const resetFilter = { status: '', jenis: '', search: '' };
        setFilter(resetFilter);
        fetchHealthData(resetFilter);
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

    const columns = [
        {
            key: 'nama_pasien',
            label: 'Nama Pasien',
            sortable: true,
            render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>
        },
        {
            key: 'jenis_data',
            label: 'Jenis Data',
            render: (value) => getJenisDataLabel(value)
        },
        {
            key: 'tanggal_periksa',
            label: 'Tanggal Periksa',
            sortable: true,
            render: (value) => formatDate(value)
        },
        {
            key: 'umur_pasien',
            label: 'Umur',
            render: (value) => `${value} tahun`
        },
        {
            key: 'practice_place',
            label: 'Tempat Praktik',
            render: (value) => value?.nama_praktik || '-'
        },
        {
            key: 'status_verifikasi',
            label: 'Status',
            render: (value) => <StatusBadge status={value} />
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button
                        variant="secondary-on-dark"
                        size="sm"
                        onClick={() => navigate(`/health-data/${row.data_id}`)}
                    >
                        Detail
                    </Button>
                    {canEditHealthData(user, row) && (
                        <Button
                            variant="secondary-on-dark"
                            size="sm"
                            onClick={() => navigate(`/health-data/${row.data_id}/edit`)}
                        >
                            Edit
                        </Button>
                    )}
                    {canDeleteHealthData(user, row) && (
                        <Button
                            variant="secondary-on-dark"
                            size="sm"
                            onClick={() => setDeleteDialog({ isOpen: true, dataId: row.data_id, patientName: row.nama_pasien })}
                        >
                            Hapus
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="health-data-list-page">
            <PageHeader
                title="Data Kesehatan"
                subtitle={canAddData ? "Input dan kelola data kesehatan pasien" : "Lihat data kesehatan dan proses verifikasinya"}
                actions={
                    <>
                        {canAddData && (
                            <Button variant="primary" onClick={() => navigate('/health-data/add')}>
                                Input Data Baru
                            </Button>
                        )}
                    </>
                }
            />

            {/* Stats Section */}
            <div className="stats-section">
                <Card variant="surface-dark" padding="lg">
                    <div className="stat-label">Total Data</div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-note">data kesehatan</div>
                </Card>
                <Card variant="surface-dark" padding="lg">
                    <div className="stat-label">Menunggu Verifikasi</div>
                    <div className="stat-value">{stats.pending}</div>
                    <div className="stat-note">pending</div>
                </Card>
                <Card variant="surface-dark" padding="lg">
                    <div className="stat-label">Disetujui</div>
                    <div className="stat-value">{stats.approved}</div>
                    <div className="stat-note">approved</div>
                </Card>
                <Card variant="surface-dark" padding="lg">
                    <div className="stat-label">Ditolak</div>
                    <div className="stat-value">{stats.rejected}</div>
                    <div className="stat-note">rejected</div>
                </Card>
            </div>

            {/* Filter Card */}
            <Card variant="surface-dark" padding="xl" className="filter-card">
                <h3 className="filter-title">Filter Data Kesehatan</h3>
                <p className="filter-subtitle">Cari data berdasarkan nama pasien, jenis data, dan status verifikasi</p>

                <form onSubmit={handleSearch} className="filter-form">
                    <Input
                        label="Cari Nama Pasien"
                        type="text"
                        placeholder="Ketik nama pasien..."
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    />
                    <div className="form-group">
                        <label className="form-label" htmlFor="jenis">Jenis Data</label>
                        <select
                            id="jenis"
                            className="form-select"
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
                    <div className="form-group">
                        <label className="form-label" htmlFor="status">Status Verifikasi</label>
                        <select
                            id="status"
                            className="form-select"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="">Semua Status</option>
                            <option value="PENDING">Menunggu Verifikasi</option>
                            <option value="APPROVED">Disetujui</option>
                            <option value="REJECTED">Ditolak</option>
                        </select>
                    </div>
                    <div className="filter-actions">
                        <Button type="submit" variant="primary">
                            Cari
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </form>
            </Card>

            {error && <div className="error-alert">{error}</div>}

            {/* Table */}
            {loading ? (
                <LoadingSpinner size="lg" />
            ) : healthData.length === 0 ? (
                <EmptyState
                    message={canAddData ? "Belum ada data kesehatan. Silakan tambahkan data baru atau ubah filter pencarian." : "Belum ada data kesehatan yang dapat ditampilkan."}
                    action={
                        canAddData ? (
                            <Button variant="primary" onClick={() => navigate('/health-data/add')}>
                                Input Data Pertama
                            </Button>
                        ) : undefined
                    }
                />
            ) : (
                <Table columns={columns} data={healthData} />
            )}

            {/* Delete Confirmation Modal */}
            <Modal
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
