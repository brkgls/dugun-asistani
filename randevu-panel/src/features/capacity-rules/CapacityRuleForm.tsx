import { useState, type FormEvent } from "react";
import { Banner, Button, Modal, ModalHeader, SegmentedControl, SelectField, Textarea, Switch } from "../../shared/components";
import { useResolveError } from "../../shared/errors";
import { useT } from "../../shared/i18n/i18nContext";
import { ClockIcon } from "../../shared/icons";
import { cn } from "../../shared/utils/cn";
import type { CapacityRule, Hall, Menu, TimeSlot } from "../../shared/types";
import type { CapacityRuleUpsert } from "../../api/capacityRules";

interface CapacityRuleFormProps {
  rule?: CapacityRule | null;
  halls: Hall[];
  menus: Menu[];
  onClose: () => void;
  onSave: (data: CapacityRuleUpsert) => Promise<void>;
}

export function CapacityRuleForm({ rule, halls, menus, onClose, onSave }: CapacityRuleFormProps) {
  const { t } = useT();
  const resolve = useResolveError();
  const [hallId, setHallId] = useState(rule?.hallId ?? "");
  const [menuId, setMenuId] = useState(rule?.menuId ?? "");
  const [months, setMonths] = useState<number[]>(rule?.months ?? []);
  const [timeSlot, setTimeSlot] = useState<TimeSlot | "">(rule?.timeSlot ?? "");
  const [note, setNote] = useState(rule?.note ?? "");
  const [active, setActive] = useState(rule?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleMonth(m: number) {
    setMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].sort((a, b) => a - b)));
  }

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        hallId: hallId || null,
        menuId: menuId || null,
        months: months.length > 0 ? months : null,
        timeSlot: timeSlot || null,
        active,
        note: note || null,
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
            <Button fullWidth isLoading={saving} onClick={() => handleSubmit()}>
              {saving ? t((l) => l.common.saving) : t((l) => l.common.save)}
            </Button>
          </div>
        </>
      }
    >
      <ModalHeader title={rule ? t((l) => l.common.edit) : t((l) => l.capacityRules.addButton)} icon={<ClockIcon className="h-5 w-5" />} tone="blue" onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <SelectField label={t((l) => l.capacityRules.form.hall)} value={hallId} onChange={(e) => setHallId(e.target.value)}>
          <option value="">{t((l) => l.capacityRules.form.hallAll)}</option>
          {halls.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </SelectField>

        <SelectField label={t((l) => l.capacityRules.form.menu)} value={menuId} onChange={(e) => setMenuId(e.target.value)}>
          <option value="">{t((l) => l.capacityRules.form.menuAll)}</option>
          {menus.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </SelectField>

        <div>
          <span className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide">{t((l) => l.capacityRules.form.months)}</span>
          <p className="text-xs text-[#8e8e93] mt-0.5 mb-2">{t((l) => l.capacityRules.form.monthsHint)}</p>
          <div className="flex flex-wrap gap-1.5">
            {t((l) => l.months).map((label, idx) => {
              const monthNum = idx + 1;
              const isOn = months.includes(monthNum);
              return (
                <button
                  key={monthNum}
                  type="button"
                  onClick={() => toggleMonth(monthNum)}
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-colors",
                    isOn ? "bg-[#eff6ff] text-[#007ff5] border-[#dbeafe]" : "bg-[#f9f9f9] text-[#6b7280] border-[#e5e5ea]",
                  )}
                >
                  {label.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide">{t((l) => l.capacityRules.form.timeSlot)}</span>
          <div className="mt-1.5">
            <SegmentedControl<TimeSlot | "">
              value={timeSlot}
              onChange={setTimeSlot}
              options={[
                { value: "", label: t((l) => l.capacityRules.form.timeSlotAll) },
                { value: "WEEKDAY_EVENING", label: t((l) => l.capacityRules.form.timeSlotWeekdayEvening) },
                { value: "WEEKEND_EVENING", label: t((l) => l.capacityRules.form.timeSlotWeekendEvening) },
                { value: "WEEKEND_DAY", label: t((l) => l.capacityRules.form.timeSlotWeekendDay) },
              ]}
            />
          </div>
        </div>

        <Textarea label={t((l) => l.capacityRules.form.note)} value={note} onChange={(e) => setNote(e.target.value)} rows={2} />

        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-medium text-[#1c1c1e]">{t((l) => l.capacityRules.form.active)}</span>
          <Switch checked={active} onChange={() => setActive((v) => !v)} />
        </div>
      </form>
    </Modal>
  );
}
