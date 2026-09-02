import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { PrescribedMovement } from '../../types';
import { RefreshCw, PlayCircle, Video } from 'lucide-react-native';
import { HapticsService } from '../../services/hapticsService';

interface MovementRowProps {
  movement: PrescribedMovement;
  index: number;
  onOpenSubstitution?: (movement: PrescribedMovement) => void;
  onOpenVideoDemo?: (movement: PrescribedMovement) => void;
  showSubButton?: boolean;
}

export const MovementRow: React.FC<MovementRowProps> = ({
  movement,
  index,
  onOpenSubstitution,
  onOpenVideoDemo,
  showSubButton = true,
}) => {
  const hasSubstitutions =
    movement.substitutionsAvailable && movement.substitutionsAvailable.length > 0;

  let prescriptionText = '';
  if (movement.calories) {
    prescriptionText = `${movement.calories} Calories`;
  } else if (movement.distanceMeters) {
    prescriptionText = `${movement.distanceMeters}m`;
  } else if (movement.reps) {
    prescriptionText = `${movement.reps} Reps`;
  }

  const loadText = movement.scaledDescription || movement.rxDescription || movement.customNotes;

  return (
    <View style={styles.container}>
      <View style={styles.indexCircle}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{movement.name}</Text>
        <View style={styles.detailsRow}>
          {prescriptionText ? (
            <Text style={styles.prescription}>{prescriptionText}</Text>
          ) : null}
          {loadText ? (
            <Text style={styles.load}> • {loadText}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsGroup}>
        {/* 🎥 Video Demo Button */}
        {onOpenVideoDemo && (
          <TouchableOpacity
            onPress={() => {
              HapticsService.countdownTick();
              onOpenVideoDemo(movement);
            }}
            style={styles.videoButton}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Video size={14} color={COLORS.neonLime} />
            <Text style={styles.videoText}>Demo</Text>
          </TouchableOpacity>
        )}

        {/* 🔄 Substitution Button */}
        {showSubButton && hasSubstitutions && onOpenSubstitution && (
          <TouchableOpacity
            onPress={() => {
              HapticsService.countdownTick();
              onOpenSubstitution(movement);
            }}
            style={styles.subButton}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <RefreshCw size={12} color={COLORS.cyanElectric} />
            <Text style={styles.subText}>Sub</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  indexCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  indexText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  prescription: {
    color: COLORS.neonLime,
    fontSize: 12,
    fontWeight: '800',
  },
  load: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 6,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  videoText: {
    color: COLORS.neonLime,
    fontSize: 11,
    fontWeight: '800',
  },
  subButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subText: {
    color: COLORS.cyanElectric,
    fontSize: 11,
    fontWeight: '700',
  },
});
