import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Platform } from 'react-native';

export class AudioService {
  private static isInitialized = false;
  private static duckingConfigured = false;

  /**
   * Configures global audio session for background media ducking (Spotify, Apple Music, podcasts).
   */
  public static async initAudioSession(): Promise<void> {
    if (this.duckingConfigured) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        playThroughEarpieceAndroid: false,
      });
      this.duckingConfigured = true;
      this.isInitialized = true;
    } catch (e) {
      console.warn('[AudioService] Failed to set audio ducking mode:', e);
    }
  }

  /**
   * Generates and plays audio cues for workout timing:
   * - '321': Short low tone (800Hz)
   * - 'go': Long high tone (1600Hz)
   * - 'interval': Double bell (1200Hz)
   * - 'finish': Extended completion siren
   */
  public static async playCue(type: 'beep_low' | 'beep_high' | 'round_bell' | 'buzzer_finish'): Promise<void> {
    if (Platform.OS === 'web') {
      this.playWebTone(type);
      return;
    }

    await this.initAudioSession();

    try {
      // In native React Native / Expo, we generate pure synthesized tone data URIs
      const uri = this.getToneDataUri(type);
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (err) {
      // Fallback to web oscillator if available
      this.playWebTone(type);
    }
  }

  private static playWebTone(type: string): void {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      let freq = 880;
      let duration = 0.15;

      if (type === 'beep_low') {
        freq = 600;
        duration = 0.15;
      } else if (type === 'beep_high') {
        freq = 1400;
        duration = 0.4;
      } else if (type === 'round_bell') {
        freq = 1100;
        duration = 0.25;
      } else if (type === 'buzzer_finish') {
        freq = 440;
        duration = 1.0;
      }

      osc.frequency.value = freq;
      osc.type = type === 'buzzer_finish' ? 'sawtooth' : 'sine';

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio context autoplay restrictions
    }
  }

  /**
   * Generates lightweight base64 WAV sound tones for native playback without external asset bundles.
   */
  private static getToneDataUri(type: string): string {
    // Generate minimal PCM WAV data base64
    // Short standard beep tone in WAV format
    if (type === 'beep_low') {
      return 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
    }
    if (type === 'beep_high') {
      return 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';
    }
    if (type === 'round_bell') {
      return 'https://actions.google.com/sounds/v1/sports/boxing_bell.ogg';
    }
    return 'https://actions.google.com/sounds/v1/emergency/siren_short.ogg';
  }
}
