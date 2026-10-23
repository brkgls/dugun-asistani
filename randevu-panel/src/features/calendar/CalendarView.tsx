import { useState } from "react";
import { useCalendar } from "./useCalendar";
import { DayDetailModal } from "./DayDetailModal";
import { Banner, Button, IconButton, PageHeader, Skeleton } from "../../shared/components";
import { useT } from "../../shared/i18n/i18nContext";
import { ChevronLeftIcon, ChevronRightIcon } from "../../shared/icons";
import { cn } from "../../shared/utils/cn";
import { NO_MENU_COLOR } from "./calendarColors";

export function CalendarView() {
  const { t, locale } = useT();
  const {
    leads,
    halls,
    menus,
    menuColors,
    error,
    monthCursor,
    gridDays,
    leadsByDate,
    toDateKey,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    goToMonth,
    saveLead,
    addLead,
  } = useCalendar();
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(monthCursor.getFullYear());

  const monthLabel = monthCursor.toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", { month: "long", year: "numeric" });
  const todayKey = toDateKey(new Date());
  const weekdays = t((l) => l.calendar.weekdaysShort);
  const monthNames = t((l) => l.months);
  const now = new Date();

  function openPicker() {
    setPickerYear(monthCursor.getFullYear());
    setPickerOpen(true);
  }

  function selectMonth(monthIndex: number) {
    goToMonth(pickerYear, monthIndex);
    setPickerOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader eyebrow={t((l) => l.nav.sectionMain)} title={t((l) => l.calendar.title)} />
        <Button size="sm" variant="secondary" onClick={goToToday}>
          {t((l) => l.calendar.today)}
        </Button>
      </div>
      <p className="text-xs text-[#8e8e93] -mt-2 px-1">{t((l) => l.calendar.subtitle)}</p>

      {error && <Banner variant="error">{error}</Banner>}

      {menus.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-1">
          <span className="text-[11px] font-bold text-[#8e8e93] uppercase tracking-wide">{t((l) => l.calendar.legendTitle)}</span>
          {menus.map((m) => (
            <span key={m.id} className="inline-flex items-center gap-1.5 text-xs text-[#6b7280]">
              <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: menuColors.get(m.id) ?? NO_MENU_COLOR }} />
              {m.name}
            </span>
          ))}
        </div>
      )}

      <div className="relative flex items-center justify-between px-1">
        <IconButton aria-label="prev" icon={<ChevronLeftIcon className="h-4 w-4" />} onClick={goToPrevMonth} />
        <button
          type="button"
          onClick={openPicker}
          className="text-base font-bold text-[#1c1c1e] capitalize rounded-lg px-2 py-1 hover:bg-[#f2f2f7] transition-colors cursor-pointer"
        >
          {monthLabel}
        </button>
        <IconButton aria-label="next" icon={<ChevronRightIcon className="h-4 w-4" />} onClick={goToNextMonth} />

        {pickerOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setPickerOpen(false)} />
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-[#f2f2f7] p-3 w-[280px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <IconButton
                  size={32}
                  aria-label="prev-year"
                  icon={<ChevronLeftIcon className="h-3.5 w-3.5" />}
                  onClick={() => setPickerYear((y) => y - 1)}
                />
                <span className="text-sm font-bold text-[#1c1c1e]">{pickerYear}</span>
                <IconButton
                  size={32}
                  aria-label="next-year"
                  icon={<ChevronRightIcon className="h-3.5 w-3.5" />}
                  onClick={() => setPickerYear((y) => y + 1)}
                />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {monthNames.map((name, idx) => {
                  const isSelected = pickerYear === monthCursor.getFullYear() && idx === monthCursor.getMonth();
                  const isCurrent = pickerYear === now.getFullYear() && idx === now.getMonth();
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => selectMonth(idx)}
                      className={cn(
                        "text-xs font-semibold rounded-lg py-2 transition-colors",
                        isSelected ? "bg-[#007ff5] text-white" : "text-[#1c1c1e] hover:bg-[#f2f2f7]",
                        !isSelected && isCurrent && "ring-1 ring-inset ring-[#007ff5] text-[#007ff5]",
                      )}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {leads === null ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((w) => (
            <div key={w} className="text-center text-[10px] font-bold text-[#8e8e93] uppercase py-1">
              {w}
            </div>
          ))}

          {gridDays.map((day) => {
            const key = toDateKey(day);
            const dayLeads = leadsByDate.get(key) ?? [];
            const inMonth = day.getMonth() === monthCursor.getMonth();
            const isToday = key === todayKey;
            const hasLeads = dayLeads.length > 0;
            const dominantColor = hasLeads
              ? dayLeads[0].menuId
                ? menuColors.get(dayLeads[0].menuId) ?? NO_MENU_COLOR
                : NO_MENU_COLOR
              : null;

            return (
              <button
                key={key}
                onClick={() => setSelectedDateKey(key)}
                style={hasLeads && inMonth ? { background: `linear-gradient(160deg, ${dominantColor}1f, #ffffff 60%)` } : undefined}
                className={cn(
                  "relative aspect-square rounded-xl border p-1.5 flex flex-col items-center text-left transition-all",
                  inMonth ? "bg-white border-[#f0f0f0]" : "bg-[#f9f9fb] border-transparent",
                  hasLeads && "hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:border-transparent",
                  isToday && "ring-2 ring-[#007ff5] ring-offset-1",
                )}
              >
                <span
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold",
                    isToday ? "bg-[#007ff5] text-white shadow-[0_2px_6px_rgba(0,127,245,0.4)]" : inMonth ? "text-[#1c1c1e]" : "text-[#c7c7cc]",
                  )}
                >
                  {day.getDate()}
                </span>
                {hasLeads && (
                  <div className="flex flex-wrap gap-0.5 justify-center mt-1 max-w-full">
                    {dayLeads.slice(0, 4).map((lead) => (
                      <span
                        key={lead.id}
                        className="h-1.5 w-1.5 rounded-full inline-block"
                        style={{ backgroundColor: lead.menuId ? menuColors.get(lead.menuId) ?? NO_MENU_COLOR : NO_MENU_COLOR }}
                      />
                    ))}
                  </div>
                )}
                {hasLeads && (
                  <span
                    className="absolute bottom-1 right-1 h-4 min-w-[16px] px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: dominantColor ?? NO_MENU_COLOR }}
                  >
                    {dayLeads.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedDateKey && (
        <DayDetailModal
          dateKey={selectedDateKey}
          dateLabel={new Date(selectedDateKey + "T00:00:00").toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            weekday: "long",
          })}
          leads={leadsByDate.get(selectedDateKey) ?? []}
          halls={halls}
          menus={menus}
          menuColors={menuColors}
          onClose={() => setSelectedDateKey(null)}
          onSaveLead={saveLead}
          onAddLead={addLead}
        />
      )}
    </div>
  );
}
