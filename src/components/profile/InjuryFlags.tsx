import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { InjuryFlag } from '../../types';
import { HapticsService } from '../../services/hapticsService';
import { ShieldAlert, AlertCircle } from 'lucide-react-native';

interface InjuryFlagsProps {
  injuries: InjuryFlag[];
  onToggleInjury: (injury: InjuryFlag) => void;
}

const INJURY_OPTIONS: { key: InjuryFlag; label: string; notes: string }[] = [
  {
    key: 'lower_back',
    label: 'Lower Back / Lumbar Strain',
    notes: 'Excludes heavy conventional Deadlifts; restricts axial spinal compression',
  },
  {
    key: 'shoulder_impingement',
    label: 'Shoulder Impingement / Rotator Cuff',
    notes: 'Excludes full Snatches, Kipping HSPU, Ring Muscle-ups',
  },
  {
    key: 'wrist_mobility',
    label: 'Wrist Pain / Front Rack Mobility',
    notes: 'Substitutes Clean & Jerk and Thrusters with neutral DB grips',
  },
  {
    key: 'knee_patellar',
    label: 'Knee / Patellar Tendonitis',
    notes: 'Substitutes high knee flexion with Box Squats, RDLs, and Bike',
  },
  {
    key: 'ankle_restrictions',
    label: 'Ankle Dorsiflexion Restrictions',
    notes: 'Elevates heels or substitutes full deep squat snatches with power variants',
  },
  {
    key: 'elbow_tendonitis',
    label: 'Elbow / Bicep Tendonitis',
    notes: 'Modifies high-volume kipping pull-ups and muscle-up transitions',
  },
];

export const InjuryFlags: React.FC<InjuryFlagsProps> = ({
  injuries,
  onToggleInjury,
}) => {
  const handleToggle = (key: InjuryFlag) => {
    HapticsService.countdownTick();
    onToggleInjury(key);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ShieldAlert size={18} color={COLORS.crimsonRed} />
        <Text style={styles.sectionTitle}>Joint & Injury Exclusion Flags</Text>
      </View>
      <Text style={styles.sectionSubtitle}>
        Flag active discomforts to automatically adapt movement planes and protect vulnerable joints.
      </Text>

      <View style={styles.list}>
        {INJURY_OPTIONS.map((item) => {
          const isActive = injuries.includes(item.key);

          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => handleToggle(item.key)}
              style={[
                styles.itemCard,
                isActive && styles.itemCardActive,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.contentRow}>
                <View style={styles.info}>
                  <Text style={[styles.label, isActive && styles.labelActive]}>
                    {item.label}
                  </Text>
                  <Text style={styles.notes}>{item.notes}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    isActive ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isActive && styles.statusTextActive,
                    ]}
                  >
                    {isActive ? 'EXCLUDED' : 'SAFE'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 6,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  list: {
    gap: SPACING.sm,
  },
  itemCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  itemCardActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: COLORS.crimsonRed,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  labelActive: {
    color: COLORS.crimsonRed,
  },
  notes: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  statusInactive: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  statusActive: {
    backgroundColor: COLORS.crimsonRed,
  },
  statusText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextActive: {
    color: '#FFFFFF',
  },
});
