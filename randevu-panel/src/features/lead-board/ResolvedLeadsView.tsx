import { useMemo, useState } from "react";
import { Badge, SelectField, TextField } from "../../shared/components";
import { useT } from "../../shared/i18n/i18nContext";
import { ChevronRightIcon, PersonalIcon, SearchIcon } from "../../shared/icons";
import { TONES } from "../../shared/theme/tones";
import { STAGE_TONE, MOOD_TONE } from "./stageTheme";
import { applyResolvedFilters, type ResolvedFilters, type ResolvedSort } from "./leadFilters";
import { buildMenuColorMap, NO_MENU_COLOR } from "../calendar/calendarColors";
import type { Hall, Lead, Menu } from "../../shared/types";

interface ResolvedLeadsViewProps {
  leads: Lead[];
  halls: Hall[];
  menus: Menu[];
  onCardClick: (lead: Lead) => void;
}

export function ResolvedLeadsView({ leads, halls, menus, onCardClick }: ResolvedLeadsViewProps) {
  const { t, locale } = useT();
  const [filters, setFilters] = useState<ResolvedFilters>({ stage: "", hallId: "", search: "", sort: "day_desc" });
  const menuColors = useMemo(() => buildMenuColorMap(menus), [menus]);
  const result = useMemo(() => applyResolvedFilters(leads, filters), [leads, filters]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <TextField
          className="w-auto min-w-[200px] flex-1"
          leading={<SearchIcon className="h-4 w-4 text-[#8e8e93]" />}
          placeholder={t((l) => l.leadBoard.resolved.searchPlaceholder)}
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <SelectField
          className="w-auto min-w-[130px]"
          value={filters.stage}
          onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value as ResolvedFilters["stage"] }))}
        >
          <option value="">{t((l) => l.leadBoard.resolved.allOutcomes)}</option>
          <option value="WON">{t((l) => l.leadBoard.stage.WON)}</option>
          <option value="LOST">{t((l) => l.leadBoard.stage.LOST)}</option>
        </SelectField>
        <SelectField
          className="w-auto min-w-[140px]"
          value={filters.hallId}
          onChange={(e) => setFilters((f) => ({ ...f, hallId: e.target.value }))}
        >
          <option value="">{t((l) => l.leadBoard.filterHallAll)}</option>
          {halls.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </SelectField>
        <SelectField
          className="w-auto min-w-[160px]"
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as ResolvedSort }))}
        >
          <option value="day_desc">{t((l) => l.leadBoard.resolved.sortNewest)}</option>
          <option value="day_asc">{t((l) => l.leadBoard.resolved.sortOldest)}</option>
          <option value="guests_desc">{t((l) => l.leadBoard.resolved.sortGuests)}</option>
        </SelectField>
      </div>

      {result.length === 0 ? (
        <p className="text-sm text-[#8e8e93] text-center py-10">{t((l) => l.leadBoard.resolved.empty)}</p>
      ) : (
        <div className="space-y-2">
          {result.map((lead) => {
            const menuColor = lead.menuId ? menuColors.get(lead.menuId) ?? NO_MENU_COLOR : NO_MENU_COLOR;
            const stageTone = TONES[STAGE_TONE[lead.stage]];
            const initial = (lead.customerName || "?").trim().charAt(0).toUpperCase() || "?";
            const receivedLabel = new Date(lead.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <button
                key={lead.id}
                onClick={() => onCardClick(lead)}
                className="w-full text-left flex items-stretch rounded-2xl border border-[#f0f0f0] bg-white hover:border-[#007ff5]/40 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <span className="w-1.5 shrink-0" style={{ backgroundColor: menuColor }} />
                <div className="flex-1 min-w-0 p-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2.5 min-w-[160px]">
                    <span className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${stageTone.soft} ${stageTone.softText}`}>
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1c1c1e] truncate">{lead.customerName}</p>
                      {lead.customerPhone && <p className="text-[11px] text-[#8e8e93] truncate">{lead.customerPhone}</p>}
                    </div>
                  </div>

                  <span className="text-xs text-[#6b7280] min-w-[90px]">{receivedLabel}</span>

                  <span className="inline-flex items-center gap-1.5 text-xs text-[#6b7280] min-w-[140px]">
                    <span className="h-2 w-2 rounded-full inline-block shrink-0" style={{ backgroundColor: menuColor }} />
                    {[lead.hallName, lead.menuName].filter(Boolean).join(" · ") || "—"}
                  </span>

                  {lead.guestCountMin != null && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#6b7280]">
                      <PersonalIcon className="h-3 w-3 text-[#9ca3af]" />
                      {lead.guestCountMax != null ? `${lead.guestCountMin}-${lead.guestCountMax}` : `${lead.guestCountMin}+`} {t((l) => l.common.person)}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <Badge tone={STAGE_TONE[lead.stage]}>{t((l) => l.leadBoard.stage[lead.stage])}</Badge>
                    {lead.mood && <Badge tone={MOOD_TONE[lead.mood]}>{t((l) => l.leadBoard.mood[lead.mood!])}</Badge>}
                    {lead.priceGiven && lead.priceAmount != null && (
                      <span className="text-xs font-bold text-[#16a34a] whitespace-nowrap">{lead.priceAmount.toLocaleString("tr-TR")} ₺</span>
                    )}
                    <ChevronRightIcon className="h-4 w-4 text-[#c7c7cc] shrink-0" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
