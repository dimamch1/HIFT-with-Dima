import { create } from 'zustand';
import { ActiveTimerState, ActiveWodDetails, IntervalPhase, SplitRecord, TimerConfig, TimerMode, TimerStatus } from '../types';
import { AudioService } from '../services/audioService';
import { HapticsService } from '../services/hapticsService';
import { KeepAwakeService } from '../services/keepAwakeService';

interface TimerStore {
  state: ActiveTimerState;
  countdownValue: number; // 3, 2, 1, 0 during PRE_COUNTDOWN
  setMode: (mode: TimerMode) => void;
  updateConfig: (updates: Partial<TimerConfig>) => void;
  setActiveWodDetails: (details: ActiveWodDetails | null) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  incrementAmrapRound: () => void;
  incrementAmrapRep: () => void;
  recordSplit: () => void;
  finishWorkout: () => void;
  tick: () => void;
}

const DEFAULT_CONFIGS: Record<TimerMode, TimerConfig> = {
  FOR_TIME: {
    mode: 'FOR_TIME',
    timeCapSeconds: 900, // 15:00
    countdownSeconds: 10,
    intervalWorkSeconds: 60,
    intervalRestSeconds: 0,
    totalRounds: 1,
    soundEnabled: true,
    hapticsEnabled: true,
    audioDuckingEnabled: true,
  },
  AMRAP: {
    mode: 'AMRAP',
    timeCapSeconds: 720, // 12:00
    countdownSeconds: 10,
    intervalWorkSeconds: 60,
    intervalRestSeconds: 0,
    totalRounds: 1,
    soundEnabled: true,
    hapticsEnabled: true,
    audioDuckingEnabled: true,
  },
  EMOM: {
    mode: 'EMOM',
    timeCapSeconds: 600, // 10:00
    countdownSeconds: 10,
    intervalWorkSeconds: 60,
    intervalRestSeconds: 0,
    totalRounds: 10,
    soundEnabled: true,
    hapticsEnabled: true,
    audioDuckingEnabled: true,
  },
  TABATA: {
    mode: 'TABATA',
    timeCapSeconds: 240, // 4:00 (8 x 30s)
    countdownSeconds: 10,
    intervalWorkSeconds: 20,
    intervalRestSeconds: 10,
    totalRounds: 8,
    soundEnabled: true,
    hapticsEnabled: true,
    audioDuckingEnabled: true,
  },
  CUSTOM_INTERVAL: {
    mode: 'CUSTOM_INTERVAL',
    timeCapSeconds: 360,
    countdownSeconds: 10,
    intervalWorkSeconds: 45,
    intervalRestSeconds: 15,
    totalRounds: 6,
    soundEnabled: true,
    hapticsEnabled: true,
    audioDuckingEnabled: true,
  },
};

const initialTimerState: ActiveTimerState = {
  status: 'IDLE',
  config: DEFAULT_CONFIGS.FOR_TIME,
  startTime: null,
  pausedTime: null,
  totalPausedDuration: 0,
  elapsedSeconds: 0,
  remainingSeconds: 900,
  currentRound: 1,
  totalRounds: 1,
  intervalPhase: 'WORK',
  intervalElapsedSeconds: 0,
  intervalRemainingSeconds: 60,
  amrapRounds: 0,
  amrapReps: 0,
  splits: [],
  activeWodDetails: null,
};

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let lastTickSecond = -1;

export const useTimerStore = create<TimerStore>((set, get) => ({
  state: initialTimerState,
  countdownValue: 3,

  setMode: (mode: TimerMode) => {
    const config = DEFAULT_CONFIGS[mode];
    set((s) => ({
      state: {
        ...initialTimerState,
        activeWodDetails: s.state.activeWodDetails,
        config,
        remainingSeconds: config.timeCapSeconds,
        intervalRemainingSeconds: config.intervalWorkSeconds,
        totalRounds: config.totalRounds,
      },
    }));
  },

  setActiveWodDetails: (details) => {
    set((s) => ({
      state: {
        ...s.state,
        activeWodDetails: details,
      },
    }));
  },

  updateConfig: (updates) => {
    const current = get().state;
    const newConfig = { ...current.config, ...updates };

    // Calculate total time for intervals
    if (newConfig.mode === 'CUSTOM_INTERVAL' || newConfig.mode === 'TABATA' || newConfig.mode === 'EMOM') {
      const cycle = newConfig.intervalWorkSeconds + newConfig.intervalRestSeconds;
      newConfig.timeCapSeconds = cycle * newConfig.totalRounds;
    }

    set({
      state: {
        ...current,
        config: newConfig,
        totalRounds: newConfig.totalRounds,
        remainingSeconds: newConfig.timeCapSeconds,
        intervalRemainingSeconds: newConfig.intervalWorkSeconds,
      },
    });
  },

  startTimer: () => {
    if (intervalHandle) clearInterval(intervalHandle);

    KeepAwakeService.enable();

    // 1. Begin 3-second visual & auditory pre-countdown
    set((s) => ({
      countdownValue: 3,
      state: { ...s.state, status: 'PRE_COUNTDOWN' },
    }));

    if (get().state.config.soundEnabled) {
      AudioService.playCue('beep_low');
    }
    if (get().state.config.hapticsEnabled) {
      HapticsService.countdownTick();
    }

    let count = 3;
    const countdownTimer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        set({ countdownValue: count });
        if (get().state.config.soundEnabled) {
          AudioService.playCue('beep_low');
        }
        if (get().state.config.hapticsEnabled) {
          HapticsService.countdownTick();
        }
      } else {
        clearInterval(countdownTimer);
        // Start actual monotonic clock
        const now = Date.now();
        lastTickSecond = 0;

        set((s) => ({
          countdownValue: 0,
          state: {
            ...s.state,
            status: 'RUNNING',
            startTime: now,
            pausedTime: null,
            totalPausedDuration: 0,
            elapsedSeconds: 0,
            currentRound: 1,
            intervalPhase: 'WORK',
          },
        }));

        if (get().state.config.soundEnabled) {
          AudioService.playCue('beep_high');
        }
        if (get().state.config.hapticsEnabled) {
          HapticsService.workoutGo();
        }

        // Start high-frequency tick loop (50ms) to ensure instant UI reactivity and zero clock drift
        intervalHandle = setInterval(() => {
          get().tick();
        }, 50);
      }
    }, 1000);
  },

  pauseTimer: () => {
    if (intervalHandle) clearInterval(intervalHandle);
    const now = Date.now();
    set((s) => ({
      state: {
        ...s.state,
        status: 'PAUSED',
        pausedTime: now,
      },
    }));
  },

  resumeTimer: () => {
    const current = get().state;
    if (current.status !== 'PAUSED' || !current.pausedTime) return;

    const pauseDelta = Date.now() - current.pausedTime;
    const newTotalPaused = current.totalPausedDuration + pauseDelta;

    set({
      state: {
        ...current,
        status: 'RUNNING',
        pausedTime: null,
        totalPausedDuration: newTotalPaused,
      },
    });

    intervalHandle = setInterval(() => {
      get().tick();
    }, 50);
  },

  resetTimer: () => {
    if (intervalHandle) clearInterval(intervalHandle);
    KeepAwakeService.disable();
    const current = get().state;
    const config = current.config;
    set({
      state: {
        ...initialTimerState,
        activeWodDetails: current.activeWodDetails,
        config,
        totalRounds: config.totalRounds,
        remainingSeconds: config.timeCapSeconds,
        intervalRemainingSeconds: config.intervalWorkSeconds,
      },
    });
  },

  incrementAmrapRound: () => {
    HapticsService.roundIncrement();
    set((s) => ({
      state: {
        ...s.state,
        amrapRounds: s.state.amrapRounds + 1,
      },
    }));
  },

  incrementAmrapRep: () => {
    HapticsService.roundIncrement();
    set((s) => ({
      state: {
        ...s.state,
        amrapReps: s.state.amrapReps + 1,
      },
    }));
  },

  recordSplit: () => {
    const current = get().state;
    const currentElapsed = current.elapsedSeconds;
    const prevSplitTime = current.splits.length > 0
      ? current.splits[current.splits.length - 1].timestampSeconds
      : 0;

    const newSplit: SplitRecord = {
      roundNumber: current.splits.length + 1,
      timestampSeconds: currentElapsed,
      splitDurationSeconds: currentElapsed - prevSplitTime,
    };

    HapticsService.roundIncrement();
    set({
      state: {
        ...current,
        splits: [...current.splits, newSplit],
      },
    });
  },

  finishWorkout: () => {
    if (intervalHandle) clearInterval(intervalHandle);
    KeepAwakeService.disable();

    if (get().state.config.soundEnabled) {
      AudioService.playCue('buzzer_finish');
    }
    if (get().state.config.hapticsEnabled) {
      HapticsService.workoutComplete();
    }

    set((s) => ({
      state: {
        ...s.state,
        status: 'COMPLETED',
      },
    }));
  },

  /**
   * Monotonic precision clock tick handler.
   */
  tick: () => {
    const current = get().state;
    if (current.status !== 'RUNNING' || !current.startTime) return;

    const now = Date.now();
    const activeElapsedMs = now - current.startTime - current.totalPausedDuration;
    const totalElapsedSec = Math.floor(activeElapsedMs / 1000);

    // If second hasn't changed, skip heavy recalculation
    if (totalElapsedSec === lastTickSecond) return;
    lastTickSecond = totalElapsedSec;

    const config = current.config;
    const mode = config.mode;

    // 1. Check Overall Time Cap for For Time / AMRAP
    if (mode === 'FOR_TIME' || mode === 'AMRAP') {
      const remainingSec = Math.max(0, config.timeCapSeconds - totalElapsedSec);

      if (remainingSec <= 0) {
        get().finishWorkout();
        return;
      }

      // 3-2-1 warnings near Time Cap
      if (remainingSec <= 3 && remainingSec > 0) {
        if (config.soundEnabled) AudioService.playCue('beep_low');
        if (config.hapticsEnabled) HapticsService.countdownTick();
      }

      set({
        state: {
          ...current,
          elapsedSeconds: totalElapsedSec,
          remainingSeconds: remainingSec,
        },
      });
      return;
    }

    // 2. Interval Modes: EMOM & TABATA & CUSTOM_INTERVAL
    const workSec = config.intervalWorkSeconds;
    const restSec = config.intervalRestSeconds;
    const cycleTotalSec = workSec + restSec;

    const completedCycles = Math.floor(totalElapsedSec / cycleTotalSec);
    const currentRound = Math.min(config.totalRounds, completedCycles + 1);
    const cycleOffset = totalElapsedSec % cycleTotalSec;

    let intervalPhase: IntervalPhase = 'WORK';
    let intervalRemaining = 0;

    if (cycleOffset < workSec) {
      intervalPhase = 'WORK';
      intervalRemaining = workSec - cycleOffset;
    } else {
      intervalPhase = 'REST';
      intervalRemaining = cycleTotalSec - cycleOffset;
    }

    // Check completion
    if (totalElapsedSec >= config.totalRounds * cycleTotalSec) {
      get().finishWorkout();
      return;
    }

    // Audio & Haptic Cues on 3-2-1 before interval turn
    if (intervalRemaining <= 3 && intervalRemaining > 0) {
      if (config.soundEnabled) AudioService.playCue('beep_low');
      if (config.hapticsEnabled) HapticsService.countdownTick();
    } else if (intervalRemaining === workSec || (restSec > 0 && intervalRemaining === restSec)) {
      // Top of interval start
      if (config.soundEnabled) AudioService.playCue('round_bell');
      if (config.hapticsEnabled) HapticsService.intervalSwitch();
    }

    set({
      state: {
        ...current,
        elapsedSeconds: totalElapsedSec,
        remainingSeconds: Math.max(0, config.totalRounds * cycleTotalSec - totalElapsedSec),
        currentRound,
        intervalPhase,
        intervalElapsedSeconds: cycleOffset,
        intervalRemainingSeconds: intervalRemaining,
      },
    });
  },
}));
