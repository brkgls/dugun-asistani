import { useT } from "../../shared/i18n/i18nContext";
import type { Lead } from "../../shared/types";
import { LeadCard } from "./LeadCard";
import { weeksAgo, type WeekGroup } from "./leadFilters";

interface WeekGroupedLeadListProps {
  weekGroups: WeekGroup[];
  emptyLabel: string;
  onCardClick: (lead: Lead) => void;
}

export function WeekGroupedLeadList({ weekGroups, emptyLabel, onCardClick }: WeekGroupedLeadListProps) {
  const { t, locale } = useT();
  const total = weekGroups.reduce((sum, g) => sum + g.leads.length, 0);

  function weekLabel(group: WeekGroup): string {
    const ago = weeksAgo(group.mondayDate);
    if (ago === 0) return t((l) => l.leadBoard.weekGroup.thisWeek);
    if (ago === 1) return t((l) => l.leadBoard.weekGroup.lastWeek);
    if (ago > 1) return t((l) => l.leadBoard.weekGroup.weeksAgo, { count: ago });
    const sunday = new Date(group.mondayDate);
    sunday.setDate(sunday.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", { day: "numeric", month: "short" });
    return `${fmt(group.mondayDate)} – ${fmt(sunday)}`;
  }

  if (total === 0) {
    return <p className="text-[11px] text-[#c7c7cc] text-center py-6">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {weekGroups.map((group) => (
        <div key={group.key}>
          <div className="flex items-center gap-2 px-1 pb-1.5">
            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wide">{weekLabel(group)}</span>
            <span className="flex-1 h-px bg-[#e5e5ea]" />
            <span className="text-[10px] font-bold text-[#a1a1aa]">{group.leads.length}</span>
          </div>
          <div className="space-y-2">
            {group.leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
