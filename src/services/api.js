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

export const getPendingData = async () => {
  const response = await api.get("/health-data-pending");
  return response.data;
};

export default api;
