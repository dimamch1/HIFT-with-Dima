import { FatigueEngine } from '../fatigueEngine';
import { ScalingEngine } from '../scalingEngine';
import { PacingCalculator } from '../pacingCalculator';
import { WODGenerator } from '../wodGenerator';
import { MOVEMENT_DATABASE } from '../movementDatabase';
import { DEFAULT_USER_PROFILE } from '../../services/storageService';
import { WorkoutLogEntry } from '../../types';

export function runAllEngineTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${testName}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${testName}`);
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Movement Database Integrity
  // -------------------------------------------------------------
  assert(MOVEMENT_DATABASE.length >= 15, 'Movement database contains all core HIFT movements');
  const thruster = MOVEMENT_DATABASE.find((m) => m.id === 'thruster');
  assert(
    thruster !== undefined && thruster.primaryPlane === 'KNEE_FLEXION',
    'Thruster movement definition exists with KNEE_FLEXION plane'
  );
  assert(
    thruster?.substitutions.length! > 0,
    'Thruster includes biomechanical substitutions (DB Thruster / Wall Ball)'
  );

  // -------------------------------------------------------------
  // TEST 2: Scaling Engine 1RM Loading & Plate Rounding
  // -------------------------------------------------------------
  const load75 = ScalingEngine.calculate1RMLoad(100, 75, false); // 100kg @ 75% -> 75kg
  assert(load75.weight === 75 && load75.label.includes('75 kg'), '1RM load calculation for 100kg @ 75% equals 75kg');

  const load82_5 = ScalingEngine.calculate1RMLoad(145, 80, false); // 145kg @ 80% = 116 -> rounded to 115kg
  assert(load82_5.weight === 115, '1RM load rounds to nearest standard 2.5kg plate increment (115kg)');

  const scaledMovement = ScalingEngine.scaleMovement(thruster!, DEFAULT_USER_PROFILE, true);
  assert(scaledMovement.movementId === 'thruster', 'Prescribed movement generated successfully');

  // -------------------------------------------------------------
  // TEST 3: Fatigue Engine & 48-72h Plane Balancing
  // -------------------------------------------------------------
  const now = new Date();
  const yesterday = new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString();

  const mockLogs: WorkoutLogEntry[] = [
    {
      id: 'log_1',
      date: yesterday,
      wodTitle: 'Heavy Squat Day',
      format: 'FOR_TIME',
      division: 'RX',
      score: '10:00',
      isRx: true,
      rpe: 9,
      recordedPlanes: ['KNEE_FLEXION', 'HIP_HINGE'],
      axialLoad: 'HEAVY',
    },
  ];

  const fatigueResult = FatigueEngine.calculateFatigue(mockLogs, now);
  assert(
    fatigueResult.fatiguedPlanes.includes('KNEE_FLEXION'),
    'Fatigue engine detects high knee flexion strain from yesterday'
  );
  assert(
    fatigueResult.axialLoadRestricted === true,
    'Fatigue engine restricts axial loading when heavy squat/deadlift volume was logged'
  );

  // -------------------------------------------------------------
  // TEST 4: Pacing Calculator & Target Benchmarks
  // -------------------------------------------------------------
  const pacingGuideline = PacingCalculator.generatePacingGuideline(
    'FOR_TIME',
    10,
    [scaledMovement],
    ['W', 'G']
  );
  assert(pacingGuideline.intendedStimulus.length > 0, 'Intended stimulus generated for 10 min For Time');
  assert(pacingGuideline.targetScoreRx.includes('Sub'), 'Target score Rx contains sub-time benchmark');

  // -------------------------------------------------------------
  // TEST 5: Master WOD Generator & 4-Phase Protocol
  // -------------------------------------------------------------
  const session = WODGenerator.generateSession(DEFAULT_USER_PROFILE, fatigueResult, false);
  assert(session.mobilityWarmup !== undefined, 'Phase 1: Mobility Warmup generated');
  assert(session.partAStrength !== undefined || session.isTimeCrunched, 'Phase 2: Strength/Skill Part A generated');
  assert(session.partBMetCon !== undefined, 'Phase 3: MetCon Part B generated');
  assert(session.partCAccessory !== undefined, 'Phase 4: Accessory Part C generated');

  // -------------------------------------------------------------
  // TEST 6: Time Crunch Mode
  // -------------------------------------------------------------
  const crunchedSession = WODGenerator.generateSession(DEFAULT_USER_PROFILE, fatigueResult, true);
  assert(crunchedSession.isTimeCrunched === true, 'Time Crunch session flag is true');
  assert(crunchedSession.partAStrength === undefined, 'Time Crunch mode trims Part A strength complex');
  assert(
    crunchedSession.estimatedDurationMinutes < session.estimatedDurationMinutes,
    'Time Crunch session total duration is significantly reduced'
  );

  return { passed, failed, results };
}
