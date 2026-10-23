// Auth context and hook live apart from AuthProvider so that AuthContext.tsx exports
// only components (required by React Fast Refresh, see eslint react-refresh/only-export-components).
import { createContext, useContext } from "react";
import type { LoginResponse } from "../shared/types";

export interface AuthContextValue {
  auth: LoginResponse | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
