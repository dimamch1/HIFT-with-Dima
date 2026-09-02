import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Target, Zap, Clock, ShieldAlert } from 'lucide-react-native';

interface PacingGuideProps {
  intendedStimulus: string;
  pacingStrategy: string;
  targetScoreRx: string;
  targetScoreScaled: string;
}

export const PacingGuide: React.FC<PacingGuideProps> = ({
  intendedStimulus,
  pacingStrategy,
  targetScoreRx,
  targetScoreScaled,
}) => {
  return (
    <View style={styles.container}>
      {/* Intended Stimulus */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Zap size={16} color={COLORS.safetyOrange} />
          <Text style={styles.sectionTitle}>Intended Stimulus</Text>
        </View>
        <Text style={styles.text}>{intendedStimulus}</Text>
      </View>

      {/* Pacing Strategy */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Target size={16} color={COLORS.neonLime} />
          <Text style={styles.sectionTitle}>Tactical Pacing & Set Breakdown</Text>
        </View>
        <Text style={styles.text}>{pacingStrategy}</Text>
      </View>

      {/* Target Scores */}
      <View style={styles.targetRow}>
        <View style={styles.targetBox}>
          <View style={styles.targetHeader}>
            <Clock size={14} color={COLORS.neonLime} />
            <Text style={styles.targetLabel}>Rx Target</Text>
          </View>
          <Text style={styles.targetValue}>{targetScoreRx}</Text>
        </View>

        <View style={styles.targetBox}>
          <View style={styles.targetHeader}>
            <Clock size={14} color={COLORS.cyanElectric} />
            <Text style={styles.targetLabel}>Scaled Target</Text>
          </View>
          <Text style={styles.targetValue}>{targetScoreScaled}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  section: {
    marginBottom: SPACING.sm + 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  targetRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  targetBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  targetLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  targetValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
