import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { GymnasticsSkills, SkillLevel } from '../../types';
import { HapticsService } from '../../services/hapticsService';
import { Info } from 'lucide-react-native';

interface SkillProficiencyProps {
  skills: GymnasticsSkills;
  onUpdateSkill: (skillKey: keyof GymnasticsSkills, level: SkillLevel) => void;
}

const SKILL_LABELS: { key: keyof GymnasticsSkills; label: string }[] = [
  { key: 'pullUps', label: 'Pull-ups (Kipping / Butterfly)' },
  { key: 'chestToBar', label: 'Chest-to-Bar Pull-ups' },
  { key: 'barMuscleUps', label: 'Bar Muscle-ups' },
  { key: 'ringMuscleUps', label: 'Ring Muscle-ups' },
  { key: 'handstandPushUpsStrict', label: 'Strict Handstand Push-ups' },
  { key: 'handstandPushUpsKipping', label: 'Kipping Handstand Push-ups' },
  { key: 'handstandWalk', label: 'Handstand Walk (HSW)' },
  { key: 'toesToBar', label: 'Toes-to-Bar (T2B)' },
  { key: 'doubleUnders', label: 'Double Unders (DU)' },
  { key: 'ropeClimbs', label: 'Rope Climbs (Legless/Wrap)' },
  { key: 'pistolSquats', label: 'Pistol Squats (Single Leg)' },
];

const LEVELS: { key: SkillLevel; label: string; color: string }[] = [
  { key: 'none', label: 'None', color: COLORS.textMuted },
  { key: 'developing', label: 'Dev', color: COLORS.amberRest },
  { key: 'proficient', label: 'Prof', color: COLORS.cyanElectric },
  { key: 'mastered', label: 'Rx+', color: COLORS.neonLime },
];

export const SkillProficiency: React.FC<SkillProficiencyProps> = ({
  skills,
  onUpdateSkill,
}) => {
  const handleSelectLevel = (skillKey: keyof GymnasticsSkills, level: SkillLevel) => {
    HapticsService.countdownTick();
    onUpdateSkill(skillKey, level);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Gymnastics & Skill Mastery Matrix</Text>
      <Text style={styles.sectionSubtitle}>
        The WOD generation engine uses this matrix to scale progressions and volume.
      </Text>

      {/* 📖 מדריך רמות שליטה ומיומנות מיושר לימין (RTL) */}
      <View style={styles.legendContainer}>
        <View style={styles.legendHeaderRow}>
          <Text style={styles.legendHeader}>הסבר רמות השליטה במיומנויות:</Text>
          <Info size={16} color={COLORS.cyanElectric} />
        </View>

        <View style={styles.legendList}>
          {/* None */}
          <View style={styles.legendItem}>
            <View style={[styles.legendPill, { backgroundColor: COLORS.surfaceElevated, borderColor: COLORS.border }]}>
              <Text style={[styles.legendPillText, { color: COLORS.textMuted }]}>NONE</Text>
            </View>
            <Text style={styles.legendDesc}>
              <Text style={styles.boldWhite}>None: </Text>
              ללא ניסיון / אפס חזרות ללא סיוע
            </Text>
          </View>

          {/* Dev */}
          <View style={styles.legendItem}>
            <View style={[styles.legendPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: COLORS.amberRest }]}>
              <Text style={[styles.legendPillText, { color: COLORS.amberRest }]}>DEV</Text>
            </View>
            <Text style={styles.legendDesc}>
              <Text style={[styles.boldWhite, { color: COLORS.amberRest }]}>Developing: </Text>
              תרגול בסיס, עבודה עם גומייה, קפיצה או תרגילי עזר
            </Text>
          </View>

          {/* Prof */}
          <View style={styles.legendItem}>
            <View style={[styles.legendPill, { backgroundColor: 'rgba(0, 229, 255, 0.15)', borderColor: COLORS.cyanElectric }]}>
              <Text style={[styles.legendPillText, { color: COLORS.cyanElectric }]}>PROF</Text>
            </View>
            <Text style={styles.legendDesc}>
              <Text style={[styles.boldWhite, { color: COLORS.cyanElectric }]}>Proficient: </Text>
              ביצוע חזרות נקיות ועצמאיות ברצף במהלך אימונים
            </Text>
          </View>

          {/* Rx+ */}
          <View style={styles.legendItem}>
            <View style={[styles.legendPill, { backgroundColor: 'rgba(204, 255, 0, 0.15)', borderColor: COLORS.neonLime }]}>
              <Text style={[styles.legendPillText, { color: COLORS.neonLime }]}>RX+</Text>
            </View>
            <Text style={styles.legendDesc}>
              <Text style={[styles.boldWhite, { color: COLORS.neonLime }]}>Mastered / Rx: </Text>
              שליטה מלאה בנפח גבוה תחת עייפות ברמת תחרות
            </Text>
          </View>
        </View>
      </View>

      {/* Movement List */}
      <View style={styles.list}>
        {SKILL_LABELS.map((item) => {
          const currentLevel = skills[item.key] || 'none';

          return (
            <View key={item.key} style={styles.skillRow}>
              <Text style={styles.skillName}>{item.label}</Text>
              <View style={styles.levelButtonsGroup}>
                {LEVELS.map((lvl) => {
                  const isSelected = currentLevel === lvl.key;
                  return (
                    <TouchableOpacity
                      key={lvl.key}
                      onPress={() => handleSelectLevel(item.key, lvl.key)}
                      style={[
                        styles.levelBtn,
                        isSelected && {
                          backgroundColor: lvl.color,
                          borderColor: lvl.color,
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.levelBtnText,
                          isSelected && { color: '#000000', fontWeight: '900' },
                        ]}
                      >
                        {lvl.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
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
    marginBottom: SPACING.sm,
  },
  legendContainer: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRightWidth: 3,
    borderRightColor: COLORS.cyanElectric,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  legendHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: SPACING.sm,
    gap: 6,
  },
  legendHeader: {
    color: COLORS.cyanElectric,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  legendList: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
  },
  legendPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  legendDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
    lineHeight: 17,
  },
  boldWhite: {
    fontWeight: '800',
  },
  list: {
    gap: SPACING.sm,
  },
  skillRow: {
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  skillName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  levelButtonsGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  levelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
});
