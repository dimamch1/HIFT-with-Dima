import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { OneRepMaxes, UnitPreference } from '../../types';
import { HapticsService } from '../../services/hapticsService';
import { Dumbbell, Check } from 'lucide-react-native';

interface OneRMManagerProps {
  oneRepMaxes: OneRepMaxes;
  unitPreference: UnitPreference;
  onUpdate1RM: (exercise: keyof OneRepMaxes, weight: number) => void;
}

const LIFTS: { key: keyof OneRepMaxes; label: string; defaultVal: number }[] = [
  { key: 'snatch', label: 'Squat Snatch', defaultVal: 85 },
  { key: 'cleanAndJerk', label: 'Clean & Jerk', defaultVal: 110 },
  { key: 'backSquat', label: 'Back Squat', defaultVal: 145 },
  { key: 'frontSquat', label: 'Front Squat', defaultVal: 125 },
  { key: 'deadlift', label: 'Deadlift', defaultVal: 185 },
  { key: 'overheadSquat', label: 'Overhead Squat', defaultVal: 95 },
  { key: 'thruster', label: 'Thruster', defaultVal: 80 },
  { key: 'strictPress', label: 'Strict Press', defaultVal: 65 },
  { key: 'powerClean', label: 'Power Clean', defaultVal: 105 },
  { key: 'powerSnatch', label: 'Power Snatch', defaultVal: 80 },
];

export const OneRMManager: React.FC<OneRMManagerProps> = ({
  oneRepMaxes,
  unitPreference,
  onUpdate1RM,
}) => {
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [savedFeedbackKey, setSavedFeedbackKey] = useState<string | null>(null);

  const unit = unitPreference === 'imperial' ? 'lbs' : 'kg';

  // Sync local inputs when external 1RMs change
  useEffect(() => {
    const vals: Record<string, string> = {};
    LIFTS.forEach((lift) => {
      vals[lift.key] = (oneRepMaxes[lift.key] || lift.defaultVal).toString();
    });
    setLocalValues(vals);
  }, [oneRepMaxes]);

  const handleChangeText = (key: keyof OneRepMaxes, text: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: text }));
  };

  const handleSave = (key: keyof OneRepMaxes) => {
    const raw = localValues[key];
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0) {
      onUpdate1RM(key, num);
      HapticsService.roundIncrement();
      setSavedFeedbackKey(key);
      setTimeout(() => setSavedFeedbackKey(null), 1500);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Dumbbell size={18} color={COLORS.cyanElectric} />
        <Text style={styles.sectionTitle}>1RM Personal Records & Strength Vault</Text>
      </View>
      <Text style={styles.sectionSubtitle}>
        הקלד ישירות את המשקל בכל תרגיל לעדכון מיידי של אחוזי הכוח באימונים.
      </Text>

      {/* Direct Inline Editable 1RM Grid */}
      <View style={styles.grid}>
        {LIFTS.map((lift) => {
          const val = localValues[lift.key] !== undefined ? localValues[lift.key] : (oneRepMaxes[lift.key] || lift.defaultVal).toString();
          const isFocused = focusedKey === lift.key;
          const isJustSaved = savedFeedbackKey === lift.key;

          return (
            <View
              key={lift.key}
              style={[
                styles.card,
                isFocused && styles.cardFocused,
                isJustSaved && styles.cardSaved,
              ]}
            >
              <Text style={[styles.liftName, isFocused && styles.liftNameFocused]}>
                {lift.label}
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  value={val}
                  onChangeText={(t) => handleChangeText(lift.key, t)}
                  onFocus={() => setFocusedKey(lift.key)}
                  onBlur={() => {
                    setFocusedKey(null);
                    handleSave(lift.key);
                  }}
                  onEndEditing={() => handleSave(lift.key)}
                  onSubmitEditing={() => handleSave(lift.key)}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  style={[styles.directInput, isFocused && styles.directInputFocused]}
                  selectTextOnFocus
                />
                <Text style={styles.unitText}>{unit}</Text>

                <TouchableOpacity
                  onPress={() => handleSave(lift.key)}
                  style={[styles.saveBtn, isJustSaved && styles.saveBtnActive]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Check
                    size={15}
                    color={isJustSaved ? '#000000' : isFocused ? COLORS.neonLime : COLORS.cyanElectric}
                    strokeWidth={isJustSaved ? 3 : 2.5}
                  />
                </TouchableOpacity>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  card: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 140,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  cardFocused: {
    borderColor: COLORS.neonLime,
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
  },
  cardSaved: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  liftName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  liftNameFocused: {
    color: COLORS.neonLime,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  directInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    paddingHorizontal: 4,
    minHeight: 40,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  } as any,
  directInputFocused: {
    color: COLORS.neonLime,
  },
  unitText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginRight: 6,
  },
  saveBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnActive: {
    backgroundColor: '#22c55e',
  },
});
