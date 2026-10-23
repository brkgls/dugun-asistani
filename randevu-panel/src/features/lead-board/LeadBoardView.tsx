import { useEffect, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useLeadBoard } from "./useLeadBoard";
import { KanbanColumn } from "./KanbanColumn";
import { WeekGroupedLeadList } from "./WeekGroupedLeadList";
import { ResolvedLeadsView } from "./ResolvedLeadsView";
import { LeadDetailModal } from "./LeadDetailModal";
import { LeadAddModal } from "./LeadAddModal";
import { ACTIVE_STAGES } from "./leadFilters";
import { STAGE_TONE } from "./stageTheme";
import { getHalls } from "../../api/halls";
import { getMenus } from "../../api/menus";
import { Banner, Button, PageHeader, SegmentedControl, SelectField, Skeleton } from "../../shared/components";
import { useT } from "../../shared/i18n/i18nContext";
import { PlusIcon } from "../../shared/icons";
import { cn } from "../../shared/utils/cn";
import { TONES } from "../../shared/theme/tones";
import type { Hall, Lead, LeadMood, LeadStage, Menu } from "../../shared/types";

type BoardTab = "board" | "resolved";

export function LeadBoardView() {
  const { t } = useT();
  const { leads, columns, resolvedLeads, error, filters, setFilters, moveToStage, saveLead, addLead } = useLeadBoard();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<BoardTab>("board");
  const [mobileStage, setMobileStage] = useState<LeadStage>("NEW");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    getHalls(true).then(setHalls).catch(() => setHalls([]));
    getMenus(true).then(setMenus).catch(() => setMenus([]));
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const leadId = String(active.id);
    const targetStage = over.id as LeadStage;
    const lead = leads?.find((l) => l.id === leadId);
    if (lead && lead.stage !== targetStage) {
      moveToStage(leadId, targetStage);
    }
  }

  // Detay modalindaki degisiklikleri gorebilmek icin secili lead'i guncel listeden tazeliyoruz.
  const liveSelectedLead = selectedLead ? leads?.find((l) => l.id === selectedLead.id) ?? selectedLead : null;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader
          eyebrow={t((l) => l.nav.sectionMain)}
          title={activeTab === "board" ? t((l) => l.leadBoard.title) : t((l) => l.leadBoard.resolved.title)}
        />
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <PlusIcon className="h-4 w-4" /> {t((l) => l.leadBoard.addButton)}
        </Button>
      </div>

      <SegmentedControl<BoardTab>
        size="sm"
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { value: "board", label: t((l) => l.leadBoard.tabs.board) },
          { value: "resolved", label: t((l) => l.leadBoard.tabs.resolved) },
        ]}
      />

      {error && <Banner variant="error">{error}</Banner>}

      {activeTab === "board" ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
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
              className="w-auto min-w-[140px]"
              value={filters.mood}
              onChange={(e) => setFilters((f) => ({ ...f, mood: e.target.value as LeadMood | "" }))}
            >
              <option value="">{t((l) => l.leadBoard.filterMoodAll)}</option>
              {(["POSITIVE", "NEGATIVE", "NEUTRAL", "CONFUSED"] as LeadMood[]).map((m) => (
                <option key={m} value={m}>{t((l) => l.leadBoard.mood[m])}</option>
              ))}
            </SelectField>
          </div>

          {leads === null ? (
            <div className="flex gap-3">
              <Skeleton className="h-64 flex-1" />
              <Skeleton className="h-64 flex-1" />
              <Skeleton className="h-64 flex-1" />
            </div>
          ) : (
            <>
              {/* Mobil: yatay kaydırmalı sütunlar yerine aşama seçici + tek sütun liste */}
              <div className="md:hidden flex-1 flex flex-col min-h-0">
                <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
                  {ACTIVE_STAGES.map((stage) => {
                    const count = columns[stage]?.reduce((sum, g) => sum + g.leads.length, 0) ?? 0;
                    const active = stage === mobileStage;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setMobileStage(stage)}
                        className={cn(
                          "shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors border",
                          active ? "text-white border-transparent" : "bg-white text-[#48484a] border-[#e5e5ea]",
                        )}
                        style={active ? { backgroundColor: TONES[STAGE_TONE[stage]].solidHex } : undefined}
                      >
                        {t((l) => l.leadBoard.stage[stage])}
                        <span className={cn("text-[10px] rounded-full px-1.5", active ? "bg-white/25" : "bg-[#f2f2f7]")}>{count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex-1 rounded-2xl p-2 bg-[#f4f4f7]">
                  <WeekGroupedLeadList
                    weekGroups={columns[mobileStage] ?? []}
                    emptyLabel={t((l) => l.leadBoard.emptyColumn)}
                    onCardClick={setSelectedLead}
                  />
                </div>
              </div>

              {/* Masaüstü: sürükle-bırak kanban */}
              <div className="hidden md:block flex-1">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                  <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-3 pb-2 min-w-min">
                      {ACTIVE_STAGES.map((stage) => (
                        <KanbanColumn key={stage} stage={stage} weekGroups={columns[stage]} onCardClick={setSelectedLead} />
                      ))}
                    </div>
                  </div>
                </DndContext>
              </div>
            </>
          )}
        </>
      ) : (
        <ResolvedLeadsView leads={resolvedLeads} halls={halls} menus={menus} onCardClick={setSelectedLead} />
      )}

      {liveSelectedLead && (
        <LeadDetailModal
          lead={liveSelectedLead}
          halls={halls}
          menus={menus}
          onClose={() => setSelectedLead(null)}
          onSave={(data) => saveLead(liveSelectedLead.id, data)}
        />
      )}

      {showAddModal && (
        <LeadAddModal halls={halls} menus={menus} onClose={() => setShowAddModal(false)} onSave={addLead} />
      )}
    </div>
  );
}
