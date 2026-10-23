import { useEffect, useState } from "react";
import { getAllTenants } from "../../api/tenants";
import { useT } from "../../shared/i18n/i18nContext";
import { Badge, Button, Card, EmptyState, Skeleton } from "../../shared/components";
import { HomeIcon } from "../../shared/icons";
import type { TenantSettings } from "../../shared/types";

export function SuperAdminPanel({ onLogout }: { onLogout: () => void }) {
  const { t } = useT();
  const [tenants, setTenants] = useState<TenantSettings[] | null>(null);

  useEffect(() => {
    getAllTenants().then(setTenants).catch(() => setTenants([]));
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 h-dvh overflow-y-auto antialiased">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{t((l) => l.superAdmin.title)}</h1>
          <p className="text-xs text-gray-500 mt-1">{t((l) => l.superAdmin.subtitle)}</p>
        </div>
        <Button variant="secondary" onClick={onLogout}>{t((l) => l.superAdmin.logout)}</Button>
      </div>

      {tenants === null ? (
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : tenants.length === 0 ? (
        <EmptyState icon={<HomeIcon className="h-6 w-6" />} title={t((l) => l.superAdmin.empty)} />
      ) : (
        <div className="space-y-2">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1c1c1e] truncate">{tenant.displayName}</p>
                <p className="text-xs text-[#8e8e93]">{tenant.slug} · {tenant.waDisplayNumber}</p>
              </div>
              <Badge tone={tenant.subscriptionStatus === "ACTIVE" ? "green" : tenant.subscriptionStatus === "TRIAL" ? "amber" : "red"}>
                {tenant.subscriptionStatus}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
