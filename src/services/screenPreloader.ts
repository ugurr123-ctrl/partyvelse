import React, { lazy, ComponentType } from 'react';
import { MissionState, Role, MiniGameType, OperationTheme } from '../types/game';

export type PreloadableComponent<T extends ComponentType<any>> = React.LazyExoticComponent<T> & {
  preload: () => Promise<any>;
  isLoaded: () => boolean;
};

/**
 * Creates a lazy component with a synchronous preload hook.
 * Invoking `.preload()` triggers dynamic module import and stores the resolved component,
 * ensuring zero delay when React renders the component inside Suspense or AnimatePresence.
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  importFn: () => Promise<{ [key: string]: any }>,
  exportName?: string
): PreloadableComponent<T> {
  let loadedComponent: T | null = null;
  let loadingPromise: Promise<T> | null = null;

  const load = (): Promise<T> => {
    if (loadedComponent) {
      return Promise.resolve(loadedComponent);
    }
    if (!loadingPromise) {
      loadingPromise = importFn()
        .then((mod) => {
          const comp = (exportName ? mod[exportName] : mod.default || mod[Object.keys(mod)[0]]) as T;
          loadedComponent = comp;
          return comp;
        })
        .catch((err) => {
          console.error(`[ScreenPreloader] Failed to preload screen ${exportName || 'default'}:`, err);
          loadingPromise = null;
          throw err;
        });
    }
    return loadingPromise;
  };

  const LazyComp = lazy(async () => {
    if (loadedComponent) {
      return { default: loadedComponent };
    }
    const comp = await load();
    return { default: comp };
  }) as any;

  LazyComp.preload = load;
  LazyComp.isLoaded = () => loadedComponent !== null;

  return LazyComp;
}

// -----------------------------------------------------------------------------
// Lazy & Preloadable Screen Component Registry
// -----------------------------------------------------------------------------

export const Screens = {
  Screen00Opening: lazyWithPreload(
    () => import('../components/screens/Screen00Opening'),
    'Screen00Opening'
  ),
  Screen01Entry: lazyWithPreload(
    () => import('../components/screens/Screen01Entry'),
    'Screen01Entry'
  ),
  Screen02Lobby: lazyWithPreload(
    () => import('../components/screens/Screen02Lobby'),
    'Screen02Lobby'
  ),
  Screen03CaptainRole: lazyWithPreload(
    () => import('../components/screens/Screen03CaptainRole'),
    'Screen03CaptainRole'
  ),
  Screen04EngineerRole: lazyWithPreload(
    () => import('../components/screens/Screen04EngineerRole'),
    'Screen04EngineerRole'
  ),
  Screen05ReactorCaptain: lazyWithPreload(
    () => import('../components/screens/Screen05ReactorCaptain'),
    'Screen05ReactorCaptain'
  ),
  Screen06ReactorEngineer: lazyWithPreload(
    () => import('../components/screens/Screen06ReactorEngineer'),
    'Screen06ReactorEngineer'
  ),
  Screen07SignalCaptain: lazyWithPreload(
    () => import('../components/screens/Screen07SignalCaptain'),
    'Screen07SignalCaptain'
  ),
  Screen08SignalEngineer: lazyWithPreload(
    () => import('../components/screens/Screen08SignalEngineer'),
    'Screen08SignalEngineer'
  ),
  Screen09CableCaptain: lazyWithPreload(
    () => import('../components/screens/Screen09CableCaptain'),
    'Screen09CableCaptain'
  ),
  Screen10CableEngineer: lazyWithPreload(
    () => import('../components/screens/Screen10CableEngineer'),
    'Screen10CableEngineer'
  ),
  Screen11AirlockCaptain: lazyWithPreload(
    () => import('../components/screens/Screen11AirlockCaptain'),
    'Screen11AirlockCaptain'
  ),
  Screen12AirlockEngineer: lazyWithPreload(
    () => import('../components/screens/Screen12AirlockEngineer'),
    'Screen12AirlockEngineer'
  ),
  Screen13RadarCaptain: lazyWithPreload(
    () => import('../components/screens/Screen13RadarCaptain'),
    'Screen13RadarCaptain'
  ),
  Screen14RadarEngineer: lazyWithPreload(
    () => import('../components/screens/Screen14RadarEngineer'),
    'Screen14RadarEngineer'
  ),
  Screen15EnergyCaptain: lazyWithPreload(
    () => import('../components/screens/Screen15EnergyCaptain'),
    'Screen15EnergyCaptain'
  ),
  Screen16EnergyEngineer: lazyWithPreload(
    () => import('../components/screens/Screen16EnergyEngineer'),
    'Screen16EnergyEngineer'
  ),
  Screen17ARescue: lazyWithPreload(
    () => import('../components/screens/Screen17ARescue'),
    'Screen17ARescue'
  ),
  Screen17BResult: lazyWithPreload(
    () => import('../components/screens/Screen17BResult'),
    'Screen17BResult'
  ),
  ScreenAdvancedMission: lazyWithPreload(
    () => import('../components/screens/ScreenAdvancedMission'),
    'ScreenAdvancedMission'
  ),
  ScreenKarantinaPhase1Bio: lazyWithPreload(
    () => import('../components/screens/karantina/ScreenKarantinaPhase1Bio'),
    'ScreenKarantinaPhase1Bio'
  ),
  ScreenKarantinaPhase1Sec: lazyWithPreload(
    () => import('../components/screens/karantina/ScreenKarantinaPhase1Sec'),
    'ScreenKarantinaPhase1Sec'
  ),
  ScreenKarantinaPhase2Bio: lazyWithPreload(
    () => import('../components/screens/karantina/ScreenKarantinaPhase2Bio'),
    'ScreenKarantinaPhase2Bio'
  ),
  ScreenKarantinaPhase2Sec: lazyWithPreload(
    () => import('../components/screens/karantina/ScreenKarantinaPhase2Sec'),
    'ScreenKarantinaPhase2Sec'
  ),
  ScreenKarantinaPhase3Bio: lazyWithPreload(
    () => import('../components/screens/karantina/ScreenKarantinaPhase3Bio'),
    'ScreenKarantinaPhase3Bio'
  ),
  ScreenKarantinaPhase3Sec: lazyWithPreload(
    () => import('../components/screens/karantina/ScreenKarantinaPhase3Sec'),
    'ScreenKarantinaPhase3Sec'
  ),
  ScreenKarantinaResult: lazyWithPreload(
    () => import('../components/screens/karantina/ScreenKarantinaResult'),
    'ScreenKarantinaResult'
  ),
};

export type ScreenKey = keyof typeof Screens;

/**
 * Returns statistics of preloaded screen components in memory
 */
export function getPreloadStats(): { loaded: number; total: number; percent: number } {
  const keys = Object.keys(Screens) as ScreenKey[];
  const loaded = keys.filter((k) => Screens[k].isLoaded()).length;
  const total = keys.length;
  const percent = Math.round((loaded / total) * 100);
  return { loaded, total, percent };
}

/**
 * Proactively preloads screen components needed for the current and upcoming game states.
 * Fired automatically on status/phase transitions so the next screen is already in RAM.
 */
export function preloadUpcomingScreens(state: Partial<MissionState>) {
  const status = state.status || 'opening';
  const theme = state.operationTheme || 'derin_basinc';
  const isKarantina = theme === 'karantina_2088';
  const isAdvanced = state.gameMode === 'gelismis';

  // 1. Initial State: Opening & Entry
  if (status === 'opening') {
    Screens.Screen01Entry.preload();
    Screens.Screen02Lobby.preload();
    Screens.Screen03CaptainRole.preload();
    Screens.Screen04EngineerRole.preload();
    return;
  }

  // 2. Entry Screen
  if (status === 'entry') {
    Screens.Screen02Lobby.preload();
    Screens.Screen03CaptainRole.preload();
    Screens.Screen04EngineerRole.preload();
    if (isKarantina) {
      Screens.ScreenKarantinaPhase1Bio.preload();
      Screens.ScreenKarantinaPhase1Sec.preload();
    }
    return;
  }

  // 3. Lobby Screen: Prepare Role Introductions & First Phase
  if (status === 'lobby') {
    Screens.Screen03CaptainRole.preload();
    Screens.Screen04EngineerRole.preload();
    if (isKarantina) {
      Screens.ScreenKarantinaPhase1Bio.preload();
      Screens.ScreenKarantinaPhase1Sec.preload();
      Screens.ScreenKarantinaPhase2Bio.preload();
      Screens.ScreenKarantinaPhase2Sec.preload();
    } else if (isAdvanced) {
      Screens.ScreenAdvancedMission.preload();
    } else {
      preloadMiniGameScreens(state.selectedMiniGames?.[0] || 'ariza_teshisi');
    }
    return;
  }

  // 4. Role Introduction Screen: Prepare Active Phase Puzzles
  if (status === 'role_intro') {
    if (isKarantina) {
      Screens.ScreenKarantinaPhase1Bio.preload();
      Screens.ScreenKarantinaPhase1Sec.preload();
    } else if (isAdvanced) {
      Screens.ScreenAdvancedMission.preload();
    } else {
      preloadMiniGameScreens(state.selectedMiniGames?.[0] || 'ariza_teshisi');
    }
    return;
  }

  // 5. In-Game Puzzle Phases: Preload next mini-games, energy, and rescue
  if (status === 'phase_game') {
    if (isKarantina) {
      if (state.currentPhaseIndex === 0) {
        Screens.ScreenKarantinaPhase2Bio.preload();
        Screens.ScreenKarantinaPhase2Sec.preload();
      } else if (state.currentPhaseIndex === 1) {
        Screens.ScreenKarantinaPhase3Bio.preload();
        Screens.ScreenKarantinaPhase3Sec.preload();
      } else {
        Screens.ScreenKarantinaResult.preload();
      }
    } else if (isAdvanced) {
      Screens.Screen17BResult.preload();
    } else {
      if (state.currentPhaseIndex === 0) {
        preloadMiniGameScreens(state.selectedMiniGames?.[1] || 'sinyal_cozumu');
      } else if (state.currentPhaseIndex === 1) {
        Screens.Screen15EnergyCaptain.preload();
        Screens.Screen16EnergyEngineer.preload();
      }
    }
    return;
  }

  // 6. Energy Distribution Phase: Preload Rescue and Decision screens
  if (status === 'phase_energy') {
    Screens.Screen17ARescue.preload();
    Screens.Screen17BResult.preload();
    return;
  }

  // 7. Rescue Decision Phase: Preload Final Result screens
  if (status === 'phase_rescue') {
    Screens.Screen17BResult.preload();
    if (isKarantina) {
      Screens.ScreenKarantinaResult.preload();
    }
    return;
  }

  // 8. Result / Game Over: Preload Lobby for seamless restart
  if (status === 'phase_result') {
    Screens.Screen02Lobby.preload();
    Screens.Screen01Entry.preload();
  }
}

/**
 * Preload screens specific to a mini-game type
 */
function preloadMiniGameScreens(gameType: MiniGameType) {
  switch (gameType) {
    case 'ariza_teshisi':
      Screens.Screen05ReactorCaptain.preload();
      Screens.Screen06ReactorEngineer.preload();
      break;
    case 'sinyal_cozumu':
      Screens.Screen07SignalCaptain.preload();
      Screens.Screen08SignalEngineer.preload();
      break;
    case 'kablo_baglantisi':
      Screens.Screen09CableCaptain.preload();
      Screens.Screen10CableEngineer.preload();
      break;
    case 'hava_kilidi':
      Screens.Screen11AirlockCaptain.preload();
      Screens.Screen12AirlockEngineer.preload();
      break;
    case 'radar_yonlendirme':
      Screens.Screen13RadarCaptain.preload();
      Screens.Screen14RadarEngineer.preload();
      break;
  }
}

/**
 * Progressively preloads all screens during browser idle periods.
 * This guarantees 100% of screens are compiled and cached in V8 memory without blocking UI frames.
 */
export function preloadAllScreensProgressive(delayMs: number = 800) {
  const keys = Object.keys(Screens) as ScreenKey[];
  let index = 0;

  const loadNextBatch = () => {
    if (index >= keys.length) return;
    const batch = keys.slice(index, index + 3);
    index += 3;

    Promise.all(batch.map((k) => Screens[k].preload()))
      .catch(() => {})
      .finally(() => {
        if (index < keys.length) {
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            (window as any).requestIdleCallback(loadNextBatch, { timeout: 1500 });
          } else {
            setTimeout(loadNextBatch, 300);
          }
        }
      });
  };

  setTimeout(loadNextBatch, delayMs);
}
