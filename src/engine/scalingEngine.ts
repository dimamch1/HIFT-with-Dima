import {
  DivisionTier,
  EquipmentId,
  InjuryFlag,
  MovementDefinition,
  OneRepMaxes,
  PrescribedMovement,
  UserProfile,
} from '../types/index';
import { MOVEMENT_DATABASE } from './movementDatabase';

export class ScalingEngine {
  /**
   * Calculates practical barbell load based on a target 1RM percentage,
   * rounded to standard plate increments (2.5 kg or 5 lbs).
   */
  public static calculate1RMLoad(
    oneRepMax: number | undefined,
    percentage: number,
    isImperial: boolean = false
  ): { weight: number; label: string } {
    if (!oneRepMax || oneRepMax <= 0) {
      return {
        weight: 0,
        label: `${Math.round(percentage)}% of 1RM`,
      };
    }

    const raw = oneRepMax * (percentage / 100);
    const increment = isImperial ? 5 : 2.5;
    const rounded = Math.round(raw / increment) * increment;
    const unit = isImperial ? 'lbs' : 'kg';

    return {
      weight: rounded,
      label: `${rounded} ${unit} (${Math.round(percentage)}%)`,
    };
  }

  /**
   * Adapts a movement prescription to the user's division, equipment, and injuries.
   */
  public static scaleMovement(
    movement: MovementDefinition,
    user: UserProfile,
    isMale: boolean = true
  ): PrescribedMovement {
    const isAvailable = this.hasRequiredEquipment(movement, user.availableEquipment);
    const hasInjuryRisk = this.checkInjuryRisk(movement, user.injuries);

    // If equipment is missing or injury flag is raised, find a valid substitute
    if (!isAvailable || hasInjuryRisk) {
      const substitute = this.findBestSubstitution(movement, user);
      if (substitute) {
        return this.scaleMovement(substitute, user, isMale);
      }
    }

    // Determine weight based on 1RM or standard division loads
    let target1RMKey = movement.default1RMKey;
    let weightPercentage: number | undefined;
    let fixedKg: number | undefined;
    let fixedLbs: number | undefined;

    const rxDesc = isMale ? movement.defaultRxMen : movement.defaultRxWomen;
    let scaledDesc: string | undefined;

    // Apply division scaling
    switch (user.division) {
      case 'COMPETITOR':
        // Standard or elevated Rx
        scaledDesc = rxDesc;
        break;

      case 'RX':
        scaledDesc = rxDesc;
        break;

      case 'INTERMEDIATE':
        scaledDesc = this.getIntermediateScalingDescription(movement, isMale);
        break;

      case 'FOUNDATION':
        scaledDesc = this.getFoundationScalingDescription(movement, isMale);
        break;
    }

    // Build available 1-click substitutions list
    const substitutionsAvailable = movement.substitutions.map((sub) => {
      const target = MOVEMENT_DATABASE.find((m) => m.id === sub.targetMovementId);
      return {
        id: sub.targetMovementId,
        name: target ? target.name : sub.targetMovementId,
        notes: sub.notes,
      };
    });

    return {
      movementId: movement.id,
      name: movement.name,
      reps: 10, // Base default, customized by WOD generator
      rxDescription: rxDesc,
      scaledDescription: scaledDesc,
      target1RMKey,
      videoUrl: movement.videoUrl,
      videoEmbedId: movement.videoEmbedId,
      coachingCues: movement.coachingCues,
      pointsOfPerformance: movement.pointsOfPerformance,
      substitutionsAvailable,
    };
  }

  /**
   * Checks if user has all required equipment for a movement.
   */
  public static hasRequiredEquipment(
    movement: MovementDefinition,
    userEquipment: EquipmentId[]
  ): boolean {
    if (!movement.equipmentRequired || movement.equipmentRequired.length === 0) return true;
    return movement.equipmentRequired.every((req) => userEquipment.includes(req));
  }

  /**
   * Checks if a movement poses injury risks based on user's injury flags.
   */
  public static checkInjuryRisk(
    movement: MovementDefinition,
    userInjuries: InjuryFlag[]
  ): boolean {
    if (!userInjuries || userInjuries.length === 0) return false;
    return movement.injuryContraindications.some((inj) => userInjuries.includes(inj));
  }

  /**
   * Finds the best biomechanical equivalent substitute available for the user.
   */
  public static findBestSubstitution(
    movement: MovementDefinition,
    user: UserProfile
  ): MovementDefinition | null {
    for (const sub of movement.substitutions) {
      const candidate = MOVEMENT_DATABASE.find((m) => m.id === sub.targetMovementId);
      if (candidate) {
        const canUse = this.hasRequiredEquipment(candidate, user.availableEquipment);
        const safe = !this.checkInjuryRisk(candidate, user.injuries);
        if (canUse && safe) {
          return candidate;
        }
      }
    }

    // Fallback: search database for matching plane & modality with available equipment
    const fallback = MOVEMENT_DATABASE.find((m) => {
      if (m.id === movement.id) return false;
      const samePlane = m.primaryPlane === movement.primaryPlane;
      const canUse = this.hasRequiredEquipment(m, user.availableEquipment);
      const safe = !this.checkInjuryRisk(m, user.injuries);
      return samePlane && canUse && safe;
    });

    return fallback || null;
  }

  private static getIntermediateScalingDescription(
    movement: MovementDefinition,
    isMale: boolean
  ): string {
    if (movement.id === 'pull_up') return 'Banded Pull-ups or Jumping Pull-ups';
    if (movement.id === 'chest_to_bar') return 'Standard Chin-Over-Bar Pull-ups';
    if (movement.id === 'bar_muscle_up') return 'Chest-to-Bar + Bar Dips';
    if (movement.id === 'ring_muscle_up') return 'Pull-ups + Ring Dips';
    if (movement.id === 'hspu_kipping') return 'Box Pike Push-ups / 1 AbMat HSPU';
    if (movement.id === 'double_under') return 'Double Unders (Attempts) or 1.5x Single Unders';
    if (movement.id === 'toes_to_bar') return 'Hanging Knee-to-Elbows';
    if (movement.id === 'thruster') return isMale ? '34 kg (75 lbs)' : '25 kg (55 lbs)';
    if (movement.id === 'snatch_full' || movement.id === 'power_snatch')
      return isMale ? '43 kg (95 lbs)' : '29 kg (65 lbs)';
    if (movement.id === 'clean_and_jerk') return isMale ? '52 kg (115 lbs)' : '34 kg (75 lbs)';
    if (movement.id === 'deadlift') return isMale ? '84 kg (185 lbs)' : '57 kg (125 lbs)';
    if (movement.id === 'wall_ball') return isMale ? '6 kg (14 lbs)' : '4 kg (9 lbs)';

    return movement.scalingLadder[1] || 'Intermediate Load';
  }

  private static getFoundationScalingDescription(
    movement: MovementDefinition,
    isMale: boolean
  ): string {
    if (movement.id === 'pull_up' || movement.id === 'chest_to_bar') return 'Ring Rows (Horizontal)';
    if (movement.id === 'bar_muscle_up' || movement.id === 'ring_muscle_up') return 'Ring Rows + Push-ups';
    if (movement.id === 'hspu_kipping') return 'Dumbbell Push Press or Floor Push-ups';
    if (movement.id === 'double_under') return 'Single Unders (1:1)';
    if (movement.id === 'toes_to_bar') return 'Hanging Knee Raises or V-Ups';
    if (movement.id === 'thruster') return isMale ? '2x10 kg Dumbbells' : '2x6 kg Dumbbells';
    if (movement.id === 'deadlift') return isMale ? '61 kg (135 lbs)' : '43 kg (95 lbs)';
    if (movement.id === 'box_jump_over') return 'Box Step-Overs (20 inch)';

    return movement.scalingLadder[0] || 'Foundation Scaled';
  }
}
