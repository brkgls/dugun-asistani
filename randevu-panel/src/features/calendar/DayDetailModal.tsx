import { useState } from "react";
import { Badge, Button, Modal, ModalHeader } from "../../shared/components";
import { useT } from "../../shared/i18n/i18nContext";
import { LeadDetailModal } from "../lead-board/LeadDetailModal";
import { LeadAddModal } from "../lead-board/LeadAddModal";
import { CalendarIcon, ChevronRightIcon, PersonalIcon, PlusIcon } from "../../shared/icons";
import { TONES } from "../../shared/theme/tones";
import { STAGE_TONE, MOOD_TONE } from "../lead-board/stageTheme";
import type { Hall, Lead, Menu } from "../../shared/types";
import type { createLead, LeadUpdate } from "../../api/leads";
import { NO_MENU_COLOR } from "./calendarColors";

interface DayDetailModalProps {
  dateKey: string;
  dateLabel: string;
  leads: Lead[];
  halls: Hall[];
  menus: Menu[];
  menuColors: Map<string, string>;
  onClose: () => void;
  onSaveLead: (leadId: string, data: LeadUpdate) => Promise<Lead>;
  onAddLead: (data: Parameters<typeof createLead>[0]) => Promise<Lead>;
}

export function DayDetailModal({ dateKey, dateLabel, leads, halls, menus, menuColors, onClose, onSaveLead, onAddLead }: DayDetailModalProps) {
  const { t } = useT();
  const [openLead, setOpenLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const liveOpenLead = openLead ? leads.find((l) => l.id === openLead.id) ?? openLead : null;
  const totalGuests = leads.reduce((sum, l) => sum + (l.guestCountMin ?? 0), 0);

  return (
    <>
      <Modal onClose={onClose}>
        <ModalHeader
          title={dateLabel}
          subtitle={leads.length > 0 ? t((l) => l.calendar.countBadge, { count: leads.length }) : t((l) => l.calendar.noEventsForDay)}
          tone="blue"
          icon={<CalendarIcon className="h-5 w-5 text-[#007ff5]" />}
          onClose={onClose}
        />

        {leads.length > 0 && (
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="flex-1 bg-gradient-to-br from-[#eff6ff] to-[#f3e8ff] border border-[#e0e7ff] rounded-2xl p-3 text-center">
              <p className="text-xl font-extrabold text-[#1c1c1e] leading-none">{leads.length}</p>
              <p className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wide mt-1">{t((l) => l.calendar.eventsForDay)}</p>
            </div>
            <div className="flex-1 bg-gradient-to-br from-[#f0fdf4] to-[#eff6ff] border border-[#dcfce7] rounded-2xl p-3 text-center">
              <p className="text-xl font-extrabold text-[#1c1c1e] leading-none">{totalGuests}</p>
              <p className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wide mt-1">{t((l) => l.common.person)}</p>
            </div>
          </div>
        )}

        <Button size="sm" variant="soft" onClick={() => setShowAddModal(true)} className="mb-3.5">
          <PlusIcon className="h-4 w-4" /> {t((l) => l.leadBoard.addButton)}
        </Button>

        {leads.length === 0 ? (
          <p className="text-sm text-[#8e8e93] py-4 text-center">{t((l) => l.calendar.noEventsForDay)}</p>
        ) : (
          <div className="space-y-2.5">
            {leads.map((lead) => {
              const menuColor = lead.menuId ? menuColors.get(lead.menuId) ?? NO_MENU_COLOR : NO_MENU_COLOR;
              const stageTone = TONES[STAGE_TONE[lead.stage]];
              const initial = (lead.customerName || "?").trim().charAt(0).toUpperCase() || "?";

              return (
                <button
                  key={lead.id}
                  onClick={() => setOpenLead(lead)}
                  className="w-full text-left flex items-stretch rounded-2xl border border-[#f0f0f0] bg-white hover:border-[#007ff5]/40 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all overflow-hidden"
                >
                  <span className="w-1.5 shrink-0" style={{ backgroundColor: menuColor }} />
                  <div className="flex-1 min-w-0 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${stageTone.soft} ${stageTone.softText}`}
                        >
                          {initial}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1c1c1e] truncate">{lead.customerName}</p>
                          {lead.customerPhone && <p className="text-[11px] text-[#8e8e93] truncate">{lead.customerPhone}</p>}
                        </div>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-[#c7c7cc] shrink-0 mt-1.5" />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <Badge tone={STAGE_TONE[lead.stage]}>{t((l) => l.leadBoard.stage[lead.stage])}</Badge>
                      {lead.mood && <Badge tone={MOOD_TONE[lead.mood]}>{t((l) => l.leadBoard.mood[lead.mood!])}</Badge>}
                      {lead.preferredTimeSlot && <Badge tone="gray">{t((l) => l.leadBoard.timeSlot[lead.preferredTimeSlot!])}</Badge>}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-[#6b7280]">
                      {(lead.hallName || lead.menuName) && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full inline-block shrink-0" style={{ backgroundColor: menuColor }} />
                          {[lead.hallName, lead.menuName].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {lead.guestCountMin != null && (
                        <span className="inline-flex items-center gap-1">
                          <PersonalIcon className="h-3 w-3 text-[#9ca3af]" />
                          {lead.guestCountMax != null ? `${lead.guestCountMin}-${lead.guestCountMax}` : `${lead.guestCountMin}+`} {t((l) => l.common.person)}
                        </span>
                      )}
                      {lead.priceGiven && lead.priceAmount != null && (
                        <span className="font-bold text-[#16a34a]">{lead.priceAmount.toLocaleString("tr-TR")} ₺</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <div className="pb-5" />
      </Modal>

      {liveOpenLead && (
        <LeadDetailModal
          lead={liveOpenLead}
          halls={halls}
          menus={menus}
          onClose={() => setOpenLead(null)}
          onSave={(data) => onSaveLead(liveOpenLead.id, data)}
        />
      )}

      {showAddModal && (
        <LeadAddModal
          halls={halls}
          menus={menus}
          initialEventDate={dateKey}
          onClose={() => setShowAddModal(false)}
          onSave={onAddLead}
        />
      )}
    </>
  );
}
