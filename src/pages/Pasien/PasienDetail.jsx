import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPasienDetail } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import StatusBadge from "../../components/StatusBadge";
import "../../App.css";

const PasienDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading)
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Memuat detail pasien...
      </div>
    );
  if (error) return <div className="error-alert">{error}</div>;
  if (!data)
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Data Pasien Tidak Ditemukan
      </div>
    );

  const tabs = [
    { id: "kehamilan", label: "Riwayat Kehamilan" },
    { id: "persalinan", label: "Riwayat Persalinan" },
    { id: "kb", label: "Riwayat KB" },
    { id: "imunisasi", label: "Riwayat Imunisasi" },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Detail Pasien</h2>
          <p className="text-muted">Profil dan Rekam Medis Pasien</p>
        </div>
        <button
          onClick={() => navigate("/pasien")}
          className="btn-primary"
          style={{
            backgroundColor: "transparent",
            border: "1px solid var(--glass-border)",
          }}
        >
          Kembali ke List
        </button>
      </div>

      {/* Patient Profile Card */}
      <div className="auth-card" style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-color)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "3rem",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {data.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ marginBottom: "0.5rem" }}>{data.nama}</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                  NIK
                </p>
                <p style={{ fontSize: "1.1rem" }}>{data.nik}</p>
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                  Tanggal Lahir
                </p>
                <p>{formatDate(data.tanggal_lahir)}</p>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                  Alamat Lengkap
                </p>
                <p>{data.alamat_lengkap}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical History Tabs */}
      <div className="auth-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "1rem",
                background:
                  activeTab === tab.id
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid var(--accent-color)"
                    : "none",
                color: activeTab === tab.id ? "white" : "var(--text-muted)",
                cursor: "pointer",
                fontWeight: activeTab === tab.id ? "bold" : "normal",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "1.5rem" }}>
          {/* Kehamilan Tab */}
          {activeTab === "kehamilan" && (
            <div>
              {data.pemeriksaan_kehamilan &&
              data.pemeriksaan_kehamilan.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {data.pemeriksaan_kehamilan.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "1rem",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>
                          {formatDate(item.tanggal)}
                        </span>
                        <StatusBadge status={item.status_verifikasi} />
                      </div>
                      <p className="text-muted">
                        Usia Kehamilan: {item.umur_kehamilan} minggu
                      </p>
                      <p>Keluhan: {item.catatan || "-"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className="text-muted"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Belum ada riwayat pemeriksaan kehamilan.
                </p>
              )}
              <div style={{ marginTop: "1rem", textAlign: "right" }}>
                <button
                  onClick={() => navigate("/pemeriksaan-kehamilan/add")}
                  className="btn-primary"
                  style={{ width: "auto", fontSize: "0.875rem" }}
                >
                  + Input Pemeriksaan Baru
                </button>
              </div>
            </div>
          )}

          {/* Persalinan Tab */}
          {activeTab === "persalinan" && (
            <div>
              {data.persalinan && data.persalinan.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {data.persalinan.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "1rem",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>
                          {formatDate(item.tanggal_partus)}
                        </span>
                        <StatusBadge status={item.status_verifikasi} />
                      </div>
                      <p>
                        Anak: {item.keadaan_bayi?.jenis_kelamin} /{" "}
                        {item.keadaan_bayi?.bb}g
                      </p>
                      <p className="text-muted">
                        Kondisi Ibu:{" "}
                        {item.keadaan_ibu?.baik ? "Baik" : "Perlu Perhatian"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className="text-muted"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Belum ada riwayat persalinan.
                </p>
              )}
              <div style={{ marginTop: "1rem", textAlign: "right" }}>
                <button
                  onClick={() => navigate("/persalinan/add")}
                  className="btn-primary"
                  style={{ width: "auto", fontSize: "0.875rem" }}
                >
                  + Input Persalinan Baru
                </button>
              </div>
            </div>
          )}

          {/* KB Tab */}
          {activeTab === "kb" && (
            <div>
              {data.keluarga_berencana && data.keluarga_berencana.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {data.keluarga_berencana.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "1rem",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>
                          {formatDate(item.tanggal_kunjungan)}
                        </span>
                        <StatusBadge status={item.status_verifikasi} />
                      </div>
                      <p>
                        Metode:{" "}
                        <strong style={{ color: "var(--accent-color)" }}>
                          {item.alat_kontrasepsi?.replace(/_/g, " ")}
                        </strong>
                      </p>
                      <p className="text-muted">
                        Keterangan: {item.keterangan || "-"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className="text-muted"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Belum ada riwayat KB.
                </p>
              )}
              <div style={{ marginTop: "1rem", textAlign: "right" }}>
                <button
                  onClick={() => navigate("/keluarga-berencana/add")}
                  className="btn-primary"
                  style={{ width: "auto", fontSize: "0.875rem" }}
                >
                  + Input KB Baru
                </button>
              </div>
            </div>
          )}

          {/* Imunisasi Tab */}
          {activeTab === "imunisasi" && (
            <div>
              {data.imunisasi && data.imunisasi.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {data.imunisasi.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "1rem",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>
                          {formatDate(item.tgl_imunisasi)}
                        </span>
                        <StatusBadge status={item.status_verifikasi} />
                      </div>
                      <p>
                        Vaksin:{" "}
                        <strong style={{ color: "var(--accent-color)" }}>
                          {item.jenis_imunisasi?.replace(/_/g, " ")}
                        </strong>
                      </p>
                      <p className="text-muted">
                        BB: {item.berat_badan}kg / Suhu:{" "}
                        {item.suhu_badan || "-"}°C
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className="text-muted"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Belum ada riwayat imunisasi.
                </p>
              )}
              <div style={{ marginTop: "1rem", textAlign: "right" }}>
                <button
                  onClick={() => navigate("/imunisasi/add")}
                  className="btn-primary"
                  style={{ width: "auto", fontSize: "0.875rem" }}
                >
                  + Input Imunisasi Baru
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasienDetail;
