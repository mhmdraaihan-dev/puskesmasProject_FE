import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { getHealthDataById, reviseRejectedData } from '../../services/api';
import { JENIS_DATA } from '../../utils/roleHelpers';
import '../../App.css';

const RevisionForm = () => {
    const { dataId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [originalData, setOriginalData] = useState(null);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    useEffect(() => {
        fetchData();
    }, [dataId]);

    const fetchData = async () => {
        try {
            const response = await getHealthDataById(dataId);
            const data = response.data;
            setOriginalData(data);

            // Pre-fill form
            setValue('nama_pasien', data.nama_pasien);
            setValue('umur_pasien', data.umur_pasien);
            setValue('jenis_data', data.jenis_data);

            // Format date for input
            if (data.tanggal_periksa) {
                const date = new Date(data.tanggal_periksa);
                setValue('tanggal_periksa', date.toISOString().split('T')[0]);
            }

            setValue('catatan', data.catatan);

            setLoading(false);
        } catch (err) {
            setError('Gagal memuat data untuk revisi');
            console.error(err);
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);

        try {
            const healthData = {
                ...data,
                umur_pasien: parseInt(data.umur_pasien)
            };

            await reviseRejectedData(dataId, healthData);
            alert('Data berhasil direvisi dan dikirim ulang untuk verifikasi!');
            navigate('/revision/rejected');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal merevisi data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="dashboard">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Memuat data...</p>
            </div>
        </div>
    );

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>Revisi Data Kesehatan</h2>
                    <p className="text-muted">Perbaiki data yang ditolak</p>
                </div>
                <div>
                    <button onClick={() => navigate('/revision/rejected')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
                        Batal
                    </button>
                </div>
            </div>

            <div className="auth-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {error && (
                    <div className="error-alert" style={{ marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {/* Alasan Penolakan Display */}
                {originalData?.alasan_penolakan && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        marginBottom: '2rem'
                    }}>
                        <h4 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>⚠️ Alasan Penolakan:</h4>
                        <p>{originalData.alasan_penolakan}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="nama_pasien">Nama Pasien *</label>
                            <input
                                id="nama_pasien"
                                type="text"
                                className="form-input"
                                placeholder="Nama lengkap pasien"
                                {...register("nama_pasien", { required: "Nama pasien wajib diisi" })}
                            />
                            {errors.nama_pasien && <span className="error-message">{errors.nama_pasien.message}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="umur_pasien">Umur Pasien *</label>
                            <input
                                id="umur_pasien"
                                type="number"
                                className="form-input"
                                placeholder="Umur dalam tahun"
                                {...register("umur_pasien", {
                                    required: "Umur pasien wajib diisi",
                                    min: { value: 0, message: "Umur tidak valid" },
                                    max: { value: 150, message: "Umur tidak valid" }
                                })}
                            />
                            {errors.umur_pasien && <span className="error-message">{errors.umur_pasien.message}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="jenis_data">Jenis Data *</label>
                            <select
                                id="jenis_data"
                                className="form-input"
                                {...register("jenis_data", { required: "Jenis data wajib dipilih" })}
                            >
                                <option value="">Pilih Jenis Data</option>
                                <option value={JENIS_DATA.IBU_HAMIL}>Ibu Hamil</option>
                                <option value={JENIS_DATA.IBU_BERSALIN}>Ibu Bersalin</option>
                                <option value={JENIS_DATA.IBU_NIFAS}>Ibu Nifas</option>
                                <option value={JENIS_DATA.BAYI}>Bayi</option>
                                <option value={JENIS_DATA.BALITA}>Balita</option>
                            </select>
                            {errors.jenis_data && <span className="error-message">{errors.jenis_data.message}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="tanggal_periksa">Tanggal Periksa *</label>
                            <input
                                id="tanggal_periksa"
                                type="date"
                                className="form-input"
                                {...register("tanggal_periksa", { required: "Tanggal periksa wajib diisi" })}
                            />
                            {errors.tanggal_periksa && <span className="error-message">{errors.tanggal_periksa.message}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="catatan">Catatan</label>
                        <textarea
                            id="catatan"
                            className="form-input"
                            rows="4"
                            placeholder="Catatan pemeriksaan, kondisi pasien, dll"
                            {...register("catatan")}
                        />
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Menyimpan Perubahan...' : 'Kirim Revisi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RevisionForm;
