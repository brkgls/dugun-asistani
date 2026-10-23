// Self-contained dropdown nav: owns its own open/close state plus outside-click and Escape handling.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useT } from "../../shared/i18n/i18nContext";
import { cn } from "../../shared/utils/cn";
import {
  BellIcon, BellOffIcon, CalendarIcon, ChevronDownIcon, ClockIcon, HomeIcon, LockIcon, LogoutIcon,
  MenuDotsIcon, ServicesIcon, UserGroupIcon,
} from "../../shared/icons";
import type { ViewMode } from "../navigation";
import { getPushStatus, subscribeToPush, unsubscribeFromPush, type PushSupportStatus } from "../../shared/push/subscribeToPush";

type GroupKey = "main" | "business" | "account";

function groupForView(viewMode: ViewMode): GroupKey {
  if (viewMode === "halls" || viewMode === "menus" || viewMode === "capacityRules" || viewMode === "users" || viewMode === "settings") return "business";
  if (viewMode === "password") return "account";
  return "main";
}

interface NavMenuProps {
  viewMode: ViewMode;
  onNavigate: (mode: ViewMode) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export function NavMenu({ viewMode, onNavigate, isAdmin, onLogout }: NavMenuProps) {
  const { t, locale, setLocale } = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null);
  const [pushStatus, setPushStatus] = useState<PushSupportStatus>("unsupported");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getPushStatus().then(setPushStatus);
  }, []);

  async function handleToggleNotifications() {
    if (pushStatus === "subscribed") {
      const ok = await unsubscribeFromPush();
      setPushStatus(ok ? "unsubscribed" : await getPushStatus());
      return;
    }
    const ok = await subscribeToPush();
    setPushStatus(ok ? "subscribed" : await getPushStatus());
  }

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  function go(mode: ViewMode) {
    onNavigate(mode);
    setIsOpen(false);
  }

  function toggleMenu() {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setOpenGroup(groupForView(viewMode));
      return next;
    });
  }

  function toggleGroup(key: GroupKey) {
    setOpenGroup((prev) => (prev === key ? null : key));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 rounded-full border-none bg-[#f5f5f7] px-3 py-2 text-xs font-semibold text-[#444] transition-colors hover:bg-[#ececf0]"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <MenuDotsIcon />
        {t((l) => l.nav.menu)}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-[#ececf2] bg-white shadow-[0_14px_34px_rgba(0,0,0,0.12)]">
          <div className="max-h-[70vh] overflow-y-auto py-1">
            <GroupHeader label={t((l) => l.nav.sectionMain)} open={openGroup === "main"} onClick={() => toggleGroup("main")} />
            {openGroup === "main" && (
              <div className="pb-1">
                <MenuItem label={t((l) => l.nav.leadBoard)} active={viewMode === "leadBoard"} icon={<HomeIcon />} onClick={() => go("leadBoard")} />
                <MenuItem label={t((l) => l.nav.calendar)} active={viewMode === "calendar"} icon={<CalendarIcon />} onClick={() => go("calendar")} />
              </div>
            )}

            <div className="my-1 h-px bg-[#f0f0f4]" />

            <GroupHeader label={t((l) => l.nav.sectionBusiness)} open={openGroup === "business"} onClick={() => toggleGroup("business")} />
            {openGroup === "business" && (
              <div className="pb-1">
                <MenuItem label={t((l) => l.nav.halls)} active={viewMode === "halls"} icon={<ServicesIcon />} onClick={() => go("halls")} />
                <MenuItem label={t((l) => l.nav.menus)} active={viewMode === "menus"} icon={<ServicesIcon />} onClick={() => go("menus")} />
                <MenuItem label={t((l) => l.nav.capacityRules)} active={viewMode === "capacityRules"} icon={<ClockIcon />} onClick={() => go("capacityRules")} />
                {isAdmin && (
                  <MenuItem label={t((l) => l.nav.users)} active={viewMode === "users"} icon={<UserGroupIcon />} onClick={() => go("users")} />
                )}
                {isAdmin && (
                  <MenuItem label={t((l) => l.nav.settings)} active={viewMode === "settings"} icon={<ClockIcon />} onClick={() => go("settings")} />
                )}
              </div>
            )}

            <div className="my-1 h-px bg-[#f0f0f4]" />

            <GroupHeader label={t((l) => l.nav.sectionAccount)} open={openGroup === "account"} onClick={() => toggleGroup("account")} />
            {openGroup === "account" && (
              <div className="pb-1">
                <MenuItem label={t((l) => l.nav.changePassword)} active={viewMode === "password"} icon={<LockIcon />} onClick={() => go("password")} />

                {pushStatus !== "unsupported" && (
                  <MenuItem
                    label={pushStatus === "subscribed" ? t((l) => l.nav.disableNotifications) : t((l) => l.nav.enableNotifications)}
                    icon={pushStatus === "subscribed" ? <BellOffIcon /> : <BellIcon />}
                    onClick={handleToggleNotifications}
                  />
                )}

                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs font-semibold text-[#6b7280]">{t((l) => l.nav.language)}</span>
                  <div className="flex gap-1">
                    <LocaleButton label="TR" active={locale === "tr"} onClick={() => setLocale("tr")} />
                    <LocaleButton label="EN" active={locale === "en"} onClick={() => setLocale("en")} />
                  </div>
                </div>
              </div>
            )}

            <div className="my-1 h-px bg-[#f0f0f4]" />

            <MenuItem label={t((l) => l.nav.logout)} icon={<LogoutIcon />} onClick={onLogout} danger />
          </div>
        </div>
      )}
    </div>
  );
}

function GroupHeader({ label, open, onClick }: { label: string; open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] transition-colors hover:bg-[#f8f8fb]"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {label}
      <ChevronDownIcon className={cn("h-3 w-3 text-[#c2c6d0] transition-transform", open && "rotate-180")} />
    </button>
  );
}

function MenuItem({ label, icon, onClick, active = false, danger = false }: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium transition-colors",
        danger ? "text-[#dc2626] hover:bg-[#fff5f5]" : active ? "bg-[#f4f8ff] text-[#2563eb]" : "text-[#1f2937] hover:bg-[#f8f8fb]",
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <span className="flex items-center gap-2.5">
        {icon}
        {label}
      </span>
      {!danger && <span className="text-[#c2c6d0]">›</span>}
    </button>
  );
}

function LocaleButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn("rounded-lg px-2.5 py-1 text-xs font-bold transition-colors", active ? "bg-[#007ff5] text-white" : "bg-[#f5f5f7] text-[#444]")}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {label}
    </button>
  );
}
