import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Table from "../../components/ui/Table";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { getRejectedData } from "../../services/api";
import { formatDateTime } from "../../utils/dateFormatter";
import { isBidanPraktik } from "../../utils/roleHelpers";
import "../../styles/design-system.css";
import "./RejectedDataList.css";

const MODULE_META = {
  legacy: {
    label: "Data Kesehatan",
    detailRoute: (id) => `/health-data/${id}`,
    reviseRoute: (id) => `/revision/${id}/revise`,
  },
  kehamilan: {
    label: "Pemeriksaan Kehamilan",
    detailRoute: (id) => `/pemeriksaan-kehamilan/${id}`,
    reviseRoute: (id) => `/pemeriksaan-kehamilan/${id}/edit`,
  },
  persalinan: {
    label: "Persalinan",
    detailRoute: (id) => `/persalinan/${id}`,
    reviseRoute: (id) => `/persalinan/${id}/edit`,
  },
  "keluarga-berencana": {
    label: "Keluarga Berencana",
    detailRoute: (id) => `/keluarga-berencana/${id}`,
    reviseRoute: (id) => `/keluarga-berencana/${id}/edit`,
  },
  imunisasi: {
    label: "Imunisasi",
    detailRoute: (id) => `/imunisasi/${id}`,
    reviseRoute: (id) => `/imunisasi/${id}/edit`,
  },
};

const normalizeModuleKey = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  switch (normalized) {
    case "kehamilan":
    case "pemeriksaan_kehamilan":
    case "pemeriksaan-kehamilan":
      return "kehamilan";
    case "persalinan":
      return "persalinan";
    case "kb":
    case "keluarga_berencana":
    case "keluarga-berencana":
      return "keluarga-berencana";
    case "imunisasi":
      return "imunisasi";
    case "legacy":
    case "health_data":
    case "health-data":
      return "legacy";
    default:
      return normalized || "legacy";
  }
};

const getModuleMeta = (moduleKey) => MODULE_META[moduleKey] || MODULE_META.legacy;

const normalizeRejectedItems = (items = []) =>
  items
    .map((item) => {
      const id = item.id || item.data_id;
      const moduleKey = normalizeModuleKey(item.module || item.jenis_data);
      const moduleMeta = getModuleMeta(moduleKey);
      const verifierName =
        item.verifier?.full_name ||
        item.verifier_name ||
        item.verifier?.name ||
        "-";

      return {
        id,
        moduleKey,
        moduleLabel: moduleMeta.label,
        patientName:
          item.pasien_nama ||
          item.nama_pasien ||
          item.pasien?.nama ||
          "-",
        patientNik: item.pasien_nik || item.pasien?.nik || "-",
        verifierName,
        practiceName:
          item.practice_place?.nama_praktik ||
          item.practice_place_name ||
          item.practice_name ||
          "-",
        villageName:
          item.practice_place?.village?.nama_desa ||
          item.village?.nama_desa ||
          item.village_name ||
          "-",
        status: item.status_verifikasi || "REJECTED",
        rejectReason: item.alasan_penolakan || "",
        rejectedAt: item.tanggal_verifikasi || item.tanggal_update || item.updated_at,
        detailRoute: id ? moduleMeta.detailRoute(id) : null,
        reviseRoute: id ? moduleMeta.reviseRoute(id) : null,
      };
    })
    .sort((a, b) => new Date(b.rejectedAt || 0) - new Date(a.rejectedAt || 0));

const RejectedDataList = () => {
  const [rejectedData, setRejectedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ search: "", nik: "", tanggal_start: "", tanggal_end: "", bulan: "" });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!isBidanPraktik(user)) {
      navigate("/");
      return;
    }

    fetchRejectedData();
  }, [user, navigate]);

  const fetchRejectedData = async (overrideFilter = filter) => {
    try {
      setLoading(true);
      setError("");
      const params = { ...overrideFilter };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });
      const response = await getRejectedData(params);
      setRejectedData(normalizeRejectedItems(response.data || []));
    } catch (err) {
      setError("Gagal memuat data yang ditolak");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRejectedData();
  };

  const handleReset = () => {
    const resetFilter = { search: "", nik: "", tanggal_start: "", tanggal_end: "", bulan: "" };
    setFilter(resetFilter);
    fetchRejectedData(resetFilter);
  };

  const filteredData = rejectedData;

  const columns = [
    {
      key: "patientName",
      label: "Nama Pasien",
      sortable: true,
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
    {
      key: "patientNik",
      label: "NIK",
      render: (value) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>{value}</span>
      ),
    },
    {
      key: "moduleLabel",
      label: "Modul",
      render: (value) => (
        <span className="rd-module-badge">{value}</span>
      ),
    },
    {
      key: "rejectReason",
      label: "Alasan Penolakan",
      render: (value) => (
        <span style={{ color: value ? "#252523" : "#a9b8a4" }}>
          {value || "—"}
        </span>
      ),
    },
    {
      key: "verifierName",
      label: "Diverifikasi Oleh",
      render: (value) => value || "-",
    },
    {
      key: "rejectedAt",
      label: "Tanggal Ditolak",
      sortable: true,
      render: (value) => formatDateTime(value),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "actions",
      label: "Aksi",
      render: (_, row) => (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => row.detailRoute && navigate(row.detailRoute)}
            disabled={!row.detailRoute}
          >
            Detail
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => row.reviseRoute && navigate(row.reviseRoute)}
            disabled={!row.reviseRoute}
          >
            Revisi
          </Button>
        </div>
      ),
    },
  ];

  const summaryCards = useMemo(() => {
    const uniqueModules = new Set(rejectedData.map((item) => item.moduleLabel)).size;
    const withReasonCount = rejectedData.filter((item) => Boolean(item.rejectReason))
      .length;

    return [
      {
        label: "Total Ditolak",
        value: rejectedData.length,
        note: "siap ditindaklanjuti",
      },
      {
        label: "Hasil Filter",
        value: filteredData.length,
        note: "data yang sedang tampil",
      },
      {
        label: "Modul",
        value: uniqueModules,
        note: "asal data revisi",
      },
      {
        label: "Ada Alasan",
        value: withReasonCount,
        note: "catatan penolakan terisi",
      },
    ];
  }, [filteredData.length, rejectedData]);

  return (
    <div className="rejected-data-list-page">
      <PageHeader
        title="Data Ditolak - Revisi"
        subtitle="Data yang ditolak dari semua modul pelayanan dan memerlukan perbaikan"
        actions={
          <Button variant="secondary" onClick={() => navigate("/")}>
            Kembali ke Dashboard
          </Button>
        }
      />

      {/* Stats Section */}
      <div className="rd-stat-row">
        {summaryCards.map((card) => (
          <div key={card.label} className="rd-stat-card">
            <span className="rd-stat-label">{card.label}</span>
            <span className="rd-stat-value">{card.value}</span>
            <span className="rd-stat-note">{card.note}</span>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div className="rd-filter-box">
        <h3 className="rd-filter-title">Filter Data Ditolak</h3>
        <p className="rd-filter-sub">Persempit berdasarkan nama, NIK, bulan, atau rentang tanggal</p>
        <form onSubmit={handleSearch} className="rd-filter-grid">
          <Input
            label="Cari Nama / Modul"
            type="text"
            placeholder="Nama pasien, modul, verifier..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
          <Input
            label="Cari NIK"
            type="text"
            placeholder="Nomor Induk Kependudukan..."
            value={filter.nik}
            onChange={(e) => setFilter({ ...filter, nik: e.target.value })}
          />
          <div className="input-wrapper">
            <label className="input-label" htmlFor="rd-bulan">Bulan</label>
            <select
              id="rd-bulan"
              className="rd-filter-select"
              value={filter.bulan}
              onChange={(e) => setFilter({ ...filter, bulan: e.target.value })}
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          <Input
            label="Dari Tanggal"
            type="date"
            value={filter.tanggal_start}
            onChange={(e) => setFilter({ ...filter, tanggal_start: e.target.value })}
          />
          <Input
            label="Sampai Tanggal"
            type="date"
            value={filter.tanggal_end}
            onChange={(e) => setFilter({ ...filter, tanggal_end: e.target.value })}
          />
          <div className="filter-actions">
            <Button type="submit" variant="primary">
              Cari
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="rd-list-box">
        <div className="list-header">
          <div>
            <h3 className="list-title">Daftar Data Ditolak</h3>
            <p className="list-subtitle">
              {filteredData.length} dari {rejectedData.length} data ditampilkan
            </p>
          </div>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : filteredData.length === 0 ? (
          <EmptyState
            message={
              rejectedData.length === 0
                ? "Belum ada data yang ditolak"
                : "Tidak ada data yang cocok dengan pencarian"
            }
          />
        ) : (
          <Table
            columns={columns}
            data={filteredData}
            className="rejected-data-table"
          />
        )}
      </div>
    </div>
  );
};



export default RejectedDataList;
