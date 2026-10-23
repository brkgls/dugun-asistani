import { useState } from "react";
import { LoginPage } from "./auth/LoginPage";
import { useAuth } from "./auth/useAuth";
import { Dashboard } from "./layout/Dashboard";
import type { ViewMode } from "./layout/navigation";
import { LeadBoardView } from "./features/lead-board/LeadBoardView";
import { CalendarView } from "./features/calendar/CalendarView";
import { HallsView } from "./features/halls/HallsView";
import { MenusView } from "./features/menus/MenusView";
import { CapacityRulesView } from "./features/capacity-rules/CapacityRulesView";
import { UserManagement } from "./features/user-management/UserManagement";
import { SettingsView } from "./features/settings/SettingsView";
import { ChangePassword } from "./features/profile/ChangePassword";
import { SuperAdminPanel } from "./features/super-admin-panel/SuperAdminPanel";
import { useT } from "./shared/i18n/i18nContext";
import { BackButton } from "./shared/components";

function App() {
  const { auth, isAdmin, isSuperAdmin, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("leadBoard");
  const { t } = useT();

  if (!auth) {
    return <LoginPage />;
  }

  if (isSuperAdmin) {
    return <SuperAdminPanel onLogout={logout} />;
  }

  const content = (
    <>
      {viewMode === "leadBoard" && <LeadBoardView />}

      {viewMode === "calendar" && <CalendarView />}

      {viewMode === "halls" && <HallsView />}

      {viewMode === "menus" && <MenusView />}

      {viewMode === "capacityRules" && <CapacityRulesView />}

      {viewMode === "users" && isAdmin && (
        <div>
          <BackButton label={t((l) => l.common.back)} onClick={() => setViewMode("leadBoard")} />
          <UserManagement />
        </div>
      )}

      {viewMode === "settings" && isAdmin && (
        <div>
          <BackButton label={t((l) => l.common.back)} onClick={() => setViewMode("leadBoard")} />
          <SettingsView />
        </div>
      )}

      {viewMode === "password" && (
        <div>
          <BackButton label={t((l) => l.common.back)} onClick={() => setViewMode("leadBoard")} />
          <ChangePassword />
        </div>
      )}
    </>
  );

  return (
    <Dashboard auth={auth} isAdmin={isAdmin} viewMode={viewMode} setViewMode={setViewMode} onLogout={logout}>
      {content}
    </Dashboard>
  );
}

export default App;
