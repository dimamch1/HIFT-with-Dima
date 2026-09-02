import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import {
  AccessoryCooldownPhase,
  DailyWorkoutSession,
  MetConPhase,
  MobilityWarmupPhase,
  PrescribedMovement,
  StrengthSkillPhase,
} from '../../types';
import { Badge } from '../common/Badge';
import { MovementRow } from './MovementRow';
import { PacingGuide } from './PacingGuide';
import { Flame, Dumbbell, Activity, Heart, Play, Clock } from 'lucide-react-native';
import { Button } from '../common/Button';

interface PhaseCardProps {
  phaseType: 'WARMUP' | 'STRENGTH' | 'METCON' | 'ACCESSORY';
  warmupData?: MobilityWarmupPhase;
  strengthData?: StrengthSkillPhase;
  metconData?: MetConPhase;
  accessoryData?: AccessoryCooldownPhase;
  onLaunchTimer?: () => void;
  onOpenSubstitution?: (movement: PrescribedMovement) => void;
  onOpenVideoDemo?: (movement: PrescribedMovement) => void;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({
  phaseType,
  warmupData,
  strengthData,
  metconData,
  accessoryData,
  onLaunchTimer,
  onOpenSubstitution,
  onOpenVideoDemo,
}) => {
  if (phaseType === 'WARMUP' && warmupData) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Flame size={20} color={COLORS.amberRest} />
            <Text style={styles.phaseLabel}>Mobility & Dynamic Warm-up</Text>
          </View>
          <Badge label={`${warmupData.durationMinutes} Min`} variant="amber" size="sm" />
        </View>

        <Text style={styles.phaseTitle}>{warmupData.title}</Text>

        <View style={styles.drillsList}>
          {warmupData.drills.map((drill, idx) => (
            <View key={idx} style={styles.drillItem}>
              <View style={styles.drillDot} />
              <View style={styles.drillContent}>
                <Text style={styles.drillName}>{drill.name}</Text>
                <Text style={styles.drillProtocol}>{drill.protocol}</Text>
                <Text style={styles.drillFocus}>Target: {drill.focusJoint}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (phaseType === 'STRENGTH' && strengthData) {
    return (
      <View style={[styles.card, styles.strengthCard]}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Dumbbell size={20} color={COLORS.cyanElectric} />
            <Text style={styles.phaseLabel}>Part A: Strength / Skill / OLy</Text>
          </View>
          <Badge label={strengthData.type.replace('_', ' ')} variant="cyan" size="sm" />
        </View>

        <Text style={styles.phaseTitle}>{strengthData.title}</Text>

        {/* Scheme & Weight percentage info */}
        <View style={styles.schemeBox}>
          <Text style={styles.schemeText}>{strengthData.scheme}</Text>
          {strengthData.prescribedWeightKg ? (
            <Text style={styles.weightNote}>
              Target Bar Load: {strengthData.prescribedWeightKg} kg
            </Text>
          ) : null}
          <Text style={styles.restNote}>Rest: {strengthData.restBetweenSetsSeconds}s between sets</Text>
        </View>

        {/* Movements */}
        <View style={styles.movementsList}>
          {strengthData.movements.map((movement, idx) => (
            <MovementRow
              key={idx}
              movement={movement}
              index={idx}
              onOpenVideoDemo={onOpenVideoDemo}
              showSubButton={false}
            />
          ))}
        </View>

        {/* Coaching notes */}
        {strengthData.coachingNotes ? (
          <View style={styles.coachingBox}>
            <Text style={styles.coachingLabel}>Coach's Eye:</Text>
            <Text style={styles.coachingText}>{strengthData.coachingNotes}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  if (phaseType === 'METCON' && metconData) {
    return (
      <View style={[styles.card, styles.metconCard]}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Activity size={20} color={COLORS.safetyOrange} />
            <Text style={styles.phaseLabel}>Part B: Main MetCon</Text>
          </View>
          <View style={styles.badgeGroup}>
            {metconData.modalities.map((m) => (
              <Badge key={m} label={m} modality={m} size="sm" style={styles.miniBadge} />
            ))}
            <Badge label={metconData.format} variant="orange" size="sm" />
          </View>
        </View>

        <Text style={styles.phaseTitle}>{metconData.title}</Text>

        <View style={styles.timeCapRow}>
          <Clock size={16} color={COLORS.neonLime} />
          <Text style={styles.timeCapText}>Time Cap: {metconData.timeCapMinutes}:00 Min</Text>
        </View>

        {/* Movements */}
        <View style={styles.movementsList}>
          {metconData.movements.map((movement, idx) => (
            <MovementRow
              key={idx}
              movement={movement}
              index={idx}
              onOpenSubstitution={onOpenSubstitution}
              onOpenVideoDemo={onOpenVideoDemo}
              showSubButton={true}
            />
          ))}
        </View>

        {/* Pacing & Target Stimulus */}
        <PacingGuide
          intendedStimulus={metconData.intendedStimulus}
          pacingStrategy={metconData.pacingStrategy}
          targetScoreRx={metconData.targetScoreRx}
          targetScoreScaled={metconData.targetScoreScaled}
        />

        {/* Quick Launch in Timer Button */}
        {onLaunchTimer && (
          <Button
            title="Launch WOD in Timer"
            variant="primary"
            size="lg"
            icon={<Play size={18} color="#000" fill="#000" />}
            onPress={onLaunchTimer}
            style={styles.timerButton}
          />
        )}
      </View>
    );
  }

  if (phaseType === 'ACCESSORY' && accessoryData) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Heart size={20} color={COLORS.vibrantPurple} />
            <Text style={styles.phaseLabel}>Part C: Trunk & Down-Regulation</Text>
          </View>
          <Badge label="Recovery" variant="purple" size="sm" />
        </View>

        <Text style={styles.phaseTitle}>{accessoryData.title}</Text>
        <Text style={styles.focusText}>Focus: {accessoryData.focus}</Text>

        <View style={styles.accessoryList}>
          {accessoryData.movements.map((item, idx) => (
            <View key={idx} style={styles.accessoryItem}>
              <Text style={styles.accessoryName}>{item.name}</Text>
              <Text style={styles.accessoryProtocol}>{item.protocol}</Text>
              <Text style={styles.accessoryNotes}>{item.notes}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  strengthCard: {
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  metconCard: {
    borderColor: 'rgba(255, 85, 0, 0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: SPACING.xs + 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniBadge: {
    marginRight: 2,
  },
  phaseTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  drillsList: {
    marginTop: SPACING.xs,
  },
  drillItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  drillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.amberRest,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  drillContent: {
    flex: 1,
  },
  drillName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  drillProtocol: {
    color: COLORS.neonLime,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  drillFocus: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  schemeBox: {
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  schemeText: {
    color: COLORS.cyanElectric,
    fontSize: 15,
    fontWeight: '800',
  },
  weightNote: {
    color: COLORS.neonLime,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  restNote: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  movementsList: {
    marginBottom: SPACING.xs,
  },
  coachingBox: {
    backgroundColor: COLORS.surfaceCard,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.cyanElectric,
  },
  coachingLabel: {
    color: COLORS.cyanElectric,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  coachingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  timeCapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeCapText: {
    color: COLORS.neonLime,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  timerButton: {
    marginTop: SPACING.lg,
  },
  focusText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: SPACING.md,
  },
  accessoryList: {
    gap: SPACING.sm,
  },
  accessoryItem: {
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  accessoryName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  accessoryProtocol: {
    color: COLORS.vibrantPurple,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  accessoryNotes: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
