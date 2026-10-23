import { useState } from "react";
import { login } from "../api/auth";
import { useAuth } from "./useAuth";
import { useT } from "../shared/i18n/i18nContext";
import { Banner, Button, Card, TextField } from "../shared/components";
import { ApiError } from "../shared/errors/ApiError";

export function LoginPage() {
  const { login: onLogin } = useAuth();
  const { t } = useT();
  const [phone, setPhone] = useState(() => localStorage.getItem("saved_phone") ?? "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem("saved_phone")));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    try {
      const data = await login(phone, password);
      if (rememberMe) {
        localStorage.setItem("saved_phone", phone);
      } else {
        localStorage.removeItem("saved_phone");
      }
      onLogin(data);
    } catch (e) {
      setError(e instanceof ApiError && e.is(401) ? t((l) => l.auth.loginError) : t((l) => l.common.error));
    }
  }

  return (
    <div className="min-h-dvh px-6">
      <Card className="w-full max-w-[340px] mx-auto mt-24 p-10">
        <h1
          className="text-[28px] font-extralight text-center mb-8 bg-clip-text text-transparent"
          style={{ background: "linear-gradient(90deg, #8b5cf6, #3b82f6)", WebkitBackgroundClip: "text" }}
        >
          {t((l) => l.auth.title)}
        </h1>

        <div className="flex flex-col gap-4">
          <TextField
            placeholder={t((l) => l.auth.phonePlaceholder)}
            value={phone}
            onChange={(e) => setPhone(e.target.value.trim())}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />

          <TextField
            placeholder={t((l) => l.auth.passwordPlaceholder)}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            autoComplete="current-password"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            trailing={
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? t((l) => l.auth.hidePassword) : t((l) => l.auth.showPassword)}
              </Button>
            }
          />

          <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#6b7280] select-none px-1">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-[#3b82f6] cursor-pointer"
            />
            {t((l) => l.auth.rememberMe)}
          </label>

          <Button onClick={handleLogin} fullWidth>
            {t((l) => l.auth.loginButton)}
          </Button>

          {error && <Banner variant="error">{error}</Banner>}
        </div>
      </Card>
    </div>
  );
}
