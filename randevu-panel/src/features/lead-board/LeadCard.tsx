import { useDraggable } from "@dnd-kit/core";
import { Badge, Card } from "../../shared/components";
import { useT } from "../../shared/i18n/i18nContext";
import { cn } from "../../shared/utils/cn";
import type { Lead } from "../../shared/types";
import { MOOD_TONE } from "./stageTheme";
import { isToday } from "./leadFilters";

export function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { t, locale } = useT();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  const receivedLabel = new Date(lead.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const monthNames = t((l) => l.months);
  let preferredLabel: string | null = null;
  if (!lead.eventDate && lead.preferredMonth) {
    const [year, month] = lead.preferredMonth.split("-");
    const parts = [`${monthNames[Number(month) - 1] ?? month} ${year}`];
    if (lead.preferredWeek != null) parts.push(`${lead.preferredWeek}. ${t((l) => l.leadBoard.detail.weekShort)}`);
    if (lead.preferredTimeSlot) parts.push(t((l) => l.leadBoard.timeSlot[lead.preferredTimeSlot!]));
    preferredLabel = parts.join(" · ");
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn("p-3.5 cursor-grab active:cursor-grabbing select-none touch-none", isDragging && "opacity-50 shadow-lg")}
      {...listeners}
      {...attributes}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[#1c1c1e] truncate">{lead.customerName || t((l) => l.leadBoard.detail.noPhone)}</p>
        {isToday(lead.createdAt) && <Badge tone="blue">{t((l) => l.leadBoard.todayBadge)}</Badge>}
      </div>

      {lead.customerPhone && <p className="text-xs text-[#8e8e93] mt-0.5">{lead.customerPhone}</p>}

      <div className="flex flex-wrap gap-1 mt-2 text-[11px] text-[#6b7280]">
        {lead.hallName && <span className="bg-[#f2f2f7] rounded-md px-1.5 py-0.5">{lead.hallName}</span>}
        {lead.menuName && <span className="bg-[#f2f2f7] rounded-md px-1.5 py-0.5">{lead.menuName}</span>}
        {lead.eventDate && (
          <span className="bg-[#f0fdf4] text-[#16a34a] rounded-md px-1.5 py-0.5 font-semibold">✓ {lead.eventDate}</span>
        )}
        {lead.guestCountMin != null && (
          <span className="bg-[#f2f2f7] rounded-md px-1.5 py-0.5">
            {lead.guestCountMax != null ? `${lead.guestCountMin}-${lead.guestCountMax}` : `${lead.guestCountMin}+`} {t((l) => l.common.person)}
          </span>
        )}
      </div>

      {preferredLabel && (
        <p className="text-[11px] text-[#b45309] mt-1.5">{t((l) => l.leadBoard.detail.preferredPeriodLabel)}: {preferredLabel}</p>
      )}

      <div className="flex items-center justify-between mt-2.5">
        {lead.mood ? (
          <Badge tone={MOOD_TONE[lead.mood]}>{t((l) => l.leadBoard.mood[lead.mood!])}</Badge>
        ) : (
          <span className="text-[11px] text-[#c7c7cc]">{t((l) => l.leadBoard.mood.NONE)}</span>
        )}
        {lead.priceGiven && lead.priceAmount != null && (
          <span className="text-xs font-semibold text-[#16a34a]">{lead.priceAmount.toLocaleString("tr-TR")} ₺</span>
        )}
      </div>

      <p className="text-[10px] text-[#c7c7cc] font-medium mt-2 pt-2 border-t border-[#f2f2f7]">
        {t((l) => l.leadBoard.receivedOn)}: {receivedLabel}
      </p>
    </Card>
  );
}
