import { WODFormat, PrescribedMovement, Modality } from '../types/index';

export interface PacingGuideline {
  intendedStimulus: string;
  pacingStrategy: string;
  targetScoreRx: string;
  targetScoreScaled: string;
  repBreakdownAdvice: string[];
}

export class PacingCalculator {
  /**
   * Generates tactical pacing, intended stimulus, and rep breakdown strategies
   * tailored to the WOD format and movement selection.
   */
  public static generatePacingGuideline(
    format: WODFormat,
    timeCapMinutes: number,
    movements: PrescribedMovement[],
    modalities: Modality[]
  ): PacingGuideline {
    let intendedStimulus = '';
    let pacingStrategy = '';
    let targetScoreRx = '';
    let targetScoreScaled = '';
    const repBreakdownAdvice: string[] = [];

    // Analyze stimulus based on format and duration
    if (format === 'FOR_TIME') {
      if (timeCapMinutes <= 7) {
        intendedStimulus = '🔥 Anaerobic Sprint (95-100% effort). High-intensity redline threshold.';
        pacingStrategy = 'Fast transitions, zero hesitation. Pick up the barbell/rope immediately without staring.';
        targetScoreRx = `Sub ${Math.floor(timeCapMinutes * 0.65)}:00`;
        targetScoreScaled = `Sub ${Math.floor(timeCapMinutes * 0.85)}:00`;
      } else if (timeCapMinutes <= 15) {
        intendedStimulus = '⚡ Lactate Endurance & Pacing (85% effort). Sustained high-power output.';
        pacingStrategy = 'Paced aggressive start (do not burn out in minute 1). Build tempo over the final 3 minutes.';
        targetScoreRx = `Sub ${Math.floor(timeCapMinutes * 0.75)}:00`;
        targetScoreScaled = `Sub ${timeCapMinutes - 1}:00`;
      } else {
        intendedStimulus = '🏔️ Aerobic Grinder / Stamina (70-75% effort). Pacing discipline & consistency.';
        pacingStrategy = 'Cruise control pace. Maintain consistent round splits (within 10s variance).';
        targetScoreRx = `Sub ${timeCapMinutes - 2}:00`;
        targetScoreScaled = `Finish under Cap (${timeCapMinutes}:00)`;
      }
    } else if (format === 'AMRAP') {
      if (timeCapMinutes <= 10) {
        intendedStimulus = '⚡ High-Density Sprint AMRAP. Short transitions and rapid cycling.';
        pacingStrategy = 'Aim for 1 round every 75-90 seconds with minimal chalk breaks.';
        targetScoreRx = `${Math.floor(timeCapMinutes / 1.5)}+ Rounds`;
        targetScoreScaled = `${Math.floor(timeCapMinutes / 2.2)} Rounds`;
      } else if (timeCapMinutes <= 20) {
        intendedStimulus = '🔄 Aerobic Threshold Engine AMRAP. Steady breathing & smooth transitions.';
        pacingStrategy = 'Pace yourself for round 4 at the exact speed of round 1. Avoid redlining early.';
        targetScoreRx = `${Math.floor(timeCapMinutes / 2.0)}+ Rounds`;
        targetScoreScaled = `${Math.floor(timeCapMinutes / 2.8)} Rounds`;
      } else {
        intendedStimulus = '🛡️ Long-Range Aerobic Capacity. Focus on cadence and mental endurance.';
        pacingStrategy = 'Treat this as an aerobic piece. Keep heart rate below 85% until the last 3 minutes.';
        targetScoreRx = `${Math.floor(timeCapMinutes / 3.0)}+ Rounds`;
        targetScoreScaled = `${Math.floor(timeCapMinutes / 4.0)} Rounds`;
      }
    } else if (format === 'EMOM' || format === 'E2MOM') {
      intendedStimulus = '⏱️ Interval Work-to-Rest Discipline. Consistent power output per window.';
      pacingStrategy = 'Complete work in 35-42 seconds per minute to secure 18-25 seconds of clean rest.';
      targetScoreRx = 'All rounds completed with >15s rest margin';
      targetScoreScaled = 'Completed within work window';
    } else if (format === 'TABATA') {
      intendedStimulus = '💥 20s Max Effort / 10s Micro-Rest. Maximum anaerobic glycolysis power.';
      pacingStrategy = 'Hit 80% target reps in Round 1 and defend that exact rep count for all 8 rounds.';
      targetScoreRx = 'Lowest round score consistency >85% of Round 1';
      targetScoreScaled = 'Complete all 8 intervals without sitting';
    } else {
      intendedStimulus = '🎯 Mixed Modal Chipper. Systematic execution of high volume.';
      pacingStrategy = 'Break each movement into predefined manageable mini-sets with strict 5-second rest.';
      targetScoreRx = `Sub ${Math.floor(timeCapMinutes * 0.75)}:00`;
      targetScoreScaled = `Finish under Cap (${timeCapMinutes}:00)`;
    }

    // Generate movement-specific rep breakdown tips
    movements.forEach((m) => {
      const name = m.name.toLowerCase();
      const reps = m.reps || 0;

      if (name.includes('thruster') && reps >= 15) {
        repBreakdownAdvice.push(
          `🏋️ Thrusters (${reps} reps): Break into ${Math.ceil(reps / 2)} + ${Math.floor(reps / 2)} with a 3-breath pause. Lock out overhead to exhale.`
        );
      } else if ((name.includes('pull-up') || name.includes('c2b') || name.includes('toes')) && reps >= 15) {
        repBreakdownAdvice.push(
          `🤸 Gymnastics Bar (${reps} reps): Break early before grip fails (e.g. ${Math.ceil(reps / 3)}s). Quick drop, 3-second chalk, back on.`
        );
      } else if (name.includes('wall ball') && reps >= 20) {
        repBreakdownAdvice.push(
          `🏀 Wall Balls (${reps} reps): Go unbroken or break into 2 clean sets. Relax arms downward while the ball is in flight.`
        );
      } else if (name.includes('burpee')) {
        repBreakdownAdvice.push(
          `⚡ Burpees: Step up out of the bottom to conserve quad strength for barbell/cycling work.`
        );
      } else if (name.includes('deadlift') && reps >= 12) {
        repBreakdownAdvice.push(
          `🧱 Deadlifts (${reps} reps): Rest on rep ${reps - 1}. Pick up the final rep directly into your next transition.`
        );
      }
    });

    if (repBreakdownAdvice.length === 0) {
      repBreakdownAdvice.push('💨 Keep steady rhythmic breathing: exhale on the exertion phase of every rep.');
      repBreakdownAdvice.push('⏱️ Transitions are where minutes are won: keep your barbell, rope, and rig close.');
    }

    return {
      intendedStimulus,
      pacingStrategy,
      targetScoreRx,
      targetScoreScaled,
      repBreakdownAdvice,
    };
  }
}
