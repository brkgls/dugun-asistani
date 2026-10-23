import { useEffect, useState } from "react";
import { useCapacityRules } from "./useCapacityRules";
import { CapacityRuleForm } from "./CapacityRuleForm";
import { getHalls } from "../../api/halls";
import { getMenus } from "../../api/menus";
import { Banner, Badge, Button, Card, EmptyState, PageHeader, Skeleton } from "../../shared/components";
import { useT } from "../../shared/i18n/i18nContext";
import { ClockIcon, PlusIcon, TrashIcon } from "../../shared/icons";
import type { CapacityRule, Hall, Menu } from "../../shared/types";

export function CapacityRulesView() {
  const { t } = useT();
  const { rules, error, create, update, remove } = useCapacityRules();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [editing, setEditing] = useState<CapacityRule | null | undefined>(undefined);

  useEffect(() => {
    getHalls(true).then(setHalls).catch(() => setHalls([]));
    getMenus(true).then(setMenus).catch(() => setMenus([]));
  }, []);

  function timeSlotLabel(ts: CapacityRule["timeSlot"]) {
    if (ts === "WEEKDAY_EVENING") return t((l) => l.capacityRules.form.timeSlotWeekdayEvening);
    if (ts === "WEEKEND_EVENING") return t((l) => l.capacityRules.form.timeSlotWeekendEvening);
    if (ts === "WEEKEND_DAY") return t((l) => l.capacityRules.form.timeSlotWeekendDay);
    return t((l) => l.capacityRules.form.timeSlotAll);
  }

  function monthsLabel(months: number[]) {
    if (months.length === 0) return t((l) => l.capacityRules.allMonths);
    const names = t((l) => l.months);
    return months.map((m) => names[m - 1]?.slice(0, 3)).join(", ");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <PageHeader eyebrow={t((l) => l.nav.sectionBusiness)} title={t((l) => l.capacityRules.title)} />
        <Button size="sm" onClick={() => setEditing(null)}>
          <PlusIcon className="h-4 w-4" /> {t((l) => l.capacityRules.addButton)}
        </Button>
      </div>
      <p className="text-xs text-[#8e8e93] -mt-2 px-1">{t((l) => l.capacityRules.subtitle)}</p>

      {error && <Banner variant="error">{error}</Banner>}

      {rules === null ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : rules.length === 0 ? (
        <EmptyState icon={<ClockIcon className="h-6 w-6" />} title={t((l) => l.capacityRules.empty)} />
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#1c1c1e]">
                    {rule.hallName ?? t((l) => l.capacityRules.allHalls)}
                    {rule.menuName ? ` · ${rule.menuName}` : ""}
                  </span>
                  <Badge tone={rule.active ? "green" : "gray"}>{rule.active ? t((l) => l.common.active) : t((l) => l.common.inactive)}</Badge>
                </div>
                <p className="text-xs text-[#8e8e93] mt-1">
                  {monthsLabel(rule.months)} · {timeSlotLabel(rule.timeSlot)} · {t((l) => l.capacityRules.closedLabel)}
                </p>
                {rule.note && <p className="text-xs text-[#8e8e93] mt-1 italic">{rule.note}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="soft" onClick={() => setEditing(rule)}>{t((l) => l.common.edit)}</Button>
                <Button size="sm" variant="ghost" tone="red" onClick={() => confirm(t((l) => l.common.deleteConfirm)) && remove(rule.id)}>
                  <TrashIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <CapacityRuleForm
          rule={editing}
          halls={halls}
          menus={menus}
          onClose={() => setEditing(undefined)}
          onSave={(data) => (editing ? update(editing.id, data) : create(data))}
        />
      )}
    </div>
  );
}
