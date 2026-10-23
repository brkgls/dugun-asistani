import { useState } from "react";
import { useHalls } from "./useHalls";
import { HallForm } from "./HallForm";
import { Banner, Badge, Button, Card, EmptyState, PageHeader, Skeleton } from "../../shared/components";
import { useT } from "../../shared/i18n/i18nContext";
import { PlusIcon, ServicesIcon } from "../../shared/icons";
import type { Hall } from "../../shared/types";

export function HallsView() {
  const { t } = useT();
  const { halls, error, create, update, toggleActive } = useHalls();
  const [editing, setEditing] = useState<Hall | null | undefined>(undefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <PageHeader eyebrow={t((l) => l.nav.sectionBusiness)} title={t((l) => l.halls.title)} />
        <Button size="sm" tone="purple" onClick={() => setEditing(null)}>
          <PlusIcon className="h-4 w-4" /> {t((l) => l.halls.addButton)}
        </Button>
      </div>
      <p className="text-xs text-[#8e8e93] -mt-2 px-1">{t((l) => l.halls.subtitle)}</p>

      {error && <Banner variant="error">{error}</Banner>}

      {halls === null ? (
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : halls.length === 0 ? (
        <EmptyState icon={<ServicesIcon className="h-6 w-6 text-[#9333ea]" />} title={t((l) => l.halls.empty)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {halls.map((hall) => (
            <Card key={hall.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1c1c1e] truncate">{hall.name}</p>
                  {hall.description && <p className="text-xs text-[#8e8e93] mt-0.5">{hall.description}</p>}
                  {(hall.capacityMin || hall.capacityMax) && (
                    <p className="text-xs text-[#8e8e93] mt-1">
                      {hall.capacityMin ?? "0"}–{hall.capacityMax ?? "∞"} {t((l) => l.common.person)}
                    </p>
                  )}
                  <p className="text-[11px] text-[#8e8e93] mt-1">
                    {hall.dailyCapacity === 2 ? t((l) => l.halls.form.dailyCapacityTwo) : t((l) => l.halls.form.dailyCapacityOne)}
                  </p>
                </div>
                <Badge tone={hall.active ? "green" : "gray"}>{hall.active ? t((l) => l.common.active) : t((l) => l.common.inactive)}</Badge>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="soft" tone="purple" onClick={() => setEditing(hall)}>{t((l) => l.common.edit)}</Button>
                <Button size="sm" variant="secondary" onClick={() => toggleActive(hall)}>
                  {hall.active ? t((l) => l.common.inactive) : t((l) => l.common.active)}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <HallForm
          hall={editing}
          onClose={() => setEditing(undefined)}
          onSave={(data) => (editing ? update(editing.id, data) : create(data))}
        />
      )}
    </div>
  );
}
