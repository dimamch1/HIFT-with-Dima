// ==========================================
// 🏋️ CROSSFIT & HIFT COMPREHENSIVE TYPE DEFINITIONS
// ==========================================

export type Gender = 'male' | 'female' | 'other';
export type UnitPreference = 'metric' | 'imperial';

export type DivisionTier = 
  | 'FOUNDATION'     // Banded/jumping pull-ups, knee raises, single unders, DB substitutions
  | 'INTERMEDIATE'   // Standard bodyweight mastery, moderate barbell cycling
  | 'RX'             // Competition loads, chest-to-bar, double unders, standard gymnastics
  | 'COMPETITOR';    // Heavy loads under fatigue, strict gymnastics, ring muscle-ups, advanced pacing

export type SkillLevel = 'none' | 'developing' | 'proficient' | 'mastered';

export interface GymnasticsSkills {
  pullUps: SkillLevel;
  chestToBar: SkillLevel;
  barMuscleUps: SkillLevel;
  ringMuscleUps: SkillLevel;
  handstandPushUpsStrict: SkillLevel;
  handstandPushUpsKipping: SkillLevel;
  handstandWalk: SkillLevel;
  toesToBar: SkillLevel;
  doubleUnders: SkillLevel;
  ropeClimbs: SkillLevel;
  pistolSquats: SkillLevel;
}

export type EquipmentId =
  | 'barbell_and_plates'
  | 'pull_up_bar'
  | 'gymnastics_rings'
  | 'dumbbells'
  | 'kettlebells'
  | 'concept2_rower'
  | 'concept2_skierg'
  | 'concept2_bike_erg'
  | 'assault_echo_bike'
  | 'wall_ball'
  | 'plyo_box'
  | 'jump_rope'
  | 'ghd'
  | 'climbing_rope'
  | 'bench'
  | 'squat_rack'
  | 'sled'
  | 'yoke'
  | 'monkey_bars';

export type EquipmentPreset = 'full_box' | 'garage_gym' | 'travel_minimal' | 'custom';

export type InjuryFlag =
  | 'lower_back'
  | 'shoulder_impingement'
  | 'wrist_mobility'
  | 'knee_patellar'
  | 'ankle_restrictions'
  | 'elbow_tendonitis';

export interface OneRepMaxes {
  snatch?: number;
  cleanAndJerk?: number;
  powerClean?: number;
  powerSnatch?: number;
  overheadSquat?: number;
  backSquat?: number;
  frontSquat?: number;
  deadlift?: number;
  strictPress?: number;
  pushPress?: number;
  thruster?: number;
  benchPress?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  unitPreference: UnitPreference;
  division: DivisionTier;
  skills: GymnasticsSkills;
  oneRepMaxes: OneRepMaxes;
  availableEquipment: EquipmentId[];
  equipmentPreset: EquipmentPreset;
  injuries: InjuryFlag[];
  targetWeeklySessions: number;
  preferredSessionDurationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 🧩 BIOMECHANICS & MOVEMENT TYPES
// ==========================================

export type Modality = 'M' | 'G' | 'W'; // Monostructural, Gymnastics, Weightlifting

export type MovementPlane =
  | 'KNEE_FLEXION'       // Squats, Wall Balls, Thrusters, Pistols
  | 'HIP_HINGE'          // Deadlifts, Cleans, Snatches, KB Swings
  | 'VERTICAL_PUSH'      // Push Press, Jerks, HSPU, Strict Press
  | 'VERTICAL_PULL'      // Pull-ups, C2B, Muscle-ups, Rope Climbs
  | 'HORIZONTAL_PUSH'    // Push-ups, Bench Press, Dips, Burpees
  | 'HORIZONTAL_PULL'    // Ring Rows, Barbell Rows
  | 'OVERHEAD_STABILITY' // Overhead Squat, Snatches, Handstand Walk
  | 'CORE_ANTERIOR'      // Toes-to-bar, L-sits, Sit-ups, Hollow Holds
  | 'CORE_POSTERIOR'     // GHD Back Extensions, Arch Holds, Good Mornings
  | 'MONOSTRUCTURAL';    // Rowing, Running, Biking, Double Unders

export type AxialLoadingLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HEAVY';

export interface MovementPointsOfPerformance {
  setup: string;
  execution: string;
  standards: string;
  commonFaults: string;
}

export interface MovementDefinition {
  id: string;
  name: string;
  modality: Modality;
  primaryPlane: MovementPlane;
  secondaryPlanes?: MovementPlane[];
  axialLoading: AxialLoadingLevel;
  equipmentRequired: EquipmentId[];
  defaultRxMen?: string;
  defaultRxWomen?: string;
  default1RMKey?: keyof OneRepMaxes;
  unit: 'reps' | 'calories' | 'meters' | 'seconds';
  scalingLadder: string[]; // Progression from easiest to hardest
  substitutions: {
    targetMovementId: string;
    notes: string;
    multiplier?: number;
  }[];
  injuryContraindications: InjuryFlag[];
  coachingCues: string[];
  videoUrl?: string;
  videoEmbedId?: string;
  pointsOfPerformance?: MovementPointsOfPerformance;
}

// ==========================================
// ⚡ WOD GENERATION & WORKOUT SESSION
// ==========================================

export type WODFormat = 
  | 'AMRAP' 
  | 'FOR_TIME' 
  | 'EMOM' 
  | 'E2MOM' 
  | 'TABATA' 
  | 'CHIPPER' 
  | 'INTERVAL';

export interface PrescribedMovement {
  movementId: string;
  name: string;
  reps?: number;
  calories?: number;
  distanceMeters?: number;
  durationSeconds?: number;
  weightPercentage1RM?: number;
  target1RMKey?: keyof OneRepMaxes;
  fixedWeightKg?: number;
  fixedWeightLbs?: number;
  rxDescription?: string;
  scaledDescription?: string;
  customNotes?: string;
  videoUrl?: string;
  videoEmbedId?: string;
  coachingCues?: string[];
  pointsOfPerformance?: MovementPointsOfPerformance;
  substitutionsAvailable?: { id: string; name: string; notes: string }[];
}

export interface MobilityWarmupPhase {
  title: string;
  durationMinutes: number;
  targetedPlanes: MovementPlane[];
  drills: {
    name: string;
    protocol: string;
    focusJoint: string;
  }[];
}

export interface StrengthSkillPhase {
  type: 'OLy_COMPLEX' | 'STRENGTH_PERCENTAGE' | 'SKILL_EMOM' | 'TEMPO_WORK';
  title: string;
  scheme: string; // e.g. "5 x 3 @ 75-80%" or "E2MOM 10 Min"
  percentageMin?: number;
  percentageMax?: number;
  target1RMKey?: keyof OneRepMaxes;
  prescribedWeightKg?: number;
  prescribedWeightLbs?: number;
  movements: PrescribedMovement[];
  restBetweenSetsSeconds: number;
  coachingNotes: string;
}

export interface MetConPhase {
  format: WODFormat;
  title: string;
  timeCapMinutes: number;
  intervalWorkSeconds?: number;
  intervalRestSeconds?: number;
  totalRounds?: number;
  movements: PrescribedMovement[];
  modalities: Modality[]; // e.g. ['M', 'G', 'W']
  intendedStimulus: string; // e.g. "Aerobic threshold - 75% steady pacing"
  pacingStrategy: string;   // e.g. "Break thrusters into 12+9; do not redline on round 1"
  targetScoreRx: string;    // e.g. "Sub 8:30" or "5+ Rounds"
  targetScoreScaled: string;// e.g. "Sub 11:00" or "4 Rounds"
}

export interface AccessoryCooldownPhase {
  title: string;
  focus: string;
  movements: {
    name: string;
    protocol: string; // e.g. "3 Sets of 15 Banded Facepulls + 30s Hollow Hold"
    notes: string;
  }[];
}

export interface DailyWorkoutSession {
  id: string;
  date: string;
  title: string;
  theme: string;
  estimatedDurationMinutes: number;
  isTimeCrunched: boolean;
  division: DivisionTier;
  mobilityWarmup: MobilityWarmupPhase;
  partAStrength?: StrengthSkillPhase;
  partBMetCon: MetConPhase;
  partCAccessory: AccessoryCooldownPhase;
  targetedPlanes: MovementPlane[];
  axialLoadingLevel: AxialLoadingLevel;
}

// ==========================================
// 📊 LOGGING & HISTORY
// ==========================================

export interface WorkoutLogEntry {
  id: string;
  date: string;
  sessionId?: string;
  wodTitle: string;
  format: WODFormat;
  division: DivisionTier;
  score: string; // e.g. "08:42" or "6 Rounds + 14 Reps"
  roundsCompleted?: number;
  repsCompleted?: number;
  timeTakenSeconds?: number;
  isRx: boolean;
  rpe: number; // 1 to 10 Rate of Perceived Exertion
  heartRateAvg?: number;
  notes?: string;
  recordedPlanes: MovementPlane[];
  axialLoad: AxialLoadingLevel;
  loggedStrengthWeightKg?: number;
}

export interface PlaneFatigueRecord {
  date: string; // YYYY-MM-DD
  planeStrains: Record<MovementPlane, number>; // 0 to 10 strain score
  axialLoadScore: number; // 0 to 10
  totalVolumeMultiplier: number;
}

// ==========================================
// ⏱️ TIMER SYSTEM TYPES
// ==========================================

export type TimerMode = 
  | 'FOR_TIME' 
  | 'AMRAP' 
  | 'EMOM' 
  | 'TABATA' 
  | 'CUSTOM_INTERVAL';

export type TimerStatus = 
  | 'IDLE' 
  | 'PRE_COUNTDOWN' 
  | 'RUNNING' 
  | 'PAUSED' 
  | 'COMPLETED';

export type IntervalPhase = 'WORK' | 'REST' | 'PREP';

export interface TimerConfig {
  mode: TimerMode;
  timeCapSeconds: number;       // For Time cap or AMRAP duration
  countdownSeconds: number;     // 10s or 3s pre-start
  intervalWorkSeconds: number;  // EMOM (60s) or Tabata (20s)
  intervalRestSeconds: number;  // Tabata (10s) or Custom
  totalRounds: number;          // EMOM minutes or Tabata (8)
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  audioDuckingEnabled: boolean;
}

export interface SplitRecord {
  roundNumber: number;
  timestampSeconds: number;
  splitDurationSeconds: number;
}

export interface ActiveWodDetails {
  title: string;
  format: string;
  description?: string;
  movements: {
    name: string;
    prescription: string;
  }[];
  intendedStimulus?: string;
  targetScore?: string;
}

export interface ActiveTimerState {
  status: TimerStatus;
  config: TimerConfig;
  startTime: number | null;
  pausedTime: number | null;
  totalPausedDuration: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  currentRound: number;
  totalRounds: number;
  intervalPhase: IntervalPhase;
  intervalElapsedSeconds: number;
  intervalRemainingSeconds: number;
  amrapRounds: number;
  amrapReps: number;
  splits: SplitRecord[];
  activeWodDetails?: ActiveWodDetails | null;
}

// ==========================================
// 🏆 BENCHMARK VAULT TYPES
// ==========================================

export type BenchmarkCategory = 
  | 'THE_GIRLS' 
  | 'HEROES' 
  | 'NO_SCALING' 
  | 'METCONS' 
  | 'STRENGTH_COMPLEX' 
  | 'CONDITIONING' 
  | 'TEAM_WODS'
  | 'OPEN_CLASSICS' 
  | '1RM_STRENGTH';

export interface BenchmarkWOD {
  id: string;
  name: string;
  category: BenchmarkCategory;
  description: string;
  format: WODFormat;
  movements: {
    name: string;
    reps?: number;
    rxWeightMen?: string;
    rxWeightWomen?: string;
    distance?: string;
    calories?: number;
    durationSeconds?: number;
  }[];
  timeCapMinutes: number;
  targetGoodScore: string;
  targetEliteScore: string;
  intendedStimulus: string;
  pacingTips: string[];
}

export interface BenchmarkPRRecord {
  id: string;
  benchmarkId: string;
  date: string;
  score: string;
  timeSeconds?: number;
  roundsReps?: string;
  weightKg?: number;
  isRx: boolean;
  notes?: string;
  isAllTimePR: boolean;
}
