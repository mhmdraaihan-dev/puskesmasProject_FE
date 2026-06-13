import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createVillage, getVillageById, updateVillage } from "../../services/api";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import "../../styles/design-system.css";
import "../AddUser.css";
import "./VillageForm.css";

const VillageForm = () => {
  const { villageId } = useParams();
  const isEditMode = Boolean(villageId);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      fetchVillage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villageId]);

  const fetchVillage = async () => {
    try {
      setFetching(true);
      const response = await getVillageById(villageId);
      setValue("nama_desa", response.data.nama_desa);
      setError("");
    } catch (err) {
      setError("Gagal memuat data desa");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    try {
      if (isEditMode) {
        await updateVillage(villageId, data);
        alert("Desa berhasil diupdate!");
      } else {
        await createVillage(data);
        alert("Desa berhasil ditambahkan!");
      }
      navigate("/villages");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data desa");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="add-user-page master-form-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="add-user-page master-form-page">
      <PageHeader
        heading={isEditMode ? "Edit Desa" : "Tambah Desa"}
        subtitle={
          isEditMode
            ? "Perbarui data wilayah yang menjadi acuan penugasan bidan dan praktik."
            : "Tambahkan desa baru untuk kebutuhan struktur data master."
        }
        actions={
          <Button variant="secondary" onClick={() => navigate("/villages")}>
            Kembali
          </Button>
        }
      />

      <Card variant="surface-card" padding="xl" className="master-form-card">
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Nama Desa"
            required
            placeholder="Contoh: Desa Sukamaju"
            error={errors.nama_desa?.message}
            {...register("nama_desa", { required: "Nama desa wajib diisi" })}
          />

          <div className="info-box">
            <p className="info-title">Catatan</p>
            <p className="info-hint">
              Data desa akan digunakan sebagai acuan untuk bidan dan tempat praktik di sistem.
            </p>
          </div>

          <div className="vf-actions">
            <button
              type="button"
              className="vf-btn vf-btn-cancel"
              onClick={() => navigate("/villages")}
            >
              Batal
            </button>
            <button
              type="submit"
              className="vf-btn vf-btn-submit"
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : isEditMode
                  ? "Update Desa"
                  : "Tambah Desa"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default VillageForm;
