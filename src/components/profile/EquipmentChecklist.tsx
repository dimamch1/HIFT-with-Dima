import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { EquipmentId, EquipmentPreset } from '../../types';
import { HapticsService } from '../../services/hapticsService';
import { Check } from 'lucide-react-native';

interface EquipmentChecklistProps {
  availableEquipment: EquipmentId[];
  selectedPreset: EquipmentPreset;
  onToggleEquipment: (id: EquipmentId) => void;
  onSelectPreset: (preset: EquipmentPreset) => void;
}

const PRESETS: { key: EquipmentPreset; label: string; desc: string }[] = [
  { key: 'full_box', label: 'Full Box', desc: 'Rig, Barbells, C2 Rower, Rings, Bikes' },
  { key: 'garage_gym', label: 'Garage Gym', desc: 'Barbell, DBs, Pull-up Bar, Bench' },
  { key: 'travel_minimal', label: 'Minimal / Travel', desc: 'DB/KB + Jump Rope + Bodyweight' },
  { key: 'custom', label: 'Custom Setup', desc: 'Individual equipment selection' },
];

const ALL_EQUIPMENT: { id: EquipmentId; label: string }[] = [
  { id: 'barbell_and_plates', label: 'Barbell & Bumper Plates' },
  { id: 'pull_up_bar', label: 'Pull-up Rig / Bar' },
  { id: 'gymnastics_rings', label: 'Gymnastics Rings' },
  { id: 'dumbbells', label: 'Dumbbells (Pairs)' },
  { id: 'kettlebells', label: 'Kettlebells' },
  { id: 'concept2_rower', label: 'Concept2 Rower' },
  { id: 'concept2_skierg', label: 'Concept2 SkiErg' },
  { id: 'concept2_bike_erg', label: 'Concept2 BikeErg' },
  { id: 'assault_echo_bike', label: 'Assault / Echo Air Bike' },
  { id: 'wall_ball', label: 'Wall Ball & Target' },
  { id: 'plyo_box', label: 'Plyo Box (20/24/30")' },
  { id: 'jump_rope', label: 'Speed Jump Rope' },
  { id: 'squat_rack', label: 'Squat Rack / Stand' },
  { id: 'bench', label: 'Flat Workout Bench' },
  { id: 'ghd', label: 'GHD Machine' },
  { id: 'climbing_rope', label: 'Climbing Rope' },
];

export const EquipmentChecklist: React.FC<EquipmentChecklistProps> = ({
  availableEquipment,
  selectedPreset,
  onToggleEquipment,
  onSelectPreset,
}) => {
  const handlePreset = (preset: EquipmentPreset) => {
    HapticsService.countdownTick();
    onSelectPreset(preset);
  };

  const handleToggle = (id: EquipmentId) => {
    HapticsService.countdownTick();
    onToggleEquipment(id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Available Equipment & Presets</Text>
      <Text style={styles.sectionSubtitle}>
        Workouts automatically adapt and substitute movements based on what you have today.
      </Text>

      {/* Preset Pills */}
      <View style={styles.presetsGrid}>
        {PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.key;
          return (
            <TouchableOpacity
              key={preset.key}
              onPress={() => handlePreset(preset.key)}
              style={[
                styles.presetCard,
                isSelected && styles.presetCardActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.presetTitle,
                  isSelected && styles.presetTitleActive,
                ]}
              >
                {preset.label}
              </Text>
              <Text style={styles.presetDesc}>{preset.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Individual Checklist */}
      <Text style={styles.subHeading}>Gear Inventory (Multi-Select):</Text>
      <View style={styles.grid}>
        {ALL_EQUIPMENT.map((item) => {
          const hasItem = availableEquipment.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleToggle(item.id)}
              style={[
                styles.itemChip,
                hasItem && styles.itemChipActive,
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  hasItem && styles.checkboxActive,
                ]}
              >
                {hasItem && <Check size={12} color="#000" strokeWidth={3} />}
              </View>
              <Text
                style={[
                  styles.itemLabel,
                  hasItem && styles.itemLabelActive,
                ]}
              >
                {item.label}
              </Text>
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
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  presetCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 140,
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  presetCardActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    borderColor: COLORS.neonLime,
  },
  presetTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  presetTitleActive: {
    color: COLORS.neonLime,
  },
  presetDesc: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  subHeading: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  grid: {
    gap: SPACING.xs,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  itemChipActive: {
    borderColor: 'rgba(0, 229, 255, 0.4)',
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  checkboxActive: {
    backgroundColor: COLORS.cyanElectric,
    borderColor: COLORS.cyanElectric,
  },
  itemLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  itemLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
});
