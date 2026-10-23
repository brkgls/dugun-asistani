import { useDroppable } from "@dnd-kit/core";
import { Badge } from "../../shared/components";
import { useT } from "../../shared/i18n/i18nContext";
import { cn } from "../../shared/utils/cn";
import type { Lead, LeadStage } from "../../shared/types";
import { STAGE_TONE } from "./stageTheme";
import { WeekGroupedLeadList } from "./WeekGroupedLeadList";
import type { WeekGroup } from "./leadFilters";

interface KanbanColumnProps {
  stage: LeadStage;
  weekGroups: WeekGroup[];
  onCardClick: (lead: Lead) => void;
}

export function KanbanColumn({ stage, weekGroups, onCardClick }: KanbanColumnProps) {
  const { t } = useT();
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = weekGroups.reduce((sum, g) => sum + g.leads.length, 0);

  return (
    <div className="flex flex-col shrink-0 w-[280px]">
      <div className="flex items-center gap-2 px-1 pb-2">
        <Badge tone={STAGE_TONE[stage]}>{t((l) => l.leadBoard.stage[stage])}</Badge>
        <span className="text-[11px] font-bold text-[#8e8e93]">{total}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-2xl p-2 min-h-[120px] transition-colors",
          isOver ? "bg-[#eff6ff]" : "bg-[#f4f4f7]",
        )}
      >
        <WeekGroupedLeadList weekGroups={weekGroups} emptyLabel={t((l) => l.leadBoard.emptyColumn)} onCardClick={onCardClick} />
      </div>
    </div>
  );
}
