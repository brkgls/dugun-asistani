import { useState, type FormEvent } from "react";
import { Banner, Button, Modal, ModalHeader, SelectField, TextField } from "../../shared/components";
import { useResolveError } from "../../shared/errors";
import { useT } from "../../shared/i18n/i18nContext";
import { ServicesIcon } from "../../shared/icons";
import type { Hall } from "../../shared/types";
import type { HallUpsert } from "../../api/halls";

interface HallFormProps {
  hall?: Hall | null;
  onClose: () => void;
  onSave: (data: HallUpsert) => Promise<void>;
}

export function HallForm({ hall, onClose, onSave }: HallFormProps) {
  const { t } = useT();
  const resolve = useResolveError();
  const [name, setName] = useState(hall?.name ?? "");
  const [description, setDescription] = useState(hall?.description ?? "");
  const [capacityMin, setCapacityMin] = useState(hall?.capacityMin?.toString() ?? "");
  const [capacityMax, setCapacityMax] = useState(hall?.capacityMax?.toString() ?? "");
  const [dailyCapacity, setDailyCapacity] = useState(hall?.dailyCapacity?.toString() ?? "1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        name,
        description: description || null,
        capacityMin: capacityMin ? Number(capacityMin) : null,
        capacityMax: capacityMax ? Number(capacityMax) : null,
        dailyCapacity: Number(dailyCapacity),
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
            <Button fullWidth isLoading={saving} tone="purple" onClick={() => handleSubmit()}>
              {saving ? t((l) => l.common.saving) : t((l) => l.common.save)}
            </Button>
          </div>
        </>
      }
    >
      <ModalHeader title={hall ? t((l) => l.common.edit) : t((l) => l.halls.addButton)} icon={<ServicesIcon className="h-5 w-5" />} tone="purple" onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <TextField required label={t((l) => l.halls.form.name)} value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label={t((l) => l.halls.form.description)} value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            type="number"
            min={0}
            label={t((l) => l.halls.form.capacityMin)}
            value={capacityMin}
            onChange={(e) => setCapacityMin(e.target.value)}
          />
          <TextField
            type="number"
            min={0}
            label={t((l) => l.halls.form.capacityMax)}
            value={capacityMax}
            onChange={(e) => setCapacityMax(e.target.value)}
          />
        </div>

        <SelectField label={t((l) => l.halls.form.dailyCapacity)} value={dailyCapacity} onChange={(e) => setDailyCapacity(e.target.value)}>
          <option value="1">{t((l) => l.halls.form.dailyCapacityOne)}</option>
          <option value="2">{t((l) => l.halls.form.dailyCapacityTwo)}</option>
        </SelectField>
        <p className="text-xs text-[#8e8e93] -mt-2">{t((l) => l.halls.form.dailyCapacityHint)}</p>
      </form>
    </Modal>
  );
}
