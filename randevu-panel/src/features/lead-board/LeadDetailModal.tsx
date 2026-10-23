import { useEffect, useState } from "react";
import { Badge, Banner, Button, Modal, ModalHeader, SegmentedControl, SelectField, TextField, Textarea, useToast } from "../../shared/components";
import { useResolveError } from "../../shared/errors";
import { useT } from "../../shared/i18n/I18nProvider";
import { CalendarIcon, NoteIcon, PersonalIcon, PhoneIcon } from "../../shared/icons";
import { getLeadNotes, addLeadNote } from "../../api/leadNotes";
import { getUsers } from "../../api/users";
import { useAuth } from "../../auth/AuthContext";
import { cn } from "../../shared/utils/cn";
import { TONES } from "../../shared/theme/tones";
import type { Hall, Lead, LeadMood, LeadNote, LeadStage, Menu, PanelUser, TimeSlot } from "../../shared/types";
import type { LeadUpdate } from "../../api/leads";
import { STAGE_TONE, MOOD_TONE } from "./stageTheme";
import { STAGES } from "./leadFilters";

interface LeadDetailModalProps {
  lead: Lead;
  halls: Hall[];
  menus: Menu[];
  onClose: () => void;
  onSave: (data: LeadUpdate) => Promise<Lead>;
}

const MOODS: LeadMood[] = ["POSITIVE", "NEGATIVE", "NEUTRAL", "CONFUSED"];

export function LeadDetailModal({ lead, halls, menus, onClose, onSave }: LeadDetailModalProps) {
  const { t } = useT();
  const resolve = useResolveError();
  const { isAdmin } = useAuth();
  const showToast = useToast();

  const [hallId, setHallId] = useState(lead.hallId ?? "");
  const [menuId, setMenuId] = useState(lead.menuId ?? "");
  const [eventDate, setEventDate] = useState(lead.eventDate ?? "");
  const [guestCountMin, setGuestCountMin] = useState(lead.guestCountMin?.toString() ?? "");
  const [guestCountMax, setGuestCountMax] = useState(lead.guestCountMax?.toString() ?? "");
  const [timeSlot, setTimeSlot] = useState<TimeSlot | "">(lead.preferredTimeSlot ?? "");
  const selectedHall = halls.find((h) => h.id === hallId);
  const [stage, setStage] = useState<LeadStage>(lead.stage);
  const [mood, setMood] = useState<LeadMood | "">(lead.mood ?? "");
  const [priceAmount, setPriceAmount] = useState(lead.priceAmount?.toString() ?? "");
  const [assignedUserId, setAssignedUserId] = useState(lead.assignedUserId ?? "");
  const [users, setUsers] = useState<PanelUser[]>([]);

  const monthNames = t((l) => l.months);
  const preferredPeriodText = (() => {
    if (!lead.preferredMonth) return "";
    const [year, month] = lead.preferredMonth.split("-");
    const parts = [`${monthNames[Number(month) - 1] ?? month} ${year}`];
    if (lead.preferredWeek != null) parts.push(`${lead.preferredWeek}. ${t((l) => l.leadBoard.detail.weekShort)}`);
    if (lead.preferredTimeSlot) parts.push(t((l) => l.leadBoard.timeSlot[lead.preferredTimeSlot!]));
    return parts.join(" · ");
  })();

  const [notes, setNotes] = useState<LeadNote[] | null>(null);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getLeadNotes(lead.id).then(setNotes).catch(() => setNotes([]));
    if (isAdmin) getUsers().then(setUsers).catch(() => setUsers([]));
  }, [lead.id, isAdmin]);

  async function handleSave() {
    setSaving(true);
    setErrorMsg("");
    try {
      await onSave({
        hallId: hallId || null,
        menuId: menuId || null,
        eventDate: eventDate || null,
        guestCountMin: guestCountMin ? Number(guestCountMin) : null,
        guestCountMax: guestCountMax ? Number(guestCountMax) : null,
        preferredTimeSlot: timeSlot,
        stage,
        mood,
        priceGiven: priceAmount.trim() !== "" && Number(priceAmount) > 0,
        priceAmount: priceAmount ? Number(priceAmount) : null,
        assignedUserId: assignedUserId || null,
      });
      if (newNote.trim()) {
        await addNote();
      }
      showToast(t((l) => l.leadBoard.detail.saveSuccess));
      onClose();
    } catch (err) {
      setErrorMsg(resolve(err));
      setSaving(false);
    }
  }

  async function addNote() {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const note = await addLeadNote(lead.id, newNote.trim());
      setNotes((prev) => (prev ? [note, ...prev] : [note]));
      setNewNote("");
    } finally {
      setAddingNote(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      className="sm:max-w-[480px]"
      footer={
        <>
          {errorMsg && <Banner variant="error" className="mb-3">{errorMsg}</Banner>}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>{t((l) => l.common.cancel)}</Button>
            <Button fullWidth isLoading={saving || addingNote} onClick={handleSave}>
              {saving ? t((l) => l.common.saving) : t((l) => l.common.save)}
            </Button>
          </div>
        </>
      }
    >
      <ModalHeader
        title={lead.customerName}
        subtitle={lead.customerPhone ?? t((l) => l.leadBoard.detail.noPhone)}
        tone={STAGE_TONE[stage]}
        badge={<Badge tone="gray">{t((l) => l.leadBoard.source[lead.source])}</Badge>}
        onClose={onClose}
      />

      <div className="flex gap-2 mb-4">
        {lead.customerPhone && (
          <>
            <Button size="sm" variant="soft" tone="green" onClick={() => window.open(`tel:${lead.customerPhone}`)}>
              <PhoneIcon className="h-3.5 w-3.5" /> {t((l) => l.leadBoard.detail.callButton)}
            </Button>
            <Button size="sm" variant="soft" tone="green" onClick={() => window.open(`https://wa.me/${lead.customerPhone}`, "_blank")}>
              {t((l) => l.leadBoard.detail.whatsappButton)}
            </Button>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide">{t((l) => l.leadBoard.detail.stage)}</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {STAGES.map((s) => {
              const tone = TONES[STAGE_TONE[s]];
              const active = s === stage;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
                    active ? cn(tone.soft, tone.softText, tone.softBorder) : "bg-white text-[#6b7280] border-[#e5e5ea] hover:bg-[#f9f9f9]",
                  )}
                >
                  {t((l) => l.leadBoard.stage[s])}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide">{t((l) => l.leadBoard.detail.mood)}</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => setMood("")}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
                mood === "" ? "bg-[#f2f2f7] text-[#48484a] border-[#e5e5ea]" : "bg-white text-[#c7c7cc] border-[#e5e5ea] hover:bg-[#f9f9f9]",
              )}
            >
              {t((l) => l.leadBoard.mood.NONE)}
            </button>
            {MOODS.map((m) => {
              const tone = TONES[MOOD_TONE[m]];
              const active = m === mood;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
                    active ? cn(tone.soft, tone.softText, tone.softBorder) : "bg-white text-[#6b7280] border-[#e5e5ea] hover:bg-[#f9f9f9]",
                  )}
                >
                  {t((l) => l.leadBoard.mood[m])}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField label={t((l) => l.leadBoard.detail.hall)} value={hallId} onChange={(e) => setHallId(e.target.value)}>
            <option value="">—</option>
            {halls.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </SelectField>
          <SelectField label={t((l) => l.leadBoard.detail.menu)} value={menuId} onChange={(e) => setMenuId(e.target.value)}>
            <option value="">—</option>
            {menus.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </SelectField>
        </div>

        {lead.preferredMonth && (
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl px-3 py-2.5">
            <p className="text-[11px] font-semibold text-[#92400e] uppercase tracking-wide">{t((l) => l.leadBoard.detail.preferredPeriodLabel)}</p>
            <p className="text-sm text-[#92400e] mt-0.5">{preferredPeriodText}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            type="date"
            leading={<CalendarIcon className="h-4 w-4 text-[#9ca3af]" />}
            label={t((l) => l.leadBoard.detail.eventDate)}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
        {!eventDate && <p className="text-xs text-[#8e8e93] -mt-2.5">{t((l) => l.leadBoard.detail.eventDateHint)}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            type="number"
            min={0}
            leading={<PersonalIcon className="h-4 w-4 text-[#9ca3af]" />}
            label={t((l) => l.leadBoard.detail.guestCountMin)}
            value={guestCountMin}
            onChange={(e) => setGuestCountMin(e.target.value)}
          />
          <TextField
            type="number"
            min={0}
            leading={<PersonalIcon className="h-4 w-4 text-[#9ca3af]" />}
            label={t((l) => l.leadBoard.detail.guestCountMax)}
            value={guestCountMax}
            onChange={(e) => setGuestCountMax(e.target.value)}
          />
        </div>

        <div>
          <span className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide">{t((l) => l.leadBoard.detail.timeSlot)}</span>
          <div className="mt-1.5">
            <SegmentedControl<TimeSlot | "">
              value={timeSlot}
              onChange={setTimeSlot}
              options={[
                { value: "", label: t((l) => l.leadBoard.detail.timeSlotNone) },
                { value: "WEEKDAY_EVENING", label: t((l) => l.leadBoard.timeSlot.WEEKDAY_EVENING) },
                { value: "WEEKEND_EVENING", label: t((l) => l.leadBoard.timeSlot.WEEKEND_EVENING) },
                ...(selectedHall?.dailyCapacity === 2
                  ? [{ value: "WEEKEND_DAY" as const, label: t((l) => l.leadBoard.timeSlot.WEEKEND_DAY) }]
                  : []),
              ]}
            />
          </div>
        </div>

        <TextField
          type="number"
          min={0}
          leading={<span className="text-sm font-bold text-[#9ca3af]">₺</span>}
          label={t((l) => l.leadBoard.detail.priceAmount)}
          value={priceAmount}
          onChange={(e) => setPriceAmount(e.target.value)}
          placeholder={t((l) => l.leadBoard.detail.priceAmountHint)}
        />

        {isAdmin && (
          <SelectField label={t((l) => l.leadBoard.detail.assignedUser)} value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)}>
            <option value="">{t((l) => l.leadBoard.detail.unassigned)}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName || u.phone}</option>
            ))}
          </SelectField>
        )}
        {!isAdmin && lead.assignedUserName && (
          <p className="text-xs text-[#8e8e93]">{t((l) => l.leadBoard.detail.assignedUser)}: {lead.assignedUserName}</p>
        )}
      </div>

      <hr className="border-t border-gray-100 my-4" />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <NoteIcon className="h-4 w-4" />
          <h4 className="text-[13px] font-bold text-[#48484a] tracking-wide uppercase">{t((l) => l.leadBoard.detail.notes)}</h4>
        </div>

        <Textarea
          rows={3}
          className="w-full mb-3"
          placeholder={t((l) => l.leadBoard.detail.addNotePlaceholder)}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />

        {notes === null ? (
          <p className="text-xs text-[#8e8e93]">{t((l) => l.common.loading)}</p>
        ) : notes.length === 0 ? (
          <p className="text-xs text-[#8e8e93]">{t((l) => l.leadBoard.detail.noNotes)}</p>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="bg-[#f9f9f9] rounded-xl p-3">
                <p className="text-xs text-[#1c1c1e] whitespace-pre-wrap">{note.body}</p>
                <p className="text-[11px] text-[#8e8e93] mt-1">
                  {note.authorName} · {new Date(note.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
