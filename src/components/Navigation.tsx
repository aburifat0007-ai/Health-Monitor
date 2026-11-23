import type { MouseEvent } from 'react';
import { Activity, HeartPulse, LayoutDashboard, Moon, User } from 'lucide-react';
import type { NavTransition, ScreenId } from '../types/wellness';

interface NavigationProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId, transition?: NavTransition) => void;
  memberName: string;
  deviceName: string;
}

const NAV_ITEMS: Array<{
  path: ScreenId;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: 'vitals', label: 'Vitals', icon: HeartPulse },
  { path: 'sleep', label: 'Sleep', icon: Moon },
  { path: 'activity', label: 'Activity', icon: Activity },
  { path: 'profile', label: 'Profile', icon: User },
];

export function Navigation({
  activeScreen,
  onNavigate,
  memberName,
  deviceName,
}: NavigationProps) {
  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, path: ScreenId) => {
    e.preventDefault();
    onNavigate(path, 'none');
  };

  return (
    <aside className="md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-60 md:flex md:flex-col md:border-r md:border-white/[0.08] md:bg-[#161d1b]">
      {/* Desktop brand mark (single clean text element) */}
      <div className="hidden md:flex items-center px-6 pt-7 pb-6">
        <span className="text-xl font-bold tracking-tight text-[#dde4e1] whitespace-nowrap">
          Vespera
        </span>
      </div>

      {/* Single unified <nav> across desktop sidebar & mobile fixed bottom bar */}
      <nav
        aria-label="Primary navigation"
        className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-white/[0.08] bg-[#161d1b]/95 backdrop-blur-md grid grid-cols-5 items-center px-1 md:static md:flex md:flex-1 md:flex-col md:items-stretch md:gap-1.5 md:border-t-0 md:bg-transparent md:backdrop-blur-none md:px-3 md:py-2 md:h-auto"
      >
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = activeScreen === path;
          return (
            <a
              key={path}
              href={`#${path}`}
              data-path={path}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => handleLinkClick(e, path)}
              className={`group flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 min-h-[44px] px-2 md:px-4 py-1.5 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4fdbc8] whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-[#4fdbc8] md:bg-[#1a211f] md:text-[#4fdbc8] md:border md:border-[#4fdbc8]/25'
                  : 'text-[#bbcac6] hover:text-[#dde4e1] md:hover:bg-[#1a211f]/60 md:border md:border-transparent'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-[#4fdbc8]' : 'text-[#859490] group-hover:text-[#dde4e1]'
                }`}
                strokeWidth={isActive ? 2.2 : 1.75}
                aria-hidden="true"
              />
              <span>{label}</span>
            </a>
          );
        })}
      </nav>

      {/* Desktop member summary footer inside sidebar */}
      <div className="hidden md:block px-5 py-5 border-t border-white/[0.06]">
        <p className="text-sm font-medium text-[#dde4e1] truncate">{memberName}</p>
        <p className="text-xs text-[#859490] mt-0.5 truncate">{deviceName}</p>
      </div>
    </aside>
  );
}
