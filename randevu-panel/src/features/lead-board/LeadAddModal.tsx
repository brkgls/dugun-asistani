import { useState, type FormEvent } from "react";
import { Banner, Button, Modal, ModalHeader, SegmentedControl, SelectField, TextField } from "../../shared/components";
import { useResolveError } from "../../shared/errors";
import { useT } from "../../shared/i18n/i18nContext";
import { CalendarIcon, PersonalIcon, PhoneIcon, PlusIcon } from "../../shared/icons";
import type { Hall, Menu, TimeSlot } from "../../shared/types";
import type { createLead } from "../../api/leads";

interface LeadAddModalProps {
  halls: Hall[];
  menus: Menu[];
  initialEventDate?: string;
  onClose: () => void;
  onSave: (data: Parameters<typeof createLead>[0]) => Promise<unknown>;
}

export function LeadAddModal({ halls, menus, initialEventDate, onClose, onSave }: LeadAddModalProps) {
  const { t } = useT();
  const resolve = useResolveError();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [hallId, setHallId] = useState("");
  const [menuId, setMenuId] = useState("");
  const [eventDate, setEventDate] = useState(initialEventDate ?? "");
  const [guestCountMin, setGuestCountMin] = useState("");
  const [guestCountMax, setGuestCountMax] = useState("");
  const [timeSlot, setTimeSlot] = useState<TimeSlot | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const selectedHall = halls.find((h) => h.id === hallId);

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        customerName,
        customerPhone: customerPhone || null,
        hallId: hallId || null,
        menuId: menuId || null,
        eventDate: eventDate || null,
        guestCountMin: guestCountMin ? Number(guestCountMin) : null,
        guestCountMax: guestCountMax ? Number(guestCountMax) : null,
        preferredTimeSlot: timeSlot || null,
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
              {saving ? t((l) => l.common.saving) : t((l) => l.leadBoard.addModal.submitButton)}
            </Button>
          </div>
        </>
      }
    >
      <ModalHeader title={t((l) => l.leadBoard.addModal.title)} icon={<PlusIcon className="h-5 w-5" />} tone="blue" onClose={onClose} />
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <TextField
          required
          leading={<PersonalIcon className="h-4 w-4 text-[#9ca3af]" />}
          placeholder={t((l) => l.leadBoard.addModal.customerName)}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <TextField
          type="tel"
          leading={<PhoneIcon className="h-4 w-4 text-[#9ca3af]" />}
          placeholder={t((l) => l.leadBoard.addModal.customerPhone)}
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField label={t((l) => l.leadBoard.addModal.hall)} value={hallId} onChange={(e) => setHallId(e.target.value)}>
            <option value="">{t((l) => l.leadBoard.addModal.hallNone)}</option>
            {halls.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </SelectField>
          <SelectField label={t((l) => l.leadBoard.addModal.menu)} value={menuId} onChange={(e) => setMenuId(e.target.value)}>
            <option value="">{t((l) => l.leadBoard.addModal.menuNone)}</option>
            {menus.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </SelectField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            type="date"
            leading={<CalendarIcon className="h-4 w-4 text-[#9ca3af]" />}
            label={t((l) => l.leadBoard.addModal.eventDate)}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            type="number"
            min={0}
            leading={<PersonalIcon className="h-4 w-4 text-[#9ca3af]" />}
            label={t((l) => l.leadBoard.addModal.guestCountMin)}
            value={guestCountMin}
            onChange={(e) => setGuestCountMin(e.target.value)}
          />
          <TextField
            type="number"
            min={0}
            leading={<PersonalIcon className="h-4 w-4 text-[#9ca3af]" />}
            label={t((l) => l.leadBoard.addModal.guestCountMax)}
            value={guestCountMax}
            onChange={(e) => setGuestCountMax(e.target.value)}
          />
        </div>

        <div>
          <span className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide">{t((l) => l.leadBoard.addModal.timeSlot)}</span>
          <div className="mt-1.5">
            <SegmentedControl<TimeSlot | "">
              value={timeSlot}
              onChange={setTimeSlot}
              options={[
                { value: "", label: t((l) => l.leadBoard.addModal.timeSlotNone) },
                { value: "WEEKDAY_EVENING", label: t((l) => l.leadBoard.timeSlot.WEEKDAY_EVENING) },
                { value: "WEEKEND_EVENING", label: t((l) => l.leadBoard.timeSlot.WEEKEND_EVENING) },
                ...(selectedHall?.dailyCapacity === 2
                  ? [{ value: "WEEKEND_DAY" as const, label: t((l) => l.leadBoard.timeSlot.WEEKEND_DAY) }]
                  : []),
              ]}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
