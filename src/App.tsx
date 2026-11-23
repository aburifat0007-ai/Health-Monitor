import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { ActivityScreen } from './components/screens/ActivityScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SleepScreen } from './components/screens/SleepScreen';
import { VitalsScreen } from './components/screens/VitalsScreen';
import { INITIAL_USER_PROFILE, INITIAL_WELLNESS_DAYS } from './data/seedData';
import type { NavTransition, ScreenId, UserProfile, WellnessAppState } from './types/wellness';
import { applyLoggedWorkout, type WorkoutFormInput } from './utils/biometrics';

const STORAGE_KEY = 'vespera_wellness_v1';

const VALID_SCREENS: ScreenId[] = ['dashboard', 'vitals', 'sleep', 'activity', 'profile'];

function getDefaultState(): WellnessAppState {
  return {
    days: INITIAL_WELLNESS_DAYS,
    selectedDateIso: INITIAL_WELLNESS_DAYS[INITIAL_WELLNESS_DAYS.length - 1].dateIso,
    profile: INITIAL_USER_PROFILE,
  };
}

function loadPersistedState(): WellnessAppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as Partial<WellnessAppState>;
    if (!parsed || !Array.isArray(parsed.days) || parsed.days.length === 0 || !parsed.profile) {
      return getDefaultState();
    }
    const validSelected = parsed.days.some((d) => d.dateIso === parsed.selectedDateIso)
      ? (parsed.selectedDateIso as string)
      : parsed.days[parsed.days.length - 1].dateIso;
    return {
      days: parsed.days,
      selectedDateIso: validSelected,
      profile: { ...INITIAL_USER_PROFILE, ...parsed.profile },
    };
  } catch {
    return getDefaultState();
  }
}

function getInitialScreen(): ScreenId {
  const hash = window.location.hash.replace(/^#/, '') as ScreenId;
  if (VALID_SCREENS.includes(hash)) {
    return hash;
  }
  return 'dashboard';
}

export default function App() {
  const [appState, setAppState] = useState<WellnessAppState>(() => loadPersistedState());
  const [activeScreen, setActiveScreen] = useState<ScreenId>(() => getInitialScreen());
  const [transitionType, setTransitionType] = useState<NavTransition>('none');
  const [cameFromPush, setCameFromPush] = useState(false);
  const [transitionTick, setTransitionTick] = useState(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch {
      // Ignore quota errors in restricted sandboxes
    }
  }, [appState]);

  useEffect(() => {
    const handleHashChange = () => {
      const next = window.location.hash.replace(/^#/, '') as ScreenId;
      if (VALID_SCREENS.includes(next) && next !== activeScreen) {
        setTransitionType('none');
        setCameFromPush(false);
        setActiveScreen(next);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeScreen]);

  const handleNavigate = (screen: ScreenId, transition: NavTransition = 'none') => {
    setTransitionType(transition);
    setCameFromPush(transition === 'push');
    if (transition === 'push') {
      setTransitionTick((t) => t + 1);
    }
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (window.location.hash !== `#${screen}`) {
      window.history.replaceState(null, '', `#${screen}`);
    }
  };

  const selectedDay =
    appState.days.find((d) => d.dateIso === appState.selectedDateIso) ??
    appState.days[appState.days.length - 1];

  const handleSelectDate = (dateIso: string) => {
    setAppState((prev) => ({
      ...prev,
      selectedDateIso: dateIso,
    }));
  };

  const handleUpdateVitalsCheckIn = (
    dateIso: string,
    hydrationLiters: number,
    checkInNote: string,
  ) => {
    setAppState((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.dateIso === dateIso
          ? {
              ...day,
              vitals: {
                ...day.vitals,
                hydrationLiters,
                checkInNote,
              },
            }
          : day,
      ),
    }));
  };

  const handleUpdateSleepReflection = (
    dateIso: string,
    rating: number,
    morningNote: string,
  ) => {
    setAppState((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.dateIso === dateIso
          ? {
              ...day,
              sleep: {
                ...day.sleep,
                restfulnessRating: rating,
                morningNote,
              },
            }
          : day,
      ),
    }));
  };

  const handleLogWorkout = (dateIso: string, input: WorkoutFormInput) => {
    setAppState((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.dateIso === dateIso ? applyLoggedWorkout(day, input) : day,
      ),
    }));
  };

  const handleUpdateProfile = (nextProfile: UserProfile) => {
    setAppState((prev) => ({
      ...prev,
      profile: nextProfile,
    }));
  };

  const handleResetDemoData = () => {
    const fresh = getDefaultState();
    setAppState(fresh);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1513] text-[#dde4e1]">
      <Navigation
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        memberName={appState.profile.name}
        deviceName={appState.profile.deviceName}
      />

      <main className="md:pl-60 min-h-screen">
        <div
          key={transitionType === 'push' ? `push-${activeScreen}-${transitionTick}` : activeScreen}
          className={`max-w-6xl mx-auto px-5 sm:px-8 pt-6 pb-24 md:py-9 ${
            transitionType === 'push' ? 'animate-push-enter' : ''
          }`}
        >
          {activeScreen === 'dashboard' ? (
            <DashboardScreen
              days={appState.days}
              selectedDay={selectedDay}
              profile={appState.profile}
              onSelectDate={handleSelectDate}
              onNavigate={handleNavigate}
            />
          ) : null}

          {activeScreen === 'vitals' ? (
            <VitalsScreen
              days={appState.days}
              selectedDay={selectedDay}
              profile={appState.profile}
              onSelectDate={handleSelectDate}
              onUpdateVitalsCheckIn={handleUpdateVitalsCheckIn}
            />
          ) : null}

          {activeScreen === 'sleep' ? (
            <SleepScreen
              days={appState.days}
              selectedDay={selectedDay}
              profile={appState.profile}
              cameFromPush={cameFromPush}
              onSelectDate={handleSelectDate}
              onNavigate={handleNavigate}
              onUpdateSleepReflection={handleUpdateSleepReflection}
            />
          ) : null}

          {activeScreen === 'activity' ? (
            <ActivityScreen
              days={appState.days}
              selectedDay={selectedDay}
              profile={appState.profile}
              onSelectDate={handleSelectDate}
              onLogWorkout={handleLogWorkout}
            />
          ) : null}

          {activeScreen === 'profile' ? (
            <ProfileScreen
              profile={appState.profile}
              onUpdateProfile={handleUpdateProfile}
              onResetDemoData={handleResetDemoData}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
