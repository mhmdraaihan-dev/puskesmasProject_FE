import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { createHealthData, updateHealthData, getHealthDataById } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { JENIS_DATA } from '../../utils/roleHelpers';
import '../../App.css';

const HealthDataForm = () => {
    const { dataId } = useParams();
    const isEditMode = !!dataId;
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchData();
        }
    }, [dataId]);

    const fetchData = async () => {
        setFetching(true);
        try {
            const response = await getHealthDataById(dataId);
            const data = response.data;

            setValue('nama_pasien', data.nama_pasien);
            setValue('umur_pasien', data.umur_pasien);
            setValue('jenis_data', data.jenis_data);
            if (data.tanggal_periksa) {
                setValue('tanggal_periksa', new Date(data.tanggal_periksa).toISOString().split('T')[0]);
            }
            setValue('catatan', data.catatan);
        } catch (err) {
            setError('Gagal memuat data kesehatan');
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);

        try {
            const healthData = {
                ...data,
                user_id: user.user_id,
                umur_pasien: parseInt(data.umur_pasien)
            };

            if (isEditMode) {
                await updateHealthData(dataId, healthData);
                alert('Data kesehatan berhasil diperbarui!');
            } else {
                await createHealthData(healthData);
                alert('Data kesehatan berhasil ditambahkan dan menunggu verifikasi!');
            }
            navigate('/health-data');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data kesehatan');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="dashboard">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>{isEditMode ? 'Edit Data Kesehatan' : 'Input Data Kesehatan'}</h2>
                    <p className="text-muted">
                        {isEditMode ? 'Perbarui data kesehatan' : 'Tambahkan data kesehatan pasien baru'}
                    </p>
                </div>
                <div>
                    <button onClick={() => navigate('/health-data')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
                        Batal
                    </button>
                </div>
            </div>

            <div className="auth-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                {error && (
                    <div className="error-alert">
                        {error}
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

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        <p style={{ fontSize: '0.875rem', margin: 0 }}>
                            <strong>ℹ️ Informasi:</strong>
                        </p>
                        <ul style={{ fontSize: '0.875rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                            <li>Data akan masuk dengan status PENDING</li>
                            <li>Menunggu verifikasi dari Bidan Desa</li>
                            <li>Anda dapat mengedit data selama masih PENDING</li>
                        </ul>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Menyimpan...' : (isEditMode ? 'Update Data Kesehatan' : 'Simpan Data Kesehatan')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HealthDataForm;
