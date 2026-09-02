import AsyncStorage from '@react-native-async-storage/async-storage';
import { BenchmarkPRRecord, UserProfile, WorkoutLogEntry } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: '@hift_user_profile',
  WORKOUT_LOGS: '@hift_workout_logs',
  BENCHMARK_PRS: '@hift_benchmark_prs',
  SAVED_TIMER_PRESETS: '@hift_timer_presets',
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'athlete_default',
  name: 'Athlete One',
  age: 28,
  gender: 'male',
  heightCm: 180,
  weightKg: 82,
  unitPreference: 'metric',
  division: 'RX',
  skills: {
    pullUps: 'proficient',
    chestToBar: 'proficient',
    barMuscleUps: 'developing',
    ringMuscleUps: 'developing',
    handstandPushUpsStrict: 'developing',
    handstandPushUpsKipping: 'proficient',
    handstandWalk: 'developing',
    toesToBar: 'proficient',
    doubleUnders: 'proficient',
    ropeClimbs: 'proficient',
    pistolSquats: 'developing',
  },
  oneRepMaxes: {
    snatch: 85,
    cleanAndJerk: 110,
    powerClean: 105,
    powerSnatch: 80,
    overheadSquat: 95,
    backSquat: 145,
    frontSquat: 125,
    deadlift: 185,
    strictPress: 65,
    pushPress: 85,
    thruster: 80,
    benchPress: 100,
  },
  availableEquipment: [
    'barbell_and_plates',
    'pull_up_bar',
    'gymnastics_rings',
    'dumbbells',
    'kettlebells',
    'concept2_rower',
    'wall_ball',
    'plyo_box',
    'jump_rope',
    'squat_rack',
  ],
  equipmentPreset: 'full_box',
  injuries: [],
  targetWeeklySessions: 5,
  preferredSessionDurationMinutes: 60,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export class StorageService {
  public static async getUserProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!data) {
        await this.saveUserProfile(DEFAULT_USER_PROFILE);
        return DEFAULT_USER_PROFILE;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('[StorageService] Error loading user profile:', e);
      return DEFAULT_USER_PROFILE;
    }
  }

  public static async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      profile.updatedAt = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('[StorageService] Error saving user profile:', e);
    }
  }

  public static async getWorkoutLogs(): Promise<WorkoutLogEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  public static async saveWorkoutLog(log: WorkoutLogEntry): Promise<void> {
    try {
      const existing = await this.getWorkoutLogs();
      const updated = [log, ...existing];
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(updated));
    } catch (e) {
      console.error('[StorageService] Error saving workout log:', e);
    }
  }

  public static async getBenchmarkPRs(): Promise<BenchmarkPRRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BENCHMARK_PRS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  public static async saveBenchmarkPR(pr: BenchmarkPRRecord): Promise<void> {
    try {
      const existing = await this.getBenchmarkPRs();
      const updated = [pr, ...existing];
      await AsyncStorage.setItem(STORAGE_KEYS.BENCHMARK_PRS, JSON.stringify(updated));
    } catch (e) {
      console.error('[StorageService] Error saving benchmark PR:', e);
    }
  }
}
