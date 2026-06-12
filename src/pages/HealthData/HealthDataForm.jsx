import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { createHealthData, updateHealthData, getHealthDataById } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { JENIS_DATA } from '../../utils/roleHelpers';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import '../../styles/design-system.css';
import './HealthDataForm.css';

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
            <div className="health-data-form-page">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="health-data-form-page">
            <PageHeader
                title={isEditMode ? 'Edit Data Kesehatan' : 'Input Data Kesehatan'}
                subtitle={isEditMode ? 'Perbarui data kesehatan pasien' : 'Tambahkan data kesehatan pasien baru'}
                actions={
                    <Button variant="secondary" onClick={() => navigate('/health-data')}>
                        Kembali
                    </Button>
                }
            />

            {error && <div className="error-alert">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="form-layout">
                {/* Patient Information Section */}
                <Card variant="surface-dark" padding="xl">
                    <div className="section-header">
                        <h3 className="section-title">Informasi Pasien</h3>
                        <p className="section-subtitle">Data identitas pasien yang akan diperiksa</p>
                    </div>

                    <div className="form-grid">
                        <Input
                            label="Nama Pasien"
                            required
                            type="text"
                            placeholder="Nama lengkap pasien"
                            error={errors.nama_pasien?.message}
                            {...register("nama_pasien", { required: "Nama pasien wajib diisi" })}
                        />

                        <Input
                            label="Umur Pasien"
                            required
                            type="number"
                            placeholder="Umur dalam tahun"
                            error={errors.umur_pasien?.message}
                            {...register("umur_pasien", {
                                required: "Umur pasien wajib diisi",
                                min: { value: 0, message: "Umur tidak valid" },
                                max: { value: 150, message: "Umur tidak valid" }
                            })}
                        />
                    </div>
                </Card>

                {/* Health Data Details Section */}
                <Card variant="surface-dark" padding="xl">
                    <div className="section-header">
                        <h3 className="section-title">Detail Pemeriksaan</h3>
                        <p className="section-subtitle">Jenis pemeriksaan dan tanggal pelaksanaan</p>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label" htmlFor="jenis_data">
                                Jenis Data <span className="required-asterisk">*</span>
                            </label>
                            <select
                                id="jenis_data"
                                className="form-select"
                                {...register("jenis_data", { required: "Jenis data wajib dipilih" })}
                            >
                                <option value="">Pilih Jenis Data</option>
                                <option value={JENIS_DATA.IBU_HAMIL}>Ibu Hamil</option>
                                <option value={JENIS_DATA.IBU_BERSALIN}>Ibu Bersalin</option>
                                <option value={JENIS_DATA.IBU_NIFAS}>Ibu Nifas</option>
                                <option value={JENIS_DATA.BAYI}>Bayi</option>
                                <option value={JENIS_DATA.BALITA}>Balita</option>
                            </select>
                            {errors.jenis_data && <span className="error-text">{errors.jenis_data.message}</span>}
                        </div>

                        <Input
                            label="Tanggal Periksa"
                            required
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            error={errors.tanggal_periksa?.message}
                            {...register("tanggal_periksa", { required: "Tanggal periksa wajib diisi" })}
                        />
                    </div>
                </Card>

                {/* Notes Section */}
                <Card variant="surface-dark" padding="xl">
                    <div className="section-header">
                        <h3 className="section-title">Catatan Pemeriksaan</h3>
                        <p className="section-subtitle">Catatan medis, kondisi pasien, dan informasi tambahan</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="catatan">Catatan</label>
                        <textarea
                            id="catatan"
                            className="form-textarea"
                            rows="4"
                            placeholder="Catatan pemeriksaan, kondisi pasien, dll"
                            {...register("catatan")}
                        />
                    </div>
                </Card>

                {/* Info Card */}
                <Card variant="canvas" padding="lg" className="info-card">
                    <div className="info-icon">ℹ️</div>
                    <div>
                        <p className="info-title">Informasi</p>
                        <ul className="info-list">
                            <li>Data akan masuk dengan status PENDING</li>
                            <li>Menunggu verifikasi dari Bidan Desa</li>
                            <li>Anda dapat mengedit data selama masih PENDING</li>
                        </ul>
                    </div>
                </Card>

                {/* Form Actions */}
                <div className="form-actions">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/health-data')}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                    >
                        {loading ? 'Menyimpan...' : (isEditMode ? 'Update Data Kesehatan' : 'Simpan Data Kesehatan')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default HealthDataForm;
