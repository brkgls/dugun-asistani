import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../../api/settings";
import { useResolveError } from "../../shared/errors";
import { useT } from "../../shared/i18n/i18nContext";
import { Banner, Button, Skeleton, Switch, TextField, Textarea } from "../../shared/components";
import type { TenantSettings } from "../../shared/types";

export function SettingsView() {
  const resolve = useResolveError();
  const { t } = useT();

  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [form, setForm] = useState({
    displayName: "",
    greetingText: "",
    showPrices: true,
    waPhoneNumberId: "",
    waDisplayNumber: "",
    waAccessToken: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setForm({
        displayName: s.displayName,
        greetingText: s.greetingText ?? "",
        showPrices: s.showPrices,
        waPhoneNumberId: s.waPhoneNumberId,
        waDisplayNumber: s.waDisplayNumber,
        waAccessToken: "",
      });
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMsg("");
    try {
      const updated = await updateSettings({
        displayName: form.displayName,
        greetingText: form.greetingText,
        showPrices: form.showPrices,
        waPhoneNumberId: form.waPhoneNumberId,
        waDisplayNumber: form.waDisplayNumber,
        ...(form.waAccessToken ? { waAccessToken: form.waAccessToken } : {}),
      });
      setSettings(updated);
      setForm((prev) => ({ ...prev, waAccessToken: "" }));
      setIsSuccess(true);
      setMsg(t((l) => l.settings.saveSuccess));
    } catch (err) {
      setIsSuccess(false);
      setMsg(resolve(err));
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10" />
        <Skeleton className="h-24" />
        <Skeleton className="h-10" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto pb-8 antialiased">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{t((l) => l.settings.title)}</h1>
        <p className="text-xs text-gray-500 mt-1">{t((l) => l.settings.subtitle)}</p>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded-2xl p-5 shadow-sm space-y-4">
        <TextField
          label={t((l) => l.settings.displayName)}
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
        />

        <Textarea
          label={t((l) => l.settings.greetingText)}
          value={form.greetingText}
          onChange={(e) => setForm({ ...form, greetingText: e.target.value })}
          rows={3}
          placeholder={t((l) => l.settings.greetingHint)}
        />

        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-medium text-[#1c1c1e]">{t((l) => l.settings.showPrices)}</span>
          <Switch checked={form.showPrices} onChange={() => setForm({ ...form, showPrices: !form.showPrices })} />
        </div>

        <hr className="border-t border-gray-100" />

        <TextField
          label={t((l) => l.settings.waPhoneNumberId)}
          value={form.waPhoneNumberId}
          onChange={(e) => setForm({ ...form, waPhoneNumberId: e.target.value })}
        />
        <TextField
          label={t((l) => l.settings.waDisplayNumber)}
          value={form.waDisplayNumber}
          onChange={(e) => setForm({ ...form, waDisplayNumber: e.target.value })}
        />
        <TextField
          label={t((l) => l.settings.waAccessToken)}
          type="password"
          value={form.waAccessToken}
          onChange={(e) => setForm({ ...form, waAccessToken: e.target.value })}
          placeholder={t((l) => l.settings.waAccessTokenHint)}
        />

        <Button fullWidth isLoading={saving} onClick={handleSave} className="mt-2">
          {saving ? t((l) => l.common.saving) : t((l) => l.common.save)}
        </Button>

        {msg && <Banner variant={isSuccess ? "success" : "error"}>{msg}</Banner>}
      </div>
    </div>
  );
}
