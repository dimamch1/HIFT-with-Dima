import { MovementPlane, WorkoutLogEntry, AxialLoadingLevel, PlaneFatigueRecord } from '../types/index';

export interface FatigueAnalysisResult {
  planeStrains: Record<MovementPlane, number>; // 0 to 10
  fatiguedPlanes: MovementPlane[];            // Above threshold (> 6.0)
  freshPlanes: MovementPlane[];               // Underutilized (< 3.0)
  axialFatigueScore: number;                  // 0 to 10
  axialLoadRestricted: boolean;               // True if axial fatigue > 6.5
  analysisSummary: string;
  recommendedModalityBias: 'M' | 'G' | 'W' | 'BALANCED';
}

const ALL_PLANES: MovementPlane[] = [
  'KNEE_FLEXION',
  'HIP_HINGE',
  'VERTICAL_PUSH',
  'VERTICAL_PULL',
  'HORIZONTAL_PUSH',
  'HORIZONTAL_PULL',
  'OVERHEAD_STABILITY',
  'CORE_ANTERIOR',
  'CORE_POSTERIOR',
  'MONOSTRUCTURAL',
];

export class FatigueEngine {
  private static readonly FATIGUE_THRESHOLD = 4.5;
  private static readonly AXIAL_THRESHOLD = 5.5;

  /**
   * Evaluates cumulative fatigue from logs in the past 72 hours with exponential time decay.
   */
  public static calculateFatigue(
    recentLogs: WorkoutLogEntry[],
    currentDate: Date = new Date()
  ): FatigueAnalysisResult {
    const planeStrains: Record<MovementPlane, number> = {
      KNEE_FLEXION: 0,
      HIP_HINGE: 0,
      VERTICAL_PUSH: 0,
      VERTICAL_PULL: 0,
      HORIZONTAL_PUSH: 0,
      HORIZONTAL_PULL: 0,
      OVERHEAD_STABILITY: 0,
      CORE_ANTERIOR: 0,
      CORE_POSTERIOR: 0,
      MONOSTRUCTURAL: 0,
    };

    let axialRawScore = 0;
    const nowMs = currentDate.getTime();

    recentLogs.forEach((log) => {
      const logDate = new Date(log.date);
      const diffHours = (nowMs - logDate.getTime()) / (1000 * 60 * 60);

      // Only count workouts in the last 72 hours
      if (diffHours < 0 || diffHours > 72) return;

      // Time decay factor: 0-24h = 1.0, 24-48h = 0.65, 48-72h = 0.35
      let decay = 1.0;
      if (diffHours > 48) {
        decay = 0.35;
      } else if (diffHours > 24) {
        decay = 0.65;
      }

      // RPE multiplier: scale between 0.5 (low RPE) to 1.5 (RPE 10)
      const intensityWeight = (log.rpe || 7) / 7;

      // Accumulate plane strains
      const planes = log.recordedPlanes || [];
      const planePoints = 4.5 * decay * intensityWeight;

      planes.forEach((plane) => {
        if (planeStrains[plane] !== undefined) {
          planeStrains[plane] = Math.min(10, planeStrains[plane] + planePoints);
        }
      });

      // Accumulate axial load strain
      let axialBase = 0;
      if (log.axialLoad === 'HEAVY') axialBase = 5.0;
      else if (log.axialLoad === 'MODERATE') axialBase = 3.0;
      else if (log.axialLoad === 'LOW') axialBase = 1.5;

      axialRawScore = Math.min(10, axialRawScore + axialBase * decay * intensityWeight);
    });

    // Identify fatigued and fresh planes
    const fatiguedPlanes: MovementPlane[] = [];
    const freshPlanes: MovementPlane[] = [];

    ALL_PLANES.forEach((plane) => {
      if (planeStrains[plane] >= this.FATIGUE_THRESHOLD) {
        fatiguedPlanes.push(plane);
      } else if (planeStrains[plane] <= 2.5) {
        freshPlanes.push(plane);
      }
    });

    const axialLoadRestricted = axialRawScore >= this.AXIAL_THRESHOLD;

    // Generate human/coach readable fatigue summary
    const summary = this.generateCoachingSummary(fatiguedPlanes, freshPlanes, axialLoadRestricted);

    // Determine bias
    let bias: 'M' | 'G' | 'W' | 'BALANCED' = 'BALANCED';
    if (fatiguedPlanes.includes('KNEE_FLEXION') && fatiguedPlanes.includes('HIP_HINGE')) {
      bias = 'M'; // Bias toward monostructural/engine when legs are fried
    } else if (fatiguedPlanes.includes('VERTICAL_PUSH') && fatiguedPlanes.includes('OVERHEAD_STABILITY')) {
      bias = 'G'; // Bias toward gymnastics pulling / core
    }

    return {
      planeStrains,
      fatiguedPlanes,
      freshPlanes,
      axialFatigueScore: Math.round(axialRawScore * 10) / 10,
      axialLoadRestricted,
      analysisSummary: summary,
      recommendedModalityBias: bias,
    };
  }

  private static generateCoachingSummary(
    fatigued: MovementPlane[],
    fresh: MovementPlane[],
    axialRestricted: boolean
  ): string {
    if (fatigued.length === 0 && !axialRestricted) {
      return '🟢 Full recovery status. System primed for high CNS neural drive or heavy axial loading.';
    }

    const planeNamesHebrewMap: Record<MovementPlane, string> = {
      KNEE_FLEXION: 'Knee Flexion (Squats)',
      HIP_HINGE: 'Hip Hinge (Deadlifts/Pulls)',
      VERTICAL_PUSH: 'Vertical Push (Presses/HSPU)',
      VERTICAL_PULL: 'Vertical Pull (Pull-ups)',
      HORIZONTAL_PUSH: 'Horizontal Push (Push-ups/Burpees)',
      HORIZONTAL_PULL: 'Horizontal Pull (Rows)',
      OVERHEAD_STABILITY: 'Overhead Stability (Snatches/OHS)',
      CORE_ANTERIOR: 'Anterior Core (Toes-to-Bar)',
      CORE_POSTERIOR: 'Posterior Chain',
      MONOSTRUCTURAL: 'Aerobic Engine',
    };

    const fatiguedNames = fatigued.map((p) => planeNamesHebrewMap[p] || p).join(', ');
    const freshNames = fresh.slice(0, 2).map((p) => planeNamesHebrewMap[p] || p).join(', ');

    let summary = `⚠️ Cumulative fatigue detected in: [${fatiguedNames}].`;
    if (axialRestricted) {
      summary += ' Spinal/axial compression restricted for 24h.';
    }
    if (freshNames) {
      summary += ` Program bias shifted to fresh movement planes: [${freshNames}].`;
    }

    return summary;
  }
}
