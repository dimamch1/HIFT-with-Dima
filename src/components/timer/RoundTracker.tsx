import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { ActiveTimerState } from '../../types';
import { Plus, Check, Flag } from 'lucide-react-native';

interface RoundTrackerProps {
  state: ActiveTimerState;
  onIncrementRound: () => void;
  onIncrementRep: () => void;
}

export const RoundTracker: React.FC<RoundTrackerProps> = ({
  state,
  onIncrementRound,
  onIncrementRep,
}) => {
  const { config, amrapRounds, amrapReps, splits, status } = state;

  const formatSec = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (config.mode === 'AMRAP') {
    return (
      <View style={styles.container}>
        <View style={styles.amrapHeader}>
          <Text style={styles.sectionTitle}>Live Score Tracking</Text>
          <Text style={styles.amrapTotal}>
            {amrapRounds} Rounds + {amrapReps} Reps
          </Text>
        </View>

        {/* Giant Tap Target for +1 Round */}
        <TouchableOpacity
          onPress={onIncrementRound}
          disabled={status !== 'RUNNING'}
          style={[styles.giantTapZone, status !== 'RUNNING' && styles.disabledZone]}
          activeOpacity={0.7}
        >
          <Plus size={36} color="#000000" />
          <Text style={styles.giantTapText}>+1 COMPLETED ROUND</Text>
          <Text style={styles.giantTapSub}>Tap anywhere on this card</Text>
        </TouchableOpacity>

        {/* +1 Rep Button */}
        <TouchableOpacity
          onPress={onIncrementRep}
          disabled={status !== 'RUNNING'}
          style={[styles.repButton, status !== 'RUNNING' && styles.disabledZone]}
          activeOpacity={0.7}
        >
          <Plus size={18} color={COLORS.neonLime} />
          <Text style={styles.repButtonText}>+1 Partial Rep ({amrapReps})</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (config.mode === 'FOR_TIME' && splits.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.splitsHeader}>
          <Flag size={16} color={COLORS.cyanElectric} />
          <Text style={styles.sectionTitle}>Split Lap History ({splits.length})</Text>
        </View>

        <ScrollView style={styles.splitsList} nestedScrollEnabled>
          {splits.map((split) => (
            <View key={split.roundNumber} style={styles.splitRow}>
              <Text style={styles.splitRound}>Round {split.roundNumber}</Text>
              <Text style={styles.splitLap}>Lap: +{formatSec(split.splitDurationSeconds)}</Text>
              <Text style={styles.splitTotal}>{formatSec(split.timestampSeconds)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  amrapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  amrapTotal: {
    color: COLORS.neonLime,
    fontSize: 16,
    fontWeight: '900',
  },
  giantTapZone: {
    backgroundColor: COLORS.neonLime,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledZone: {
    opacity: 0.4,
  },
  giantTapText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  giantTapSub: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  repButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  repButtonText: {
    color: COLORS.neonLime,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 6,
  },
  splitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  splitsList: {
    maxHeight: 160,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  splitRound: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  splitLap: {
    color: COLORS.cyanElectric,
    fontSize: 13,
    fontWeight: '600',
  },
  splitTotal: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
