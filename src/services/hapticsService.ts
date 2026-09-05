import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export class HapticsService {
  /**
   * Subtle tick for 3-2-1 countdown
   */
  public static async countdownTick(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
  }

  /**
   * Sharp confirmation pulse on workout START / GO
   */
  public static async workoutGo(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
  }

  /**
   * Medium impact when interval transitions (Work <-> Rest)
   */
  public static async intervalSwitch(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}
  }

  /**
   * Heavy tactile thump when athlete logs a round or rep
   */
  public static async roundIncrement(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (_) {}
  }

  /**
   * Double alert vibration when Time Cap is reached or workout is finished
   */
  public static async workoutComplete(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (_) {}
  }
}
