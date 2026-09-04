import AsyncStorage from '@react-native-async-storage/async-storage';
import { BenchmarkPRRecord, DivisionTier, Gender, UserProfile, WorkoutLogEntry } from '../types';

const STORAGE_KEYS = {
  USER_PROFILES_LIST: '@hift_user_profiles_list',
  ACTIVE_USER_ID: '@hift_active_user_id',
  USER_PROFILE: '@hift_user_profile', // Legacy fallback
  WORKOUT_LOGS: '@hift_workout_logs',
  BENCHMARK_PRS: '@hift_benchmark_prs',
  SAVED_TIMER_PRESETS: '@hift_timer_presets',
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'athlete_dima',
  name: 'Dima Michaelov',
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
  /**
   * Get all registered athlete profiles
   */
  public static async getAllProfiles(): Promise<UserProfile[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILES_LIST);
      if (data) {
        const parsed: UserProfile[] = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Check legacy single profile key
      const legacyData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      const initialProfile = legacyData ? JSON.parse(legacyData) : DEFAULT_USER_PROFILE;
      const initialList = [initialProfile];
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILES_LIST, JSON.stringify(initialList));
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, initialProfile.id);
      return initialList;
    } catch (e) {
      console.warn('[StorageService] Error loading all profiles:', e);
      return [DEFAULT_USER_PROFILE];
    }
  }

  /**
   * Get currently active athlete profile
   */
  public static async getUserProfile(): Promise<UserProfile> {
    try {
      const profiles = await this.getAllProfiles();
      const activeId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
      const active = profiles.find((p) => p.id === activeId) || profiles[0] || DEFAULT_USER_PROFILE;
      return active;
    } catch (e) {
      console.warn('[StorageService] Error loading active profile:', e);
      return DEFAULT_USER_PROFILE;
    }
  }

  /**
   * Set active athlete ID
   */
  public static async setActiveProfileId(profileId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, profileId);
    } catch (e) {
      console.error('[StorageService] Error setting active profile ID:', e);
    }
  }

  /**
   * Save / Update a specific user profile
   */
  public static async saveUserProfile(profile: UserProfile): Promise<UserProfile[]> {
    try {
      profile.updatedAt = new Date().toISOString();
      const profiles = await this.getAllProfiles();
      const index = profiles.findIndex((p) => p.id === profile.id);

      let updatedList: UserProfile[];
      if (index >= 0) {
        updatedList = [...profiles];
        updatedList[index] = profile;
      } else {
        updatedList = [...profiles, profile];
      }

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILES_LIST, JSON.stringify(updatedList));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      return updatedList;
    } catch (e) {
      console.error('[StorageService] Error saving profile:', e);
      return [profile];
    }
  }

  /**
   * Create a new athlete profile
   */
  public static async createProfile(
    name: string,
    options?: {
      division?: DivisionTier;
      gender?: Gender;
      age?: number;
      weightKg?: number;
      heightCm?: number;
    }
  ): Promise<{ newProfile: UserProfile; profiles: UserProfile[] }> {
    const id = `athlete_${Date.now()}`;
    const newProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id,
      name: name.trim() || `Athlete ${Date.now().toString().slice(-4)}`,
      division: options?.division || 'INTERMEDIATE',
      gender: options?.gender || 'male',
      age: options?.age || 26,
      weightKg: options?.weightKg || 78,
      heightCm: options?.heightCm || 178,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = await this.saveUserProfile(newProfile);
    await this.setActiveProfileId(id);
    return { newProfile, profiles: updatedList };
  }

  /**
   * Delete an athlete profile
   */
  public static async deleteProfile(profileId: string): Promise<{ activeProfile: UserProfile; profiles: UserProfile[] }> {
    const profiles = await this.getAllProfiles();
    if (profiles.length <= 1) {
      // Cannot delete the only remaining profile
      return { activeProfile: profiles[0], profiles };
    }

    const updatedList = profiles.filter((p) => p.id !== profileId);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILES_LIST, JSON.stringify(updatedList));

    const activeId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    let newActive = updatedList[0];
    if (activeId !== profileId) {
      const found = updatedList.find((p) => p.id === activeId);
      if (found) newActive = found;
    }

    await this.setActiveProfileId(newActive.id);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newActive));
    return { activeProfile: newActive, profiles: updatedList };
  }

  public static async getWorkoutLogs(): Promise<WorkoutLogEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
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
    } catch {
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
