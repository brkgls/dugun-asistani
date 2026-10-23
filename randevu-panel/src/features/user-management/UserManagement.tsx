import { useEffect, useState, type FormEvent } from "react";
import { createUser, getUsers, setUserActive } from "../../api/users";
import { useResolveError } from "../../shared/errors";
import { useT } from "../../shared/i18n/i18nContext";
import { Badge, Banner, Button, Card, EmptyState, SelectField, Skeleton, TextField } from "../../shared/components";
import { UserGroupIcon } from "../../shared/icons";
import type { PanelUser } from "../../shared/types";

export function UserManagement() {
  const resolve = useResolveError();
  const { t } = useT();

  const [users, setUsers] = useState<PanelUser[] | null>(null);
  const [form, setForm] = useState({ phone: "", password: "", fullName: "", role: "STAFF" as "ADMIN" | "STAFF" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    getUsers().then(setUsers).catch(() => setUsers([]));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await createUser(form);
      setForm({ phone: "", password: "", fullName: "", role: "STAFF" });
      load();
    } catch (err) {
      setMsg(resolve(err));
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(u: PanelUser) {
    setUsers((prev) => prev?.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)) ?? null);
    try {
      await setUserActive(u.id, !u.active);
    } catch {
      load();
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto pb-8 antialiased">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{t((l) => l.users.title)}</h1>
        <p className="text-xs text-gray-500 mt-1">{t((l) => l.users.subtitle)}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#f0f0f0] rounded-2xl p-5 shadow-sm space-y-4 mb-5">
        <h2 className="text-base font-semibold text-gray-800">{t((l) => l.users.addButton)}</h2>

        <TextField
          required
          label={t((l) => l.users.form.fullName)}
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <TextField
          required
          type="tel"
          label={t((l) => l.users.form.phone)}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <TextField
          required
          type="password"
          label={t((l) => l.users.form.password)}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <SelectField
          label={t((l) => l.users.form.role)}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as "ADMIN" | "STAFF" })}
        >
          <option value="STAFF">{t((l) => l.users.form.roleStaff)}</option>
          <option value="ADMIN">{t((l) => l.users.form.roleAdmin)}</option>
        </SelectField>

        <Button type="submit" fullWidth isLoading={loading}>
          {t((l) => l.users.addButton)}
        </Button>

        {msg && <Banner variant="error">{msg}</Banner>}
      </form>

      {users === null ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={<UserGroupIcon className="h-6 w-6 text-emerald-500" />} title={t((l) => l.users.empty)} />
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1c1c1e] truncate">{u.fullName || u.phone}</p>
                <p className="text-xs text-[#8e8e93]">{u.phone}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge tone={u.role === "ADMIN" ? "purple" : "blue"}>
                  {u.role === "ADMIN" ? t((l) => l.users.form.roleAdmin) : t((l) => l.users.form.roleStaff)}
                </Badge>
                <Button size="sm" variant={u.active ? "soft" : "secondary"} tone={u.active ? "green" : "gray"} onClick={() => toggleActive(u)}>
                  {u.active ? t((l) => l.common.active) : t((l) => l.common.inactive)}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
