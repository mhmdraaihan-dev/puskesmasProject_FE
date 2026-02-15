import axios from "axios";

const api = axios.create({
  baseURL: "/api", // This will be proxied by Vite
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const loginUser = async (credentials) => {
  const response = await api.post("/login", credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await api.patch(`/users/${userId}/status`, {
    status_user: status,
  });
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const response = await api.patch(`/users/${userId}/password`, {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
};

export const resetPasswordByAdmin = async (userId, newPassword) => {
  const response = await api.post(`/users/${userId}/reset-password`, {
    new_password: newPassword,
  });
  return response.data;
};

// ==================== VILLAGE API ====================
export const createVillage = async (villageData) => {
  const response = await api.post("/village", villageData);
  return response.data;
};

export const getVillages = async () => {
  const response = await api.get("/village");
  return response.data;
};

export const getVillageById = async (villageId) => {
  const response = await api.get(`/village/${villageId}`);
  return response.data;
};

export const updateVillage = async (villageId, villageData) => {
  const response = await api.put(`/village/${villageId}`, villageData);
  return response.data;
};

export const deleteVillage = async (villageId) => {
  const response = await api.delete(`/village/${villageId}`);
  return response.data;
};

// ==================== PRACTICE PLACE API ====================
export const createPracticePlace = async (practicePlaceData) => {
  const response = await api.post("/practice-place", practicePlaceData);
  return response.data;
};

export const getPracticePlaces = async () => {
  const response = await api.get("/practice-place");
  return response.data;
};

export const getPracticePlacesByVillage = async (villageId) => {
  const response = await api.get(`/practice-place/village/${villageId}`);
  return response.data;
};

export const getPracticePlaceById = async (practiceId) => {
  const response = await api.get(`/practice-place/${practiceId}`);
  return response.data;
};

export const updatePracticePlace = async (practiceId, practicePlaceData) => {
  const response = await api.put(
    `/practice-place/${practiceId}`,
    practicePlaceData,
  );
  return response.data;
};

export const deletePracticePlace = async (practiceId) => {
  const response = await api.delete(`/practice-place/${practiceId}`);
  return response.data;
};

// ==================== HEALTH DATA API ====================
export const createHealthData = async (healthData) => {
  const response = await api.post("/health-data", healthData);
  return response.data;
};

export const getHealthData = async (params = {}) => {
  const response = await api.get("/health-data", { params });
  return response.data;
};

export const getHealthDataById = async (dataId) => {
  const response = await api.get(`/health-data/${dataId}`);
  return response.data;
};

export const updateHealthData = async (dataId, healthData) => {
  const response = await api.put(`/health-data/${dataId}`, healthData);
  return response.data;
};

export const deleteHealthData = async (dataId) => {
  const response = await api.delete(`/health-data/${dataId}`);
  return response.data;
};

// ==================== REVISION WORKFLOW API ====================
export const reviseRejectedData = async (dataId, healthData) => {
  const response = await api.put(`/health-data/${dataId}/revise`, healthData);
  return response.data;
};

export const getRejectedData = async () => {
  const response = await api.get("/health-data-rejected");
  return response.data;
};

// ==================== VERIFICATION WORKFLOW API ====================
export const approveHealthData = async (dataId) => {
  const response = await api.patch(`/health-data/${dataId}/approve`);
  return response.data;
};

export const rejectHealthData = async (dataId, alasanPenolakan) => {
  const response = await api.patch(`/health-data/${dataId}/reject`, {
    alasan_penolakan: alasanPenolakan,
  });
  return response.data;
};

// ==================== PEMERIKSAAN KEHAMILAN API ====================
export const getKehamilanList = async (params = {}) => {
  const response = await api.get("/pemeriksaan-kehamilan", { params });
  return response.data;
};

export const getKehamilanDetail = async (id) => {
  const response = await api.get(`/pemeriksaan-kehamilan/${id}`);
  return response.data;
};

export const createKehamilan = async (data) => {
  const response = await api.post("/pemeriksaan-kehamilan", data);
  return response.data;
};

export const updateKehamilan = async (id, data) => {
  const response = await api.put(`/pemeriksaan-kehamilan/${id}`, data);
  return response.data;
};

export const deleteKehamilan = async (id) => {
  const response = await api.delete(`/pemeriksaan-kehamilan/${id}`);
  return response.data;
};

export const verifyKehamilan = async (id, { status, alasan }) => {
  const response = await api.patch(`/pemeriksaan-kehamilan/${id}/verify`, {
    status,
    alasan,
  });
  return response.data;
};

// ==================== PERSALINAN API ====================
export const getPersalinanList = async (params = {}) => {
  const response = await api.get("/persalinan", { params });
  return response.data;
};

export const getPersalinanDetail = async (id) => {
  const response = await api.get(`/persalinan/${id}`);
  return response.data;
};

export const createPersalinan = async (data) => {
  const response = await api.post("/persalinan", data);
  return response.data;
};

export const updatePersalinan = async (id, data) => {
  const response = await api.put(`/persalinan/${id}`, data);
  return response.data;
};

export const deletePersalinan = async (id) => {
  const response = await api.delete(`/persalinan/${id}`);
  return response.data;
};

export const verifyPersalinan = async (id, { status, alasan }) => {
  const response = await api.patch(`/persalinan/${id}/verify`, {
    status,
    alasan,
  });
  return response.data;
};

// ==================== KELUARGA BERENCANA API ====================
export const getKBList = async (params = {}) => {
  const response = await api.get("/keluarga-berencana", { params });
  return response.data;
};

export const getKBDetail = async (id) => {
  const response = await api.get(`/keluarga-berencana/${id}`);
  return response.data;
};

export const createKB = async (data) => {
  const response = await api.post("/keluarga-berencana", data);
  return response.data;
};

export const updateKB = async (id, data) => {
  const response = await api.put(`/keluarga-berencana/${id}`, data);
  return response.data;
};

export const deleteKB = async (id) => {
  const response = await api.delete(`/keluarga-berencana/${id}`);
  return response.data;
};

export const verifyKB = async (id, { status, alasan }) => {
  const response = await api.patch(`/keluarga-berencana/${id}/verify`, {
    status,
    alasan,
  });
  return response.data;
};

// ==================== IMUNISASI API ====================
export const getImunisasiList = async (params = {}) => {
  const response = await api.get("/imunisasi", { params });
  return response.data;
};

export const getImunisasiDetail = async (id) => {
  const response = await api.get(`/imunisasi/${id}`);
  return response.data;
};

export const createImunisasi = async (data) => {
  const response = await api.post("/imunisasi", data);
  return response.data;
};

export const updateImunisasi = async (id, data) => {
  const response = await api.put(`/imunisasi/${id}`, data);
  return response.data;
};

export const deleteImunisasi = async (id) => {
  const response = await api.delete(`/imunisasi/${id}`);
  return response.data;
};

export const verifyImunisasi = async (id, { status, alasan }) => {
  const response = await api.patch(`/imunisasi/${id}/verify`, {
    status,
    alasan,
  });
  return response.data;
};

// ==================== MASTER PASIEN API ====================
export const getPasienList = async (params = {}) => {
  const response = await api.get("/pasien", { params });
  return response.data;
};

export const getPasienDetail = async (id) => {
  const response = await api.get(`/pasien/${id}`);
  return response.data;
};

export const createPasien = async (data) => {
  const response = await api.post("/pasien", data);
  return response.data;
};

export const updatePasien = async (id, data) => {
  const response = await api.put(`/pasien/${id}`, data);
  return response.data;
};

export const deletePasien = async (id) => {
  const response = await api.delete(`/pasien/${id}`);
  return response.data;
};

// ==================== REPORTS & EXPORT API ====================
// ==================== REPORTS & EXPORT API ====================
export const exportKehamilanData = async (params = {}) => {
  const response = await api.get("/reports/pemeriksaan-kehamilan/export", {
    params,
    responseType: "blob",
  });
  return response;
};

export const exportKehamilanPDF = async (params = {}) => {
  const response = await api.get("/reports/pemeriksaan-kehamilan/export-pdf", {
    params,
    responseType: "blob",
  });
  return response;
};

export const exportPersalinanData = async (params = {}) => {
  const response = await api.get("/reports/persalinan/export", {
    params,
    responseType: "blob",
  });
  return response;
};

export const exportPersalinanPDF = async (params = {}) => {
  const response = await api.get("/reports/persalinan/export-pdf", {
    params,
    responseType: "blob",
  });
  return response;
};

export const exportKBData = async (params = {}) => {
  const response = await api.get("/reports/keluarga-berencana/export", {
    params,
    responseType: "blob",
  });
  return response;
};

export const exportKBPDF = async (params = {}) => {
  const response = await api.get("/reports/keluarga-berencana/export-pdf", {
    params,
    responseType: "blob",
  });
  return response;
};

export const exportImunisasiData = async (params = {}) => {
  const response = await api.get("/reports/imunisasi/export", {
    params,
    responseType: "blob",
  });
  return response;
};

export const exportImunisasiPDF = async (params = {}) => {
  const response = await api.get("/reports/imunisasi/export-pdf", {
    params,
    responseType: "blob",
  });
  return response;
};

// Generic export function for future modules
export const exportModuleData = async (module, params = {}) => {
  const response = await api.get(`/reports/${module}/export`, {
    params,
    responseType: "blob",
  });
  return response;
};

export default api;
