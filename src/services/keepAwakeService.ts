import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Platform } from 'react-native';

export class KeepAwakeService {
  private static tag = 'CROSSFIT_ACTIVE_TIMER';

  public static async enable(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await activateKeepAwakeAsync(this.tag);
    } catch (_) {}
  }

  public static async disable(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await deactivateKeepAwake(this.tag);
    } catch (_) {}
  }
}
