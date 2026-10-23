import { useEffect, useState } from "react";
import { useMenus } from "./useMenus";
import { MenuForm } from "./MenuForm";
import { getHalls } from "../../api/halls";
import { Banner, Badge, Button, Card, EmptyState, PageHeader, Skeleton } from "../../shared/components";
import { useT } from "../../shared/i18n/i18nContext";
import { PlusIcon, ServicesIcon } from "../../shared/icons";
import type { Hall, Menu } from "../../shared/types";

export function MenusView() {
  const { t } = useT();
  const { menus, error, create, update, toggleActive } = useMenus();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [editing, setEditing] = useState<Menu | null | undefined>(undefined);

  useEffect(() => {
    getHalls(true).then(setHalls).catch(() => setHalls([]));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <PageHeader eyebrow={t((l) => l.nav.sectionBusiness)} title={t((l) => l.menus.title)} />
        <Button size="sm" tone="amber" onClick={() => setEditing(null)}>
          <PlusIcon className="h-4 w-4" /> {t((l) => l.menus.addButton)}
        </Button>
      </div>
      <p className="text-xs text-[#8e8e93] -mt-2 px-1">{t((l) => l.menus.subtitle)}</p>

      {error && <Banner variant="error">{error}</Banner>}

      {menus === null ? (
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : menus.length === 0 ? (
        <EmptyState icon={<ServicesIcon className="h-6 w-6 text-[#b45309]" />} title={t((l) => l.menus.empty)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {menus.map((menu) => (
            <Card key={menu.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1c1c1e] truncate">{menu.name}</p>
                  {menu.description && <p className="text-xs text-[#8e8e93] mt-0.5">{menu.description}</p>}
                  {menu.pricePerPerson != null && (
                    <p className="text-xs font-semibold text-[#b45309] mt-1">{menu.pricePerPerson.toLocaleString("tr-TR")} ₺ / {t((l) => l.common.person)}</p>
                  )}
                  {menu.hallIds.length > 0 && (
                    <p className="text-[11px] text-[#8e8e93] mt-1">
                      {menu.hallIds.map((id) => halls.find((h) => h.id === id)?.name).filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <Badge tone={menu.active ? "green" : "gray"}>{menu.active ? t((l) => l.common.active) : t((l) => l.common.inactive)}</Badge>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="soft" tone="amber" onClick={() => setEditing(menu)}>{t((l) => l.common.edit)}</Button>
                <Button size="sm" variant="secondary" onClick={() => toggleActive(menu)}>
                  {menu.active ? t((l) => l.common.inactive) : t((l) => l.common.active)}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <MenuForm
          menu={editing}
          halls={halls}
          onClose={() => setEditing(undefined)}
          onSave={(data) => (editing ? update(editing.id, data) : create(data))}
        />
      )}
    </div>
  );
}
