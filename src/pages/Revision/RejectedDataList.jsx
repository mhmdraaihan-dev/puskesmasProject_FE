import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRejectedData } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import { formatDate, formatDateTime } from "../../utils/dateFormatter";
import { getJenisDataLabel, isBidanPraktik } from "../../utils/roleHelpers";
import "../../App.css";

const RejectedDataList = () => {
  const [rejectedData, setRejectedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!isBidanPraktik(user)) {
      navigate("/");
      return;
    }
    fetchRejectedData();
  }, [user, navigate]);

  const fetchRejectedData = async () => {
    try {
      setLoading(true);
      const response = await getRejectedData();
      setRejectedData(response.data || []);
    } catch (err) {
      setError("Gagal memuat data yang ditolak");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Data Ditolak</h2>
          <p className="text-muted">Data yang perlu direvisi</p>
        </div>
        <div>
          <button
            onClick={() => navigate("/")}
            className="btn-primary"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--glass-border)",
            }}
          >
            Kembali
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p>Memuat data...</p>
        </div>
      ) : rejectedData.length === 0 ? (
        <div
          className="auth-card"
          style={{ textAlign: "center", padding: "3rem" }}
        >
          <p style={{ color: "var(--text-muted)" }}>
            Tidak ada data yang ditolak
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {rejectedData.map((data) => (
            <div key={data.data_id} className="auth-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>
                    {data.nama_pasien}
                  </h3>
                  <p
                    style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}
                  >
                    {data.umur_pasien} tahun •{" "}
                    {getJenisDataLabel(data.jenis_data)}
                  </p>
                </div>
                <StatusBadge status={data.status_verifikasi} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Tanggal Periksa
                  </p>
                  <p>{formatDate(data.tanggal_periksa)}</p>
                </div>
                <div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Ditolak Oleh
                  </p>
                  <p>{data.verifier?.full_name || "-"}</p>
                </div>
                <div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Tanggal Ditolak
                  </p>
                  <p>{formatDateTime(data.tanggal_verifikasi)}</p>
                </div>
              </div>

              {/* Alasan Penolakan */}
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(239, 68, 68, 0.1)",
                  borderRadius: "8px",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  marginBottom: "1rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#fca5a5",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  ⚠️ ALASAN PENOLAKAN:
                </p>
                <p style={{ fontSize: "0.875rem", color: "#fca5a5" }}>
                  {data.alasan_penolakan || "Tidak ada alasan yang diberikan"}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <button
                  onClick={() => navigate(`/health-data/${data.data_id}`)}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    fontSize: "0.875rem",
                    backgroundColor: "rgba(59, 130, 246, 0.3)",
                    border: "1px solid #60a5fa",
                  }}
                >
                  Detail
                </button>
                <button
                  onClick={() => navigate(`/revision/${data.data_id}/revise`)}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    fontSize: "0.875rem",
                    backgroundColor: "rgba(251, 191, 36, 0.3)",
                    border: "1px solid #fbbf24",
                  }}
                >
                  🔄 Revisi Data
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RejectedDataList;
