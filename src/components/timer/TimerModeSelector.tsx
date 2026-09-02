import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { TimerMode } from '../../types';
import { HapticsService } from '../../services/hapticsService';

interface TimerModeSelectorProps {
  currentMode: TimerMode;
  onSelectMode: (mode: TimerMode) => void;
  disabled?: boolean;
}

interface ModeItem {
  key: TimerMode;
  label: string;
  sub: string;
}

const MODES: ModeItem[] = [
  { key: 'FOR_TIME', label: 'FOR TIME', sub: 'Stopwatch / Cap' },
  { key: 'AMRAP', label: 'AMRAP', sub: 'Countdown / Rounds' },
  { key: 'EMOM', label: 'EMOM', sub: 'Interval / Rounds' },
  { key: 'TABATA', label: 'TABATA', sub: '20s W / 10s R' },
  { key: 'CUSTOM_INTERVAL', label: 'INTERVAL', sub: 'Custom Work/Rest' },
];

export const TimerModeSelector: React.FC<TimerModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  disabled = false,
}) => {
  const handleSelect = (mode: TimerMode) => {
    if (disabled || mode === currentMode) return;
    HapticsService.countdownTick();
    onSelectMode(mode);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {MODES.map((item) => {
        const isSelected = item.key === currentMode;
        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => handleSelect(item.key)}
            disabled={disabled}
            style={[
              styles.modeTab,
              isSelected && styles.modeTabActive,
              disabled && styles.disabledTab,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeLabel,
                isSelected ? styles.modeLabelActive : styles.modeLabelInactive,
              ]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.modeSub,
                isSelected ? styles.modeSubActive : styles.modeSubInactive,
              ]}
            >
              {item.sub}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  modeTab: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    alignItems: 'center',
    minWidth: 110,
  },
  modeTabActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderColor: COLORS.neonLime,
  },
  disabledTab: {
    opacity: 0.5,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modeLabelActive: {
    color: COLORS.neonLime,
  },
  modeLabelInactive: {
    color: COLORS.textSecondary,
  },
  modeSub: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  modeSubActive: {
    color: COLORS.textPrimary,
  },
  modeSubInactive: {
    color: COLORS.textMuted,
  },
});
