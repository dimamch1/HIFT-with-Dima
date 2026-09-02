import { create } from 'zustand';
import { EquipmentId, EquipmentPreset, GymnasticsSkills, InjuryFlag, OneRepMaxes, UserProfile } from '../types';
import { DEFAULT_USER_PROFILE, StorageService } from '../services/storageService';
import { useWorkoutStore } from './useWorkoutStore';

interface UserState {
  profile: UserProfile;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  update1RM: (exercise: keyof OneRepMaxes, weight: number) => Promise<void>;
  updateSkill: (skill: keyof GymnasticsSkills, level: GymnasticsSkills[keyof GymnasticsSkills]) => Promise<void>;
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
  profile: DEFAULT_USER_PROFILE,
  isLoading: true,

  loadProfile: async () => {
    set({ isLoading: true });
    const profile = await StorageService.getUserProfile();
    set({ profile, isLoading: false });
  },

  updateProfile: async (updates) => {
    const current = get().profile;
    const updated: UserProfile = { ...current, ...updates };
    set({ profile: updated });
    await StorageService.saveUserProfile(updated);
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
    set({ profile: updated });
    await StorageService.saveUserProfile(updated);
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
    set({ profile: updated });
    await StorageService.saveUserProfile(updated);
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
    set({ profile: updated });
    await StorageService.saveUserProfile(updated);
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
    set({ profile: updated });
    await StorageService.saveUserProfile(updated);
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
    set({ profile: updated });
    await StorageService.saveUserProfile(updated);
    useWorkoutStore.getState().generateDailyWOD(updated, true);
  },
}));
