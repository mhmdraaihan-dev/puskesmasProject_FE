/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  logoutUser,
  getStoredAccessToken,
  getStoredUser,
  saveAuthSession,
  clearAuthSession,
  resetAuthFailureState,
  setAuthFailureHandler,
  isSessionTerminationError,
} from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearClientAuth = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const redirectToLogin = useCallback(
    (sessionMessage) => {
      navigate("/login", {
        replace: true,
        state: sessionMessage ? { sessionMessage } : undefined,
      });
    },
    [navigate],
  );

  useEffect(() => {
    const savedUser = getStoredUser();
    const token = getStoredAccessToken();

    if (savedUser && token) {
      setUser(savedUser);
    } else {
      clearAuthSession();
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    setAuthFailureHandler((sessionMessage) => {
      clearClientAuth();
      redirectToLogin(sessionMessage || "Sesi berakhir. Silakan login kembali.");
    });

    return () => {
      setAuthFailureHandler(null);
    };
  }, [clearClientAuth, redirectToLogin]);

  const login = async (credentials) => {
    resetAuthFailureState();
    clearAuthSession();

    try {
      const response = await loginUser(credentials);

      // Backend response structure: { success: true, data: { token: "...", user: {...} } }
      if (response.success && response.data?.token && response.data?.user) {
        saveAuthSession(response.data.token, response.data.user);
        setUser(response.data.user);
        return { success: true };
      }

      return {
        success: false,
        error: response.message || "Invalid response from server",
      };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      };
    }
  };

  const logout = async () => {
    resetAuthFailureState();

    try {
      if (getStoredAccessToken()) {
        await logoutUser();
      }
    } catch (error) {
      if (!isSessionTerminationError(error)) {
        console.error("Logout failed:", error);
      }
    } finally {
      clearClientAuth();
      redirectToLogin("Logout berhasil.");
    }

    return { success: true };
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!getStoredAccessToken(),
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "var(--color-text-main)",
        }}
      >
        Loading Application...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
