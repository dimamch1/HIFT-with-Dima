import { create } from 'zustand';
import {
  DivisionTier,
  EquipmentId,
  EquipmentPreset,
  Gender,
  GymnasticsSkills,
  InjuryFlag,
  OneRepMaxes,
  SkillLevel,
  UserProfile,
} from '../types';
import { DEFAULT_USER_PROFILE, StorageService } from '../services/storageService';
import { useWorkoutStore } from './useWorkoutStore';

interface UserState {
  profiles: UserProfile[];
  activeProfileId: string;
  profile: UserProfile;
  isLoading: boolean;
  
  // Actions
  loadProfile: () => Promise<void>;
  switchProfile: (profileId: string) => Promise<void>;
  createProfile: (
    name: string,
    options?: {
      division?: DivisionTier;
      gender?: Gender;
      age?: number;
      weightKg?: number;
      heightCm?: number;
    }
  ) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  update1RM: (exercise: keyof OneRepMaxes, weight: number) => Promise<void>;
  updateSkill: (skill: keyof GymnasticsSkills, level: SkillLevel) => Promise<void>;
  toggleEquipment: (equipmentId: EquipmentId) => Promise<void>;
  setEquipmentPreset: (preset: EquipmentPreset) => Promise<void>;
  toggleInjury: (injury: InjuryFlag) => Promise<void>;
}

const PRESET_EQUIPMENT: Record<EquipmentPreset, EquipmentId[]> = {
  full_box: [
    'barbell_and_plates',
    'pull_up_bar',
    'gymnastics_rings',
    'dumbbells',
    'kettlebells',
    'concept2_rower',
    'concept2_skierg',
    'concept2_bike_erg',
    'assault_echo_bike',
    'wall_ball',
    'plyo_box',
    'jump_rope',
    'ghd',
    'climbing_rope',
    'bench',
    'squat_rack',
  ],
  garage_gym: [
    'barbell_and_plates',
    'pull_up_bar',
    'dumbbells',
    'kettlebells',
    'jump_rope',
    'squat_rack',
    'bench',
    'wall_ball',
  ],
  travel_minimal: [
    'dumbbells',
    'kettlebells',
    'jump_rope',
  ],
  custom: [],
};

export const useUserStore = create<UserState>((set, get) => ({
  profiles: [DEFAULT_USER_PROFILE],
  activeProfileId: DEFAULT_USER_PROFILE.id,
  profile: DEFAULT_USER_PROFILE,
  isLoading: true,

  loadProfile: async () => {
    set({ isLoading: true });
    const profiles = await StorageService.getAllProfiles();
    const active = await StorageService.getUserProfile();
    set({
      profiles,
      activeProfileId: active.id,
      profile: active,
      isLoading: false,
    });
  },

  switchProfile: async (profileId: string) => {
    const { profiles } = get();
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;

    await StorageService.setActiveProfileId(profileId);
    set({
      activeProfileId: profileId,
      profile: target,
    });

    // Automatically regenerate WOD tailored to new athlete's parameters
    useWorkoutStore.getState().generateDailyWOD(target, true);
  },

  createProfile: async (name, options) => {
    const { newProfile, profiles } = await StorageService.createProfile(name, options);
    set({
      profiles,
      activeProfileId: newProfile.id,
      profile: newProfile,
    });
    useWorkoutStore.getState().generateDailyWOD(newProfile, true);
  },

  deleteProfile: async (profileId: string) => {
    const { activeProfile, profiles } = await StorageService.deleteProfile(profileId);
    set({
      profiles,
      activeProfileId: activeProfile.id,
      profile: activeProfile,
    });
    useWorkoutStore.getState().generateDailyWOD(activeProfile, true);
  },

  updateProfile: async (updates) => {
    const current = get().profile;
    const updated: UserProfile = { ...current, ...updates };
    const updatedProfiles = await StorageService.saveUserProfile(updated);
    set({ profile: updated, profiles: updatedProfiles });
    useWorkoutStore.getState().generateDailyWOD(updated, true);
  },

  update1RM: async (exercise, weight) => {
    const current = get().profile;
    const updated: UserProfile = {
      ...current,
      oneRepMaxes: {
        ...current.oneRepMaxes,
        [exercise]: weight,
      },
    };
    const updatedProfiles = await StorageService.saveUserProfile(updated);
    set({ profile: updated, profiles: updatedProfiles });
    useWorkoutStore.getState().generateDailyWOD(updated, true);
  },

  updateSkill: async (skill, level) => {
    const current = get().profile;
    const updated: UserProfile = {
      ...current,
      skills: {
        ...current.skills,
        [skill]: level,
      },
    };
    const updatedProfiles = await StorageService.saveUserProfile(updated);
    set({ profile: updated, profiles: updatedProfiles });
    useWorkoutStore.getState().generateDailyWOD(updated, true);
  },

  toggleEquipment: async (equipmentId) => {
    const current = get().profile;
    const exists = current.availableEquipment.includes(equipmentId);
    const updatedList = exists
      ? current.availableEquipment.filter((id) => id !== equipmentId)
      : [...current.availableEquipment, equipmentId];

    const updated: UserProfile = {
      ...current,
      availableEquipment: updatedList,
      equipmentPreset: 'custom',
    };
    const updatedProfiles = await StorageService.saveUserProfile(updated);
    set({ profile: updated, profiles: updatedProfiles });
    useWorkoutStore.getState().generateDailyWOD(updated, true);
  },

  setEquipmentPreset: async (preset) => {
    const current = get().profile;
    const equipmentList = preset === 'custom' ? current.availableEquipment : PRESET_EQUIPMENT[preset];
    const updated: UserProfile = {
      ...current,
      equipmentPreset: preset,
      availableEquipment: equipmentList,
    };
    const updatedProfiles = await StorageService.saveUserProfile(updated);
    set({ profile: updated, profiles: updatedProfiles });
    useWorkoutStore.getState().generateDailyWOD(updated, true);
  },

  toggleInjury: async (injury) => {
    const current = get().profile;
    const exists = current.injuries.includes(injury);
    const updatedList = exists
      ? current.injuries.filter((i) => i !== injury)
      : [...current.injuries, injury];

    const updated: UserProfile = {
      ...current,
      injuries: updatedList,
    };
    const updatedProfiles = await StorageService.saveUserProfile(updated);
    set({ profile: updated, profiles: updatedProfiles });
    useWorkoutStore.getState().generateDailyWOD(updated, true);
  },
}));
