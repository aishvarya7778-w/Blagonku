import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api, setAccessToken } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .post("/auth/refresh")
      .then((data) => {
        setAccessToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => setAccessToken(""))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const data = await api.post("/auth/login", credentials);
    setAccessToken(data.accessToken);
    setUser(data.user);
    toast.success("Welcome back to Blagonku");
  };

  const signup = async (payload) => {
    const data = await api.post("/auth/signup", payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    toast.success("Your Blagonku account is ready");
  };

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setAccessToken("");
    setUser(null);
    toast.success("Logged out");
  };

  const syncBookmarks = (bookmarks) => {
    setUser((current) => (current ? { ...current, bookmarks } : current));
  };

  const value = useMemo(
    () => ({ user, setUser, loading, login, signup, logout, syncBookmarks }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
