import { createContext, useEffect, useMemo, useState } from "react";
import { getMeRequest } from "../api/authApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (authToken, userData) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const response = await getMeRequest();
        const profile = response?.data || null;

        if (profile) {
          localStorage.setItem("user", JSON.stringify(profile));
          setUser(profile);
        }
      } catch (error) {
        logout();
      } finally {
        setIsAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthLoading,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
