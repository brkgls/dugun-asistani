import { useState, type FormEvent } from "react";
import { changePassword } from "../../api/users";
import { useResolveError } from "../../shared/errors";
import { useT } from "../../shared/i18n/i18nContext";
import { Banner, Button, TextField } from "../../shared/components";

export function ChangePassword() {
  const resolve = useResolveError();
  const { t } = useT();

  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setIsSuccess(false);

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setMsg(t((l) => l.profile.errors.allFieldsRequired));
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMsg(t((l) => l.profile.errors.passwordsMismatch));
      return;
    }
    if (form.newPassword.length < 6) {
      setMsg(t((l) => l.profile.errors.tooShort));
      return;
    }

    setLoading(true);
    try {
      await changePassword(form.oldPassword, form.newPassword);
      setIsSuccess(true);
      setMsg(t((l) => l.profile.success));
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setIsSuccess(false);
      setMsg(resolve(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto pb-8 antialiased">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{t((l) => l.profile.securityTitle)}</h1>
        <p className="text-xs text-gray-500 mt-1">{t((l) => l.profile.securitySubtitle)}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#f0f0f0] rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-800">{t((l) => l.profile.changePasswordTitle)}</h2>

        <TextField
          required
          type={showOld ? "text" : "password"}
          label={t((l) => l.profile.currentPassword)}
          value={form.oldPassword}
          onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
          placeholder="••••••••"
          trailing={
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowOld((v) => !v)}>
              {showOld ? t((l) => l.auth.hidePassword) : t((l) => l.auth.showPassword)}
            </Button>
          }
        />

        <TextField
          required
          type={showNew ? "text" : "password"}
          label={t((l) => l.profile.newPassword)}
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          placeholder={t((l) => l.profile.newPasswordPlaceholder)}
          trailing={
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowNew((v) => !v)}>
              {showNew ? t((l) => l.auth.hidePassword) : t((l) => l.auth.showPassword)}
            </Button>
          }
        />

        <TextField
          required
          type={showNew ? "text" : "password"}
          label={t((l) => l.profile.confirmPassword)}
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          placeholder={t((l) => l.profile.confirmPasswordPlaceholder)}
        />

        <Button type="submit" fullWidth isLoading={loading} className="mt-2">
          {loading ? t((l) => l.profile.updating) : t((l) => l.profile.updateButton)}
        </Button>

        {msg && <Banner variant={isSuccess ? "success" : "error"}>{msg}</Banner>}
      </form>
    </div>
  );
}
