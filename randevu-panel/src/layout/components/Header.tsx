import { useT } from "../../shared/i18n/i18nContext";
import { NavMenu } from "./NavMenu";
import type { ViewMode } from "../navigation";

interface HeaderProps {
  tenantName: string;
  viewMode: ViewMode;
  onNavigate: (mode: ViewMode) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export function Header({ tenantName, viewMode, onNavigate, isAdmin, onLogout }: HeaderProps) {
  const { locale } = useT();

  return (
    <header className="flex items-center justify-between px-5 pb-3 pt-6 md:px-1 md:pt-3 box-border bg-white md:bg-transparent border-b md:border-b-0 border-black/[0.02]">
      <div>
        <h1
          className="m-0 text-2xl font-extralight bg-clip-text text-transparent"
          style={{ background: "linear-gradient(90deg, #ff007f, #7928ca, #0070f3)", WebkitBackgroundClip: "text" }}
        >
          {tenantName}
        </h1>
        <p className="m-0 mt-1 text-[11px] uppercase text-[#aaa] font-medium">
          {new Date().toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <NavMenu viewMode={viewMode} onNavigate={onNavigate} isAdmin={isAdmin} onLogout={onLogout} />
    </header>
  );
}
