import type { DailyWellnessEntry } from '../types/wellness';

interface DaySelectorProps {
  days: DailyWellnessEntry[];
  selectedDateIso: string;
  onSelectDate: (dateIso: string) => void;
}

export function DaySelector({ days, selectedDateIso, onSelectDate }: DaySelectorProps) {
  return (
    <div
      className="grid grid-cols-7 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto"
      role="group"
      aria-label="Select day"
    >
      {days.map((day, index) => {
        const isSelected = day.dateIso === selectedDateIso;
        const isToday = index === days.length - 1;
        return (
          <button
            key={day.dateIso}
            type="button"
            onClick={() => onSelectDate(day.dateIso)}
            aria-pressed={isSelected}
            className={`flex flex-col items-center justify-center sm:min-w-[52px] min-h-[52px] px-1 sm:px-3 py-1.5 sm:py-2 rounded-2xl border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4fdbc8] cursor-pointer ${
              isSelected
                ? 'bg-[#14b8a6]/15 border-[#4fdbc8]/50 text-[#dde4e1]'
                : 'bg-[#1a211f] border-white/[0.06] text-[#859490] hover:text-[#dde4e1] hover:border-white/[0.14]'
            }`}
          >
            <span className="text-[10px] sm:text-[11px] font-medium whitespace-nowrap">
              {isToday ? 'Today' : day.shortDay}
            </span>
            <span
              className={`text-xs sm:text-sm font-semibold tabular-nums mt-0.5 ${
                isSelected ? 'text-[#4fdbc8]' : 'text-[#bbcac6]'
              }`}
            >
              {day.dayNum}
            </span>
          </button>
        );
      })}
    </div>
  );
}
