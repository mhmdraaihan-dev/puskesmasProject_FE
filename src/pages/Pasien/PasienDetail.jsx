import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPasienDetail } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import { isBidanPraktik } from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import "../../styles/design-system.css";
import "./PasienDetail.css";

const PASIEN_TABS = {
  kehamilan: {
    shortLabel: "Kehamilan",
    label: "Riwayat Kehamilan",
    emptyLabel: "Belum ada riwayat pemeriksaan kehamilan.",
    ctaLabel: "+ Input Pemeriksaan Baru",
    ctaPath: "/pemeriksaan-kehamilan/add",
    getItems: (data) => data.pemeriksaan_kehamilan || [],
    renderMeta: (item) => (
      <>
        <div className="meta-item">
          <span className="meta-label">Tanggal</span>
          <span className="meta-value">{formatDate(item.tanggal)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Umur Kehamilan</span>
          <span className="meta-value">{item.umur_kehamilan} minggu</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Kunjungan</span>
          <span className="meta-value">{item.jenis_kunjungan || "-"}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Catatan</span>
          <span className="meta-value">{item.catatan || "-"}</span>
        </div>
      </>
    ),
  },
  persalinan: {
    shortLabel: "Persalinan",
    label: "Riwayat Persalinan",
    emptyLabel: "Belum ada riwayat persalinan.",
    ctaLabel: "+ Input Persalinan Baru",
    ctaPath: "/persalinan/add",
    getItems: (data) => data.persalinan || [],
    renderMeta: (item) => (
      <>
        <div className="meta-item">
          <span className="meta-label">Tanggal Partus</span>
          <span className="meta-value">{formatDate(item.tanggal_partus)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Riwayat</span>
          <span className="meta-value">
            G{item.gravida} P{item.para} A{item.abortus}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Bayi</span>
          <span className="meta-value">
            {item.keadaan_bayi?.jenis_kelamin || "-"} /{" "}
            {item.keadaan_bayi?.bb || "-"} g
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Kondisi Ibu</span>
          <span className="meta-value">
            {item.keadaan_ibu?.baik ? "Baik" : "Perlu Perhatian"}
          </span>
        </div>
      </>
    ),
  },
  kb: {
    shortLabel: "KB",
    label: "Riwayat KB",
    emptyLabel: "Belum ada riwayat KB.",
    ctaLabel: "+ Input KB Baru",
    ctaPath: "/keluarga-berencana/add",
    getItems: (data) => data.keluarga_berencana || [],
    renderMeta: (item) => (
      <>
        <div className="meta-item">
          <span className="meta-label">Tanggal Kunjungan</span>
          <span className="meta-value">{formatDate(item.tanggal_kunjungan)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Metode</span>
          <span className="meta-value">
            {item.alat_kontrasepsi?.replace(/_/g, " ") || "-"}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Anak Hidup</span>
          <span className="meta-value">
            L {item.jumlah_anak_laki} / P {item.jumlah_anak_perempuan}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Keterangan</span>
          <span className="meta-value">{item.keterangan || "-"}</span>
        </div>
      </>
    ),
  },
  imunisasi: {
    shortLabel: "Imunisasi",
    label: "Riwayat Imunisasi",
    emptyLabel: "Belum ada riwayat imunisasi.",
    ctaLabel: "+ Input Imunisasi Baru",
    ctaPath: "/imunisasi/add",
    getItems: (data) => data.imunisasi || [],
    renderMeta: (item) => (
      <>
        <div className="meta-item">
          <span className="meta-label">Tanggal Imunisasi</span>
          <span className="meta-value">{formatDate(item.tgl_imunisasi)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Jenis Imunisasi</span>
          <span className="meta-value">
            {item.jenis_imunisasi?.replace(/_/g, " ") || "-"}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Berat / Suhu</span>
          <span className="meta-value">
            {item.berat_badan} kg / {item.suhu_badan || "-"} C
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Orang Tua</span>
          <span className="meta-value">{item.nama_orangtua || "-"}</span>
        </div>
      </>
    ),
  },
};

const PasienDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("kehamilan");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getPasienDetail(id);
        setData(response.data);
      } catch (err) {
        setError("Gagal memuat detail pasien");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="pasien-detail-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pasien-detail-page">
        <div className="error-alert">{error}</div>
        <Button variant="primary" onClick={() => navigate("/pasien")}>
          Kembali ke Daftar Pasien
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pasien-detail-page">
        <div className="error-alert">Data pasien tidak ditemukan</div>
        <Button variant="primary" onClick={() => navigate("/pasien")}>
          Kembali ke Daftar Pasien
        </Button>
      </div>
    );
  }

  const canCreatePelayanan = isBidanPraktik(user);
  const patientInitial = data.nama?.charAt(0)?.toUpperCase() || "?";
  const tabs = Object.entries(PASIEN_TABS).map(([tabId, config]) => ({
    id: tabId,
    ...config,
    items: config.getItems(data),
  }));
  const activeConfig =
    tabs.find((tab) => tab.id === activeTab) || tabs[0] || null;

  return (
    <div className="pasien-detail-page">
      <PageHeader
        title="Detail Pasien"
        subtitle="Profil pasien dan ringkasan riwayat pelayanan sesuai cakupan akses akun"
        actions={
          <Button variant="secondary" onClick={() => navigate("/pasien")}>
            Kembali ke Daftar
          </Button>
        }
      />

      {/* Patient Info Card */}
      <Card variant="surface-dark" padding="xl" className="patient-hero-card">
        <div className="patient-hero-header">
          <div className="patient-identity">
            <div className="patient-avatar">{patientInitial}</div>
            <div>
              <div className="patient-badge">Pasien</div>
              <h3 className="patient-name">{data.nama}</h3>
              <p className="patient-nik">NIK {data.nik || "-"}</p>
            </div>
          </div>

          {canCreatePelayanan && activeConfig && (
            <Button
              variant="primary"
              onClick={() => navigate(activeConfig.ctaPath)}
            >
              {activeConfig.ctaLabel}
            </Button>
          )}
        </div>

        <div className="patient-info-grid">
          <div className="patient-info-item">
            <span className="info-label">Tanggal Lahir</span>
            <span className="info-value">{formatDate(data.tanggal_lahir)}</span>
          </div>
          <div className="patient-info-item">
            <span className="info-label">Alamat Lengkap</span>
            <span className="info-value">{data.alamat_lengkap || "-"}</span>
          </div>
        </div>

        <div className="summary-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`summary-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              <span className="tab-label">{tab.shortLabel}</span>
              <span className="tab-count">{tab.items.length}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* History Card */}
      {activeConfig && (
        <Card variant="surface-dark" padding="xl" className="history-card">
          <div className="history-header">
            <div>
              <h3 className="history-title">{activeConfig.label}</h3>
              <p className="history-subtitle">
                {activeConfig.items.length > 0
                  ? `Total ${activeConfig.items.length} data tercatat`
                  : "Belum ada data yang tercatat untuk modul ini"}
              </p>
            </div>
          </div>

          <div className="tab-grid">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              >
                <span className="tab-title">{tab.label}</span>
                <span className="tab-count-text">{tab.items.length} data</span>
              </button>
            ))}
          </div>

          {activeConfig.items.length > 0 ? (
            <div className="history-list">
              {activeConfig.items.map((item, index) => (
                <div
                  key={item.id || `${activeConfig.id}-${index}`}
                  className="history-item"
                >
                  <div className="history-item-header">
                    <div>
                      <h4 className="history-item-title">
                        {activeConfig.shortLabel} #{index + 1}
                      </h4>
                      <p className="history-item-subtitle">
                        Detail pelayanan pasien
                      </p>
                    </div>
                    {item.status_verifikasi && (
                      <StatusBadge status={item.status_verifikasi} />
                    )}
                  </div>
                  <div className="history-meta-grid">
                    {activeConfig.renderMeta(item)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h4 className="empty-title">Belum ada riwayat</h4>
              <p className="empty-text">{activeConfig.emptyLabel}</p>
              {canCreatePelayanan && (
                <Button
                  variant="primary"
                  onClick={() => navigate(activeConfig.ctaPath)}
                >
                  {activeConfig.ctaLabel}
                </Button>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
export default PasienDetail;
