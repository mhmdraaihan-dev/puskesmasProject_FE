import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserList from "./pages/UserList";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./pages/ResetPassword";
import LeavePage from "./pages/Leaves/LeavePage";

// Village Management
import VillageList from "./pages/Villages/VillageList";
import VillageForm from "./pages/Villages/VillageForm";
import VillageDetail from "./pages/Villages/VillageDetail";

// Practice Place Management
import PracticePlaceList from "./pages/PracticePlaces/PracticePlaceList";
import PracticePlaceForm from "./pages/PracticePlaces/PracticePlaceForm";
import PracticePlaceDetail from "./pages/PracticePlaces/PracticePlaceDetail";

// Health Data Management
import HealthDataList from "./pages/HealthData/HealthDataList";
import HealthDataForm from "./pages/HealthData/HealthDataForm";
import HealthDataDetail from "./pages/HealthData/HealthDataDetail";

// Master Pasien Management
import PasienList from "./pages/Pasien/PasienList";
import PasienForm from "./pages/Pasien/PasienForm";
import PasienDetail from "./pages/Pasien/PasienDetail";

// Pemeriksaan Kehamilan Management

// Verification Workflow
import PendingDataList from "./pages/Verification/PendingDataList";

// Revision Workflow
import RejectedDataList from "./pages/Revision/RejectedDataList";
import RevisionForm from "./pages/Revision/RevisionForm";

// Pemeriksaan Kehamilan Management
import PemeriksaanKehamilanList from "./pages/PemeriksaanKehamilan/PemeriksaanKehamilanList";
import PemeriksaanKehamilanForm from "./pages/PemeriksaanKehamilan/PemeriksaanKehamilanForm";
import PemeriksaanKehamilanDetail from "./pages/PemeriksaanKehamilan/PemeriksaanKehamilanDetail";

// Persalinan Management
import PersalinanList from "./pages/Persalinan/PersalinanList";
import PersalinanForm from "./pages/Persalinan/PersalinanForm";
import PersalinanDetail from "./pages/Persalinan/PersalinanDetail";

// Keluarga Berencana Management
import KBList from "./pages/KeluargaBerencana/KBList";
import KBForm from "./pages/KeluargaBerencana/KBForm";
import KBDetail from "./pages/KeluargaBerencana/KBDetail";

// Imunisasi Management
import ImunisasiList from "./pages/Imunisasi/ImunisasiList";
import ImunisasiForm from "./pages/Imunisasi/ImunisasiForm";
import ImunisasiDetail from "./pages/Imunisasi/ImunisasiDetail";

// Rekapitulasi Reporting
import RekapitulasiPage from "./pages/Rekapitulasi/RekapitulasiPage";
import { POSITIONS } from "./utils/roleHelpers";

import "./App.css";

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  allowedPositions = [],
}) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedPositions.length > 0 &&
    !allowedPositions.includes(user?.position_user)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* User Management */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-user"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AddUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-user/:userId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <EditUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password/:userId"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset-password/:userId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ResetPassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:userId/leaves"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <LeavePage />
              </ProtectedRoute>
            }
          />

          {/* Village Management */}
          <Route
            path="/villages"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <VillageList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/villages/add"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <VillageForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/villages/:villageId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <VillageDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/villages/:villageId/edit"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <VillageForm />
              </ProtectedRoute>
            }
          />

          {/* Practice Place Management */}
          <Route
            path="/practice-places"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PracticePlaceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice-places/add"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PracticePlaceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice-places/:practiceId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PracticePlaceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice-places/:practiceId/edit"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PracticePlaceForm />
              </ProtectedRoute>
            }
          />

          {/* Health Data Management */}
          <Route
            path="/health-data"
            element={
              <ProtectedRoute>
                <HealthDataList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-data/add"
            element={
              <ProtectedRoute>
                <HealthDataForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-data/:dataId"
            element={
              <ProtectedRoute>
                <HealthDataDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-data/:dataId/edit"
            element={
              <ProtectedRoute>
                <HealthDataForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/health-data/:dataId/edit"
            element={
              <ProtectedRoute>
                <HealthDataForm />
              </ProtectedRoute>
            }
          />

          {/* Master Pasien Management */}
          <Route
            path="/pasien"
            element={
              <ProtectedRoute>
                <PasienList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pasien/add"
            element={
              <ProtectedRoute>
                <PasienForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pasien/:id"
            element={
              <ProtectedRoute>
                <PasienDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pasien/:id/edit"
            element={
              <ProtectedRoute>
                <PasienForm />
              </ProtectedRoute>
            }
          />

          {/* Pemeriksaan Kehamilan Management */}
          <Route
            path="/pemeriksaan-kehamilan"
            element={
              <ProtectedRoute>
                <PemeriksaanKehamilanList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pemeriksaan-kehamilan/add"
            element={
              <ProtectedRoute
                allowedPositions={[POSITIONS.BIDAN_PRAKTIK]}
              >
                <PemeriksaanKehamilanForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pemeriksaan-kehamilan/:id"
            element={
              <ProtectedRoute>
                <PemeriksaanKehamilanDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pemeriksaan-kehamilan/:id/edit"
            element={
              <ProtectedRoute
                allowedPositions={[POSITIONS.BIDAN_PRAKTIK]}
              >
                <PemeriksaanKehamilanForm />
              </ProtectedRoute>
            }
          />

          {/* Persalinan Management */}
          <Route
            path="/persalinan"
            element={
              <ProtectedRoute>
                <PersalinanList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/persalinan/add"
            element={
              <ProtectedRoute
                allowedPositions={[POSITIONS.BIDAN_PRAKTIK]}
              >
                <PersalinanForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/persalinan/:id"
            element={
              <ProtectedRoute>
                <PersalinanDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/persalinan/:id/edit"
            element={
              <ProtectedRoute
                allowedPositions={[POSITIONS.BIDAN_PRAKTIK]}
              >
                <PersalinanForm />
              </ProtectedRoute>
            }
          />

          {/* Keluarga Berencana Management */}
          <Route
            path="/keluarga-berencana"
            element={
              <ProtectedRoute>
                <KBList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/keluarga-berencana/add"
            element={
              <ProtectedRoute
                allowedPositions={[POSITIONS.BIDAN_PRAKTIK]}
              >
                <KBForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/keluarga-berencana/:id"
            element={
              <ProtectedRoute>
                <KBDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/keluarga-berencana/:id/edit"
            element={
              <ProtectedRoute
                allowedPositions={[POSITIONS.BIDAN_PRAKTIK]}
              >
                <KBForm />
              </ProtectedRoute>
            }
          />

          {/* Imunisasi Management */}
          <Route
            path="/imunisasi"
            element={
              <ProtectedRoute>
                <ImunisasiList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/imunisasi/add"
            element={
              <ProtectedRoute
                allowedPositions={[POSITIONS.BIDAN_PRAKTIK]}
              >
                <ImunisasiForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/imunisasi/:id"
            element={
              <ProtectedRoute>
                <ImunisasiDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/imunisasi/:id/edit"
            element={
              <ProtectedRoute
                allowedPositions={[POSITIONS.BIDAN_PRAKTIK]}
              >
                <ImunisasiForm />
              </ProtectedRoute>
            }
          />

          {/* Verification Workflow */}
          <Route
            path="/verification/pending"
            element={
              <ProtectedRoute
                allowedPositions={[
                  POSITIONS.BIDAN_DESA,
                  POSITIONS.BIDAN_KOORDINATOR,
                ]}
              >
                <PendingDataList />
              </ProtectedRoute>
            }
          />

          {/* Revision Workflow */}
          <Route
            path="/revision/rejected"
            element={
              <ProtectedRoute>
                <RejectedDataList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revision/:dataId/revise"
            element={
              <ProtectedRoute>
                <RevisionForm />
              </ProtectedRoute>
            }
          />

          {/* Rekapitulasi Reporting */}
          <Route
            path="/rekapitulasi"
            element={
              <ProtectedRoute
                allowedPositions={[POSITIONS.BIDAN_KOORDINATOR]}
              >
                <RekapitulasiPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
