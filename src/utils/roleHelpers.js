// Role-based access control utilities

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const POSITIONS = {
  BIDAN_PRAKTIK: "bidan_praktik",
  BIDAN_DESA: "bidan_desa",
  BIDAN_KOORDINATOR: "bidan_koordinator",
};

export const VERIFICATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const JENIS_DATA = {
  IBU_HAMIL: "ibu_hamil",
  IBU_BERSALIN: "ibu_bersalin",
  IBU_NIFAS: "ibu_nifas",
  BAYI: "bayi",
  BALITA: "balita",
};

// Check if user is admin
export const isAdmin = (user) => {
  return user?.role === ROLES.ADMIN;
};

// Check if user is bidan praktik
export const isBidanPraktik = (user) => {
  return user?.position_user === POSITIONS.BIDAN_PRAKTIK;
};

// Check if user is bidan desa
export const isBidanDesa = (user) => {
  return user?.position_user === POSITIONS.BIDAN_DESA;
};

// Check if user is bidan koordinator
export const isBidanKoordinator = (user) => {
  return user?.position_user === POSITIONS.BIDAN_KOORDINATOR;
};

// Check if user can edit health data
export const canEditHealthData = (user, healthData) => {
  // Only owner can edit, and only if status is PENDING
  return (
    healthData.status_verifikasi === VERIFICATION_STATUS.PENDING &&
    healthData.practice_place?.user_id === user?.user_id
  );
};

// Check if user can delete health data
export const canDeleteHealthData = (user, healthData) => {
  // Only owner can delete, and only if status is PENDING
  return (
    healthData.status_verifikasi === VERIFICATION_STATUS.PENDING &&
    healthData.practice_place?.user_id === user?.user_id
  );
};

// Check if user can verify health data
export const canVerifyHealthData = (user) => {
  // Only bidan desa can verify
  return isBidanDesa(user);
};

// Check if user can revise rejected data
export const canReviseHealthData = (user, healthData) => {
  // Only owner can revise, and only if status is REJECTED
  return (
    healthData.status_verifikasi === VERIFICATION_STATUS.REJECTED &&
    healthData.practice_place?.user_id === user?.user_id
  );
};

// Get position label
export const getPositionLabel = (position) => {
  const labels = {
    [POSITIONS.BIDAN_PRAKTIK]: "Bidan Praktik",
    [POSITIONS.BIDAN_DESA]: "Bidan Desa",
    [POSITIONS.BIDAN_KOORDINATOR]: "Bidan Koordinator",
  };
  return labels[position] || position;
};

// Get jenis data label
export const getJenisDataLabel = (jenisData) => {
  const labels = {
    [JENIS_DATA.IBU_HAMIL]: "Ibu Hamil",
    [JENIS_DATA.IBU_BERSALIN]: "Ibu Bersalin",
    [JENIS_DATA.IBU_NIFAS]: "Ibu Nifas",
    [JENIS_DATA.BAYI]: "Bayi",
    [JENIS_DATA.BALITA]: "Balita",
    pemeriksaan_kehamilan: "Pemeriksaan Kehamilan",
    persalinan: "Persalinan",
    keluarga_berencana: "Keluarga Berencana",
    imunisasi: "Imunisasi",
    // API Feed types (Uppercase)
    KEHAMILAN: "Pemeriksaan Kehamilan",
    PERSALINAN: "Persalinan",
    KB: "Keluarga Berencana",
    IMUNISASI: "Imunisasi",
  };
  return labels[jenisData] || jenisData;
};

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    [VERIFICATION_STATUS.PENDING]: "Menunggu Verifikasi",
    [VERIFICATION_STATUS.APPROVED]: "Disetujui",
    [VERIFICATION_STATUS.REJECTED]: "Ditolak",
  };
  return labels[status] || status;
};

// Check if user can edit kehamilan data
export const canEditKehamilan = (user, data) => {
  // Only owner can edit, and only if status is REJECTED
  // We check practice_id or user ownership. Assuming data has practice_id and user has practice_id or similar.
  // However, looking at HealthData logic: data.practice_place?.user_id === user?.user_id
  // We will use the same logic if possible.
  const isOwner =
    data.practice_place?.user_id === user?.user_id ||
    (user?.practice_id && data.practice_id === user.practice_id);

  return data.status_verifikasi === VERIFICATION_STATUS.REJECTED && isOwner;
};

// Check if user can delete kehamilan data
export const canDeleteKehamilan = (user, data) => {
  const isOwner =
    data.practice_place?.user_id === user?.user_id ||
    (user?.practice_id && data.practice_id === user.practice_id);
  const allowedStatuses = [
    VERIFICATION_STATUS.PENDING,
    VERIFICATION_STATUS.REJECTED,
  ];

  return allowedStatuses.includes(data.status_verifikasi) && isOwner;
};

// Check if user can verify kehamilan data
export const canVerifyKehamilan = (user) => {
  return isBidanDesa(user) || isBidanKoordinator(user);
};

// Check if user can edit persalinan data
export const canEditPersalinan = (user, data) => {
  const isOwner =
    data.practice_place?.user_id === user?.user_id ||
    (user?.practice_id && data.practice_id === user.practice_id);

  return data.status_verifikasi === VERIFICATION_STATUS.REJECTED && isOwner;
};

// Check if user can delete persalinan data
export const canDeletePersalinan = (user, data) => {
  const isOwner =
    data.practice_place?.user_id === user?.user_id ||
    (user?.practice_id && data.practice_id === user.practice_id);
  const allowedStatuses = [
    VERIFICATION_STATUS.PENDING,
    VERIFICATION_STATUS.REJECTED,
  ];

  return allowedStatuses.includes(data.status_verifikasi) && isOwner;
};

// Check if user can verify persalinan data
export const canVerifyPersalinan = (user) => {
  return isBidanDesa(user) || isBidanKoordinator(user);
};

// Check if user can edit KB data
export const canEditKB = (user, data) => {
  const isOwner =
    data.practice_place?.user_id === user?.user_id ||
    (user?.practice_id && data.practice_id === user.practice_id);

  return data.status_verifikasi === VERIFICATION_STATUS.REJECTED && isOwner;
};

// Check if user can delete KB data
export const canDeleteKB = (user, data) => {
  const isOwner =
    data.practice_place?.user_id === user?.user_id ||
    (user?.practice_id && data.practice_id === user.practice_id);
  const allowedStatuses = [
    VERIFICATION_STATUS.PENDING,
    VERIFICATION_STATUS.REJECTED,
  ];

  return allowedStatuses.includes(data.status_verifikasi) && isOwner;
};

// Check if user can verify KB data
export const canVerifyKB = (user) => {
  return isBidanDesa(user) || isBidanKoordinator(user);
};

// Check if user can edit Imunisasi data
export const canEditImunisasi = (user, data) => {
  const isOwner =
    data.practice_place?.user_id === user?.user_id ||
    (user?.practice_id && data.practice_id === user.practice_id);

  return data.status_verifikasi === VERIFICATION_STATUS.REJECTED && isOwner;
};

// Check if user can delete Imunisasi data
export const canDeleteImunisasi = (user, data) => {
  const isOwner =
    data.practice_place?.user_id === user?.user_id ||
    (user?.practice_id && data.practice_id === user.practice_id);
  const allowedStatuses = [
    VERIFICATION_STATUS.PENDING,
    VERIFICATION_STATUS.REJECTED,
  ];

  return allowedStatuses.includes(data.status_verifikasi) && isOwner;
};

// Check if user can verify Imunisasi data
export const canVerifyImunisasi = (user) => {
  return isBidanDesa(user) || isBidanKoordinator(user);
};
