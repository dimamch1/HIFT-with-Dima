import {
  AccessoryCooldownPhase,
  DailyWorkoutSession,
  DivisionTier,
  MetConPhase,
  MobilityWarmupPhase,
  MovementDefinition,
  MovementPlane,
  PrescribedMovement,
  StrengthSkillPhase,
  UserProfile,
  WODFormat,
} from '../types';
import { MOVEMENT_DATABASE } from './movementDatabase';
import { FatigueAnalysisResult } from './fatigueEngine';
import { ScalingEngine } from './scalingEngine';
import { PacingCalculator } from './pacingCalculator';

export class WODGenerator {
  /**
   * Helper to shuffle array elements randomly
   */
  private static shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Generates an intelligent, periodized 4-phase daily workout session
   * customized to athlete profile, fatigue state, and time constraints.
   */
  public static generateSession(
    user: UserProfile,
    fatigue: FatigueAnalysisResult,
    isTimeCrunched: boolean = false,
    sessionDate: string = new Date().toISOString().split('T')[0]
  ): DailyWorkoutSession {
    const isMale = user.gender === 'male';

    // 1. Determine Target Movement Planes based on fatigue
    const targetPlanes = this.selectDayPlanes(fatigue);

    // 2. Select MetCon Format & Movements
    const partBMetCon = this.generateMetCon(user, targetPlanes, fatigue, isTimeCrunched, isMale);

    // 3. Generate Targeted Dynamic Warmup based on MetCon planes
    const mobilityWarmup = this.generateTargetedWarmup(targetPlanes, isTimeCrunched);

    // 4. Generate Part A Strength / OLy / Skill (Omit or shorten if Time Crunched)
    let partAStrength: StrengthSkillPhase | undefined;
    if (!isTimeCrunched) {
      partAStrength = this.generateStrengthPhase(user, targetPlanes, fatigue, isMale);
    }

    // 5. Generate Part C Accessory & Down-Regulation
    const partCAccessory = this.generateAccessoryPhase(targetPlanes, isTimeCrunched);

    // 6. Calculate total estimated duration
    const warmupDuration = mobilityWarmup.durationMinutes;
    const strengthDuration = partAStrength ? 18 : 0;
    const metconDuration = partBMetCon.timeCapMinutes + 3; // cap + setup
    const accessoryDuration = 4;
    const totalDuration = warmupDuration + strengthDuration + metconDuration + accessoryDuration;

    return {
      id: `wod_${sessionDate}_${Date.now()}`,
      date: sessionDate,
      title: partBMetCon.title,
      theme: this.generateSessionTheme(partBMetCon.modalities, targetPlanes),
      estimatedDurationMinutes: totalDuration,
      isTimeCrunched,
      division: user.division,
      mobilityWarmup,
      partAStrength,
      partBMetCon,
      partCAccessory,
      targetedPlanes: targetPlanes,
      axialLoadingLevel: fatigue.axialLoadRestricted ? 'LOW' : 'MODERATE',
    };
  }

  private static selectDayPlanes(fatigue: FatigueAnalysisResult): MovementPlane[] {
    const availablePlanes: MovementPlane[] = [
      'KNEE_FLEXION',
      'HIP_HINGE',
      'VERTICAL_PUSH',
      'VERTICAL_PULL',
      'HORIZONTAL_PUSH',
      'HORIZONTAL_PULL',
      'OVERHEAD_STABILITY',
      'CORE_ANTERIOR',
      'MONOSTRUCTURAL',
    ];

    // Filter out heavily fatigued planes
    const safePlanes = availablePlanes.filter((p) => !fatigue.fatiguedPlanes.includes(p));
    const shuffled = this.shuffle(safePlanes);

    if (shuffled.length >= 3) {
      return shuffled.slice(0, 3);
    }

    return safePlanes.slice(0, 3);
  }

  private static generateTargetedWarmup(
    planes: MovementPlane[],
    isTimeCrunched: boolean
  ): MobilityWarmupPhase {
    const drills = [
      {
        name: 'Dynamic Scapular & T-Spine Flow',
        protocol: '10 PVC Pass-Throughs + 10 Cat-Cow + 5 Scapular Push-ups',
        focusJoint: 'Thoracic Spine & Scapulae',
      },
      {
        name: 'Ankle Dorsiflexion & Deep Squat Hold',
        protocol: '45s Banded Ankle Stretch per side + 30s Bottom of Squat Pry',
        focusJoint: 'Ankle Joint & Hip Capsule',
      },
      {
        name: 'Hinge & Glute Activation',
        protocol: '15 Banded Good Mornings + 12 Glute Bridges with 2s Pause',
        focusJoint: 'Hamstrings & Posterior Chain',
      },
    ];

    if (planes.includes('OVERHEAD_STABILITY') || planes.includes('VERTICAL_PUSH')) {
      drills.push({
        name: 'Shoulder Y-T-W Activation',
        protocol: '8 reps per position with light plates/band',
        focusJoint: 'Rotator Cuff & Lower Traps',
      });
    }

    const duration = isTimeCrunched ? 5 : 8;

    return {
      title: 'Targeted Mobility & Dynamic Activation',
      durationMinutes: duration,
      targetedPlanes: planes,
      drills: isTimeCrunched ? drills.slice(0, 2) : drills,
    };
  }

  private static generateStrengthPhase(
    user: UserProfile,
    planes: MovementPlane[],
    fatigue: FatigueAnalysisResult,
    isMale: boolean
  ): StrengthSkillPhase {
    const isImperial = user.unitPreference === 'imperial';
    const hasBarbell = user.availableEquipment.includes('barbell_and_plates');

    // If user does not have a barbell (e.g. Travel Minimal / Dumbbells only)
    if (!hasBarbell) {
      return {
        type: 'STRENGTH_PERCENTAGE',
        title: 'DB Heavy Complex & Unilateral Strength',
        scheme: '4 Sets: 6 Heavy Dual DB Thrusters + 8 DB Romanian Deadlifts + 10 DB Gorilla Rows',
        restBetweenSetsSeconds: 90,
        coachingNotes: 'Focus on perfect tension and explosive vertical extension with heavy dumbbells.',
        movements: [
          {
            movementId: 'db_thruster',
            name: 'Dual Dumbbell Heavy Thruster',
            reps: 6,
            customNotes: isMale ? '2x 22.5kg (50 lbs)' : '2x 15kg (35 lbs)',
          },
          {
            movementId: 'db_snatch',
            name: 'Alternating DB Power Snatch',
            reps: 10,
            customNotes: isMale ? '22.5kg (50 lbs)' : '15kg (35 lbs)',
          },
        ],
      };
    }

    // Barbell Strength Selection options
    const strengthOptions: StrengthSkillPhase[] = [];

    // 1. Snatch Complex
    if (!fatigue.axialLoadRestricted && user.oneRepMaxes.snatch) {
      const snatched1RM = user.oneRepMaxes.snatch;
      const load = ScalingEngine.calculate1RMLoad(snatched1RM, 75, isImperial);
      strengthOptions.push({
        type: 'OLy_COMPLEX',
        title: 'Snatch Technique & Wave Loading',
        scheme: '5 Sets x (1 Hang Power Snatch + 1 Low Hang Squat Snatch + 1 OHS) @ 72-78%',
        percentageMin: 72,
        percentageMax: 78,
        target1RMKey: 'snatch',
        prescribedWeightKg: !isImperial ? load.weight : undefined,
        prescribedWeightLbs: isImperial ? load.weight : undefined,
        restBetweenSetsSeconds: 120,
        coachingNotes:
          'Focus on aggressive vertical hip extension before pulling under the bar. Fast punch into active overhead lockout.',
        movements: [
          {
            movementId: 'snatch_full',
            name: 'Hang Power Snatch + Squat Snatch',
            reps: 2,
            weightPercentage1RM: 75,
            target1RMKey: 'snatch',
            customNotes: `@ ${load.label}`,
          },
        ],
      });
    }

    // 2. Clean & Jerk Complex
    if (!fatigue.axialLoadRestricted && user.oneRepMaxes.cleanAndJerk) {
      const cj1RM = user.oneRepMaxes.cleanAndJerk;
      const load = ScalingEngine.calculate1RMLoad(cj1RM, 78, isImperial);
      strengthOptions.push({
        type: 'OLy_COMPLEX',
        title: 'Clean & Jerk Percentage Waves',
        scheme: '5 Sets x (1 Power Clean + 1 Hang Squat Clean + 1 Split Jerk) @ 75-80%',
        percentageMin: 75,
        percentageMax: 80,
        target1RMKey: 'cleanAndJerk',
        prescribedWeightKg: !isImperial ? load.weight : undefined,
        prescribedWeightLbs: isImperial ? load.weight : undefined,
        restBetweenSetsSeconds: 120,
        coachingNotes: 'Fast elbows through the front rack, sharp drive and foot split on jerk.',
        movements: [
          {
            movementId: 'clean_full',
            name: 'Power Clean + Squat Clean + Split Jerk',
            reps: 3,
            weightPercentage1RM: 78,
            target1RMKey: 'cleanAndJerk',
            customNotes: `@ ${load.label}`,
          },
        ],
      });
    }

    // 3. Back Squat Strength
    if (user.oneRepMaxes.backSquat) {
      const squat1RM = user.oneRepMaxes.backSquat;
      const load = ScalingEngine.calculate1RMLoad(squat1RM, 80, isImperial);
      strengthOptions.push({
        type: 'STRENGTH_PERCENTAGE',
        title: 'Back Squat Strength Cycle',
        scheme: '5 Sets x 5 Reps @ 78-82% of 1RM (Tempo 20X1)',
        percentageMin: 78,
        percentageMax: 82,
        target1RMKey: 'backSquat',
        prescribedWeightKg: !isImperial ? load.weight : undefined,
        prescribedWeightLbs: isImperial ? load.weight : undefined,
        restBetweenSetsSeconds: 150,
        coachingNotes:
          '2-second controlled descent, no bounce in the hole, explosive drive up leading with the upper back.',
        movements: [
          {
            movementId: 'back_squat',
            name: 'Back Squat',
            reps: 5,
            weightPercentage1RM: 80,
            target1RMKey: 'backSquat',
            customNotes: `@ ${load.label}`,
          },
        ],
      });
    }

    // 4. Deadlift Strength
    if (!fatigue.axialLoadRestricted && user.oneRepMaxes.deadlift) {
      const dl1RM = user.oneRepMaxes.deadlift;
      const load = ScalingEngine.calculate1RMLoad(dl1RM, 75, isImperial);
      strengthOptions.push({
        type: 'STRENGTH_PERCENTAGE',
        title: 'Deadlift Posterior Chain Wave',
        scheme: '4 Sets x 4 Reps @ 75-80% (Reset every rep)',
        percentageMin: 75,
        percentageMax: 80,
        target1RMKey: 'deadlift',
        prescribedWeightKg: !isImperial ? load.weight : undefined,
        prescribedWeightLbs: isImperial ? load.weight : undefined,
        restBetweenSetsSeconds: 120,
        coachingNotes: 'Lat engagement, brace abdominal wall, push the floor away.',
        movements: [
          {
            movementId: 'deadlift',
            name: 'Deadlift',
            reps: 4,
            weightPercentage1RM: 75,
            target1RMKey: 'deadlift',
            customNotes: `@ ${load.label}`,
          },
        ],
      });
    }

    // 5. Strict Press / Overhead
    if (user.oneRepMaxes.strictPress) {
      const sp1RM = user.oneRepMaxes.strictPress;
      const load = ScalingEngine.calculate1RMLoad(sp1RM, 80, isImperial);
      strengthOptions.push({
        type: 'STRENGTH_PERCENTAGE',
        title: 'Strict Overhead Press Wave',
        scheme: '5 Sets x 5 Reps @ 78-82% of 1RM',
        percentageMin: 78,
        percentageMax: 82,
        target1RMKey: 'strictPress',
        prescribedWeightKg: !isImperial ? load.weight : undefined,
        prescribedWeightLbs: isImperial ? load.weight : undefined,
        restBetweenSetsSeconds: 90,
        coachingNotes: 'Glutes and quads locked tight, active shoulder shrug at the top.',
        movements: [
          {
            movementId: 'strict_press',
            name: 'Strict Press',
            reps: 5,
            weightPercentage1RM: 80,
            target1RMKey: 'strictPress',
            customNotes: `@ ${load.label}`,
          },
        ],
      });
    }

    // Pick one at random from valid strength options
    const chosen: StrengthSkillPhase =
      strengthOptions.length > 0
        ? strengthOptions[Math.floor(Math.random() * strengthOptions.length)]
        : {
            type: 'SKILL_EMOM',
            title: 'Gymnastics Bar Density & Efficiency',
            scheme: 'EMOM 10 Minutes (Alternating Odd/Even)',
            restBetweenSetsSeconds: 25,
            coachingNotes:
              'Focus on smooth hollow-to-arch kip timing. Unbroken quality over raw speed.',
            movements: [
              {
                movementId: 'pull_up',
                name: 'Min 1: 5-8 Chest-to-Bar / Kipping Pull-ups (Smooth Kip)',
                reps: 8,
              },
              {
                movementId: 'hspu_kipping',
                name: 'Min 2: 6-10 Strict/Kipping Handstand Push-ups or Box Pike',
                reps: 8,
              },
            ],
          };

    // Enrich all strength movements with video demo metadata from database
    chosen.movements = chosen.movements.map((m) => {
      const def = MOVEMENT_DATABASE.find(
        (d) => d.id === m.movementId || d.name.toLowerCase().includes(m.movementId.toLowerCase())
      );
      if (def) {
        return {
          ...m,
          videoEmbedId: m.videoEmbedId || def.videoEmbedId,
          videoUrl: m.videoUrl || def.videoUrl,
          coachingCues: m.coachingCues || def.coachingCues,
          pointsOfPerformance: m.pointsOfPerformance || def.pointsOfPerformance,
        };
      }
      return m;
    });

    return chosen;
  }

  private static generateMetCon(
    user: UserProfile,
    planes: MovementPlane[],
    fatigue: FatigueAnalysisResult,
    isTimeCrunched: boolean,
    isMale: boolean
  ): MetConPhase {
    const formats: WODFormat[] = isTimeCrunched
      ? ['AMRAP', 'TABATA', 'FOR_TIME']
      : ['AMRAP', 'FOR_TIME', 'EMOM', 'CHIPPER', 'INTERVAL'];
    const chosenFormat = formats[Math.floor(Math.random() * formats.length)];

    let timeCap = 14;
    if (chosenFormat === 'AMRAP') timeCap = isTimeCrunched ? 10 : 12 + Math.floor(Math.random() * 6); // 12-18 min
    if (chosenFormat === 'FOR_TIME') timeCap = isTimeCrunched ? 9 : 14 + Math.floor(Math.random() * 6); // 14-20 min
    if (chosenFormat === 'EMOM') timeCap = isTimeCrunched ? 10 : 12 + Math.floor(Math.random() * 5) * 2; // 12, 14, 16, 18, 20 min
    if (chosenFormat === 'TABATA') timeCap = 8;
    if (chosenFormat === 'INTERVAL') timeCap = 12;

    // Filter candidate movements strictly by equipment, injuries, and safe planes
    const candidateMovements = MOVEMENT_DATABASE.filter((m) => {
      const safe = !ScalingEngine.checkInjuryRisk(m, user.injuries);
      const equipmentOk = ScalingEngine.hasRequiredEquipment(m, user.availableEquipment);
      const planeOk = !fatigue.fatiguedPlanes.includes(m.primaryPlane);
      return safe && equipmentOk && planeOk;
    });

    const mMovements = this.shuffle(candidateMovements.filter((m) => m.modality === 'M'));
    const gMovements = this.shuffle(candidateMovements.filter((m) => m.modality === 'G'));
    const wMovements = this.shuffle(candidateMovements.filter((m) => m.modality === 'W'));

    // Pick 2, 3, or 4 movements randomly across modalities
    const selectedDefs: MovementDefinition[] = [];

    if (chosenFormat === 'CHIPPER' && candidateMovements.length >= 4) {
      // Chipper: 4 diverse movements
      const shuffledAll = this.shuffle(candidateMovements);
      selectedDefs.push(...shuffledAll.slice(0, 4));
    } else {
      // Triplet or Couplet across W, G, M
      if (wMovements.length > 0) selectedDefs.push(wMovements[0]);
      if (gMovements.length > 0) selectedDefs.push(gMovements[0]);
      if (mMovements.length > 0) selectedDefs.push(mMovements[0]);

      // If we don't have all 3 modalities, fill with other available candidates
      if (selectedDefs.length < 2) {
        const remaining = this.shuffle(candidateMovements.filter((m) => !selectedDefs.includes(m)));
        selectedDefs.push(...remaining.slice(0, 3 - selectedDefs.length));
      }
    }

    // If still empty (e.g. strict travel constraints), fallback to push-ups, squats, burpees
    if (selectedDefs.length === 0) {
      selectedDefs.push(MOVEMENT_DATABASE[12], MOVEMENT_DATABASE[18]); // push-up, burpee
    }

    const prescribed: PrescribedMovement[] = selectedDefs.map((def, idx) => {
      const scaled = ScalingEngine.scaleMovement(def, user, isMale);
      if (def.unit === 'calories') {
        scaled.calories = isMale ? 15 : 12;
      } else if (def.unit === 'meters') {
        scaled.distanceMeters = 200;
      } else {
        // Diverse rep counts based on format
        if (chosenFormat === 'AMRAP') {
          scaled.reps = idx === 0 ? 12 : idx === 1 ? 9 : 15;
        } else if (chosenFormat === 'FOR_TIME') {
          scaled.reps = idx === 0 ? 21 : idx === 1 ? 15 : 9;
        } else if (chosenFormat === 'EMOM') {
          scaled.reps = idx === 0 ? 10 : idx === 1 ? 8 : 12;
        } else {
          scaled.reps = 12;
        }
      }
      return scaled;
    });

    const modalities = Array.from(new Set(selectedDefs.map((d) => d.modality)));
    const pacing = PacingCalculator.generatePacingGuideline(chosenFormat, timeCap, prescribed, modalities);

    const WOD_TITLES = [
      'Valkyrie MetCon',
      'Iron Tempest',
      'The Crucible',
      'Apex Triplet',
      'Cerberus Engine',
      'Titan Protocol',
      'Hydra Flow',
      'The Foundry',
      'Stormbreaker Sprint',
      'Aegis MetCon',
    ];
    const pickedTitleName = WOD_TITLES[Math.floor(Math.random() * WOD_TITLES.length)];

    return {
      format: chosenFormat,
      title: `${pickedTitleName} (${chosenFormat} ${timeCap})`,
      timeCapMinutes: timeCap,
      intervalWorkSeconds: chosenFormat === 'TABATA' ? 20 : chosenFormat === 'EMOM' ? 60 : chosenFormat === 'INTERVAL' ? 45 : undefined,
      intervalRestSeconds: chosenFormat === 'TABATA' ? 10 : chosenFormat === 'INTERVAL' ? 15 : undefined,
      totalRounds: chosenFormat === 'TABATA' ? 8 : chosenFormat === 'EMOM' ? timeCap : chosenFormat === 'INTERVAL' ? 6 : undefined,
      movements: prescribed,
      modalities,
      intendedStimulus: pacing.intendedStimulus,
      pacingStrategy: pacing.pacingStrategy,
      targetScoreRx: pacing.targetScoreRx,
      targetScoreScaled: pacing.targetScoreScaled,
    };
  }

  private static generateAccessoryPhase(
    planes: MovementPlane[],
    isTimeCrunched: boolean
  ): AccessoryCooldownPhase {
    const accessorySets = [
      {
        title: 'Trunk Stability & Parasympathetic Down-Regulation',
        focus: 'Midline anti-rotational stability + nervous system recovery',
        movements: [
          {
            name: '3 Sets: 30s Hollow Body Hold + 15 Banded Facepulls',
            protocol: 'Unbroken hold with lower back glued to floor. Rest 45s between sets.',
            notes: 'Strengthens anterior midline and restores scapular alignment.',
          },
          {
            name: 'Box Breathing Down-Regulation (4-4-4-4)',
            protocol: '2 Minutes: Inhale 4s ➔ Hold 4s ➔ Exhale 4s ➔ Hold 4s (Nasal only)',
            notes: 'Lowers cortisol, activates vagal nerve tone, and accelerates systemic recovery.',
          },
        ],
      },
      {
        title: 'Posterior Chain & Glute Reset',
        focus: 'Hamstring eccentric loading & hip decompression',
        movements: [
          {
            name: '3 Sets: 12 Single-Leg Glute Bridges + 30s Copenhagen Plank',
            protocol: 'Controlled 2s hold at peak. Rest 30s between sides.',
            notes: 'Restores pelvic balance after intense squatting/jumping.',
          },
          {
            name: 'Pigeon Pose + Couch Stretch',
            protocol: '60s per side deep diaphragmatic breathing',
            notes: 'Releases psoas and hip flexor tension.',
          },
        ],
      },
      {
        title: 'Shoulder Capsule & Thoracic Extension Flow',
        focus: 'Scapular mobility and anterior chest opening',
        movements: [
          {
            name: '3 Sets: 10 Prone Trap Raises + 12 Banded Pull-Aparts',
            protocol: 'Thumbs up, strict 1s pause in full retraction.',
            notes: 'Stabilizes rotator cuff and upper back posture.',
          },
          {
            name: 'Child’s Pose with Lat Reach',
            protocol: '90s per side with long slow exhales',
            notes: 'Down-regulates sympathetic drive.',
          },
        ],
      },
    ];

    return accessorySets[Math.floor(Math.random() * accessorySets.length)];
  }

  private static generateSessionTheme(modalities: ('M' | 'G' | 'W')[], planes: MovementPlane[]): string {
    const mods = modalities.join(' + ');
    const planeName = planes[0] ? planes[0].replace('_', ' ') : 'Functional HIFT';
    return `Mixed-Modal [${mods}] | Bias: ${planeName}`;
  }
}
