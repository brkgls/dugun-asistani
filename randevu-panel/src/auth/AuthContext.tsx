// Centralizes session state so features can read `auth`/call `logout()` without prop-drilling
// through App.tsx. Session bootstrap still lives here: loads any saved token on first render,
// and wires apiFetch's 401 handler back to clearing the session.
// The context object and useAuth() hook live in ./useAuth.
import { useEffect, useState, type ReactNode } from "react";
import { clearAuth, loadAuth, saveAuth, setSessionExpiredHandler } from "../api/client";
import type { LoginResponse } from "../shared/types";
import { AuthContext, type AuthContextValue } from "./useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<LoginResponse | null>(() => loadAuth());

  useEffect(() => {
    setSessionExpiredHandler(() => setAuth(null));
    return () => setSessionExpiredHandler(null);
  }, []);

  function login(data: LoginResponse) {
    saveAuth(data);
    setAuth(data);
  }

  function logout() {
    clearAuth();
    setAuth(null);
  }

  const value: AuthContextValue = {
    auth,
    isAdmin: auth?.role === "ADMIN",
    isSuperAdmin: auth?.role === "SUPER_ADMIN",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
