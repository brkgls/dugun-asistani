import { useState, type FormEvent } from "react";
import { Banner, Button, Modal, ModalHeader, TextField, Textarea } from "../../shared/components";
import { useResolveError } from "../../shared/errors";
import { useT } from "../../shared/i18n/i18nContext";
import { ServicesIcon } from "../../shared/icons";
import { cn } from "../../shared/utils/cn";
import type { Hall, Menu } from "../../shared/types";
import type { MenuUpsertData } from "./useMenus";

interface MenuFormProps {
  menu?: Menu | null;
  halls: Hall[];
  onClose: () => void;
  onSave: (data: MenuUpsertData) => Promise<void>;
}

export function MenuForm({ menu, halls, onClose, onSave }: MenuFormProps) {
  const { t } = useT();
  const resolve = useResolveError();
  const [name, setName] = useState(menu?.name ?? "");
  const [description, setDescription] = useState(menu?.description ?? "");
  const [pricePerPerson, setPricePerPerson] = useState(menu?.pricePerPerson?.toString() ?? "");
  const [hallIds, setHallIds] = useState<string[]>(menu?.hallIds ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleHall(id: string) {
    setHallIds((prev) => (prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]));
  }

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        name,
        description: description || null,
        pricePerPerson: pricePerPerson ? Number(pricePerPerson) : null,
        hallIds,
      });
      onClose();
    } catch (err) {
      setError(resolve(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      footer={
        <>
          {error && <Banner variant="error" className="mb-3">{error}</Banner>}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>{t((l) => l.common.cancel)}</Button>
            <Button fullWidth isLoading={saving} tone="amber" onClick={() => handleSubmit()}>
              {saving ? t((l) => l.common.saving) : t((l) => l.common.save)}
            </Button>
          </div>
        </>
      }
    >
      <ModalHeader title={menu ? t((l) => l.common.edit) : t((l) => l.menus.addButton)} icon={<ServicesIcon className="h-5 w-5" />} tone="amber" onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <TextField required label={t((l) => l.menus.form.name)} value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea label={t((l) => l.menus.form.description)} value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <TextField
          type="number"
          min={0}
          step="0.01"
          label={t((l) => l.menus.form.pricePerPerson)}
          value={pricePerPerson}
          onChange={(e) => setPricePerPerson(e.target.value)}
        />

        <div>
          <span className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide">{t((l) => l.menus.form.halls)}</span>
          <p className="text-xs text-[#8e8e93] mt-0.5 mb-2">{t((l) => l.menus.form.hallsHint)}</p>
          <div className="flex flex-wrap gap-2">
            {halls.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => toggleHall(h.id)}
                className={cn(
                  "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
                  hallIds.includes(h.id) ? "bg-[#f3e8ff] text-[#9333ea] border-[#e9d5ff]" : "bg-[#f9f9f9] text-[#6b7280] border-[#e5e5ea]",
                )}
              >
                {h.name}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
