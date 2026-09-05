import { create } from 'zustand';
import { DailyWorkoutSession, UserProfile, WorkoutLogEntry } from '../types';
import { FatigueAnalysisResult, FatigueEngine } from '../engine/fatigueEngine';
import { WODGenerator } from '../engine/wodGenerator';
import { MOVEMENT_DATABASE } from '../engine/movementDatabase';
import { ScalingEngine } from '../engine/scalingEngine';
import { StorageService } from '../services/storageService';
import { useUserStore } from './useUserStore';

interface WorkoutState {
  todaySession: DailyWorkoutSession | null;
  recentLogs: WorkoutLogEntry[];
  fatigueAnalysis: FatigueAnalysisResult | null;
  isTimeCrunched: boolean;
  isLoading: boolean;
  initialize: (user: UserProfile) => Promise<void>;
  generateDailyWOD: (user: UserProfile, forceNew?: boolean) => void;
  toggleTimeCrunch: (user: UserProfile) => void;
  substituteMovement: (originalMovementId: string, substituteMovementId: string, user: UserProfile) => void;
  logWorkout: (logData: Omit<WorkoutLogEntry, 'id' | 'date'>, user: UserProfile) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  todaySession: null,
  recentLogs: [],
  fatigueAnalysis: null,
  isTimeCrunched: false,
  isLoading: true,

  initialize: async (user: UserProfile) => {
    set({ isLoading: true });
    const logs = await StorageService.getWorkoutLogs();
    const fatigue = FatigueEngine.calculateFatigue(logs);
    const session = WODGenerator.generateSession(user, fatigue, get().isTimeCrunched);

    set({
      recentLogs: logs,
      fatigueAnalysis: fatigue,
      todaySession: { ...session },
      isLoading: false,
    });
  },

  generateDailyWOD: (user?: UserProfile, forceNew: boolean = false) => {
    const activeUser = user || useUserStore.getState().profile;
    const { recentLogs, isTimeCrunched } = get();
    const fatigue = FatigueEngine.calculateFatigue(recentLogs);
    const session = WODGenerator.generateSession(activeUser, fatigue, isTimeCrunched);

    set({
      fatigueAnalysis: fatigue,
      todaySession: { ...session },
    });
  },

  toggleTimeCrunch: (user?: UserProfile) => {
    const nextCrunch = !get().isTimeCrunched;
    set({ isTimeCrunched: nextCrunch });
    const activeUser = user || useUserStore.getState().profile;
    get().generateDailyWOD(activeUser, true);
  },

  substituteMovement: (originalMovementId, substituteMovementId, user) => {
    const currentSession = get().todaySession;
    if (!currentSession) return;

    const substituteDef = MOVEMENT_DATABASE.find((m) => m.id === substituteMovementId);
    if (!substituteDef) return;

    const isMale = user.gender === 'male';
    const scaled = ScalingEngine.scaleMovement(substituteDef, user, isMale);

    // Update inside Part B MetCon
    const updatedMovements = currentSession.partBMetCon.movements.map((m) => {
      if (m.movementId === originalMovementId) {
        return {
          ...scaled,
          reps: m.reps,
          calories: m.calories,
          distanceMeters: m.distanceMeters,
        };
      }
      return m;
    });

    set({
      todaySession: {
        ...currentSession,
        partBMetCon: {
          ...currentSession.partBMetCon,
          movements: updatedMovements,
        },
      },
    });
  },

  logWorkout: async (logData, user) => {
    const newLog: WorkoutLogEntry = {
      ...logData,
      id: `log_${Date.now()}`,
      date: new Date().toISOString(),
    };

    await StorageService.saveWorkoutLog(newLog);

    const updatedLogs = [newLog, ...get().recentLogs];
    const newFatigue = FatigueEngine.calculateFatigue(updatedLogs);

    set({
      recentLogs: updatedLogs,
      fatigueAnalysis: newFatigue,
    });
  },
}));
