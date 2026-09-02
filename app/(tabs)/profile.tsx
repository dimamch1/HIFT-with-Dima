import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/useUserStore';
import { useWorkoutStore } from '../../src/store/useWorkoutStore';
import { DivisionTier, Gender, SkillLevel } from '../../src/types';
import { SkillProficiency } from '../../src/components/profile/SkillProficiency';
import { EquipmentChecklist } from '../../src/components/profile/EquipmentChecklist';
import { InjuryFlags } from '../../src/components/profile/InjuryFlags';
import { OneRMManager } from '../../src/components/profile/OneRMManager';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { User, Shield, Award, Sliders, Check, Edit3, X, Ruler, Scale } from 'lucide-react-native';
import { HapticsService } from '../../src/services/hapticsService';

const DIVISIONS: { key: DivisionTier; label: string; desc: string }[] = [
  {
    key: 'FOUNDATION',
    label: 'Foundation / Scaled',
    desc: 'Banded/jumping pull-ups, knee raises, single unders, DB substitutions',
  },
  {
    key: 'INTERMEDIATE',
    label: 'Intermediate',
    desc: 'Moderate barbell cycling, chin-over-bar pull-ups, knee-to-elbows',
  },
  {
    key: 'RX',
    label: 'Rx / Advanced',
    desc: 'Competition loads, chest-to-bar, double unders, standard gymnastics',
  },
  {
    key: 'COMPETITOR',
    label: 'Competitor / Elite',
    desc: 'Heavy loads under fatigue, strict gymnastics, ring muscle-ups',
  },
];

export default function ProfileScreen() {
  const {
    profile,
    updateProfile,
    update1RM,
    updateSkill,
    toggleEquipment,
    setEquipmentPreset,
    toggleInjury,
  } = useUserStore();

  const { generateDailyWOD } = useWorkoutStore();

  // Biometrics Edit Modal State
  const [showEditBiometricsModal, setShowEditBiometricsModal] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editAge, setEditAge] = useState(profile.age.toString());
  const [editWeight, setEditWeight] = useState(profile.weightKg.toString());
  const [editHeight, setEditHeight] = useState(profile.heightCm.toString());
  const [editGender, setEditGender] = useState<Gender>(profile.gender);

  const handleOpenEditBiometrics = () => {
    HapticsService.countdownTick();
    setEditName(profile.name);
    setEditAge(profile.age.toString());
    setEditWeight(profile.weightKg.toString());
    setEditHeight(profile.heightCm.toString());
    setEditGender(profile.gender);
    setShowEditBiometricsModal(true);
  };

  const handleSaveBiometrics = () => {
    const ageNum = parseInt(editAge, 10) || profile.age;
    const weightNum = parseFloat(editWeight) || profile.weightKg;
    const heightNum = parseInt(editHeight, 10) || profile.heightCm;

    updateProfile({
      name: editName.trim() || profile.name,
      age: ageNum,
      weightKg: weightNum,
      heightCm: heightNum,
      gender: editGender,
    });

    HapticsService.roundIncrement();
    setShowEditBiometricsModal(false);
    generateDailyWOD(profile, true);
  };

  const handleSelectDivision = (div: DivisionTier) => {
    HapticsService.roundIncrement();
    updateProfile({ division: div });
    generateDailyWOD(profile, true);
  };

  const handleToggleUnit = () => {
    HapticsService.countdownTick();
    const nextUnit = profile.unitPreference === 'metric' ? 'imperial' : 'metric';
    updateProfile({ unitPreference: nextUnit });
  };

  const weightDisplay =
    profile.unitPreference === 'imperial'
      ? `${Math.round(profile.weightKg * 2.20462)} lbs`
      : `${profile.weightKg} kg`;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarSide} />
        <View style={styles.brandTitleCol}>
          <Text style={styles.brandTitle}>HIFT with Dima</Text>
          <Text style={styles.subtitle}>Athlete Hub • Personalization & Strength Vault</Text>
        </View>
        <View style={[styles.topBarSide, { alignItems: 'flex-end' }]}>
          <User size={24} color={COLORS.neonLime} />
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* 👤 Athlete Overview & Biometrics Card */}
        <TouchableOpacity
          onPress={handleOpenEditBiometrics}
          style={styles.athleteCard}
          activeOpacity={0.85}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.athleteInfo}>
            <View style={styles.athleteNameRow}>
              <Text style={styles.athleteName}>{profile.name}</Text>
              <View style={styles.editPill}>
                <Edit3 size={12} color={COLORS.cyanElectric} />
                <Text style={styles.editPillText}>Edit Stats</Text>
              </View>
            </View>

            {/* Height & Weight Parameters */}
            <Text style={styles.athleteBio}>
              {profile.age} yrs • <Text style={styles.highlightBio}>{weightDisplay}</Text> • <Text style={styles.highlightBio}>{profile.heightCm} cm</Text>
            </Text>

            <View style={styles.tierBadgeRow}>
              <Badge label={profile.division} variant="neon" size="sm" />
              <Badge
                label={profile.equipmentPreset.replace('_', ' ').toUpperCase()}
                variant="cyan"
                size="sm"
              />
            </View>
          </View>

          {/* Unit Toggle */}
          <TouchableOpacity
            onPress={handleToggleUnit}
            style={styles.unitToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.unitToggleText}>
              {profile.unitPreference === 'metric' ? 'KG' : 'LBS'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Division Tier Selection */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Award size={18} color={COLORS.neonLime} />
            <Text style={styles.sectionTitle}>Competition Division & Scaling Tier</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Sets baseline barbell cycling weights and gymnastics volume in daily sessions.
          </Text>

          <View style={styles.divisionList}>
            {DIVISIONS.map((div) => {
              const isSelected = profile.division === div.key;
              return (
                <TouchableOpacity
                  key={div.key}
                  onPress={() => handleSelectDivision(div.key)}
                  style={[
                    styles.divisionCard,
                    isSelected && styles.divisionCardActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.divisionTop}>
                    <Text
                      style={[
                        styles.divisionLabel,
                        isSelected && styles.divisionLabelActive,
                      ]}
                    >
                      {div.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedIcon}>
                        <Check size={14} color="#000" strokeWidth={3} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.divisionDesc}>{div.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 1RM Strength Vault */}
        <OneRMManager
          oneRepMaxes={profile.oneRepMaxes}
          unitPreference={profile.unitPreference}
          onUpdate1RM={update1RM}
        />

        {/* Gymnastics Skill Matrix with Explanatory Legend */}
        <SkillProficiency
          skills={profile.skills}
          onUpdateSkill={updateSkill}
        />

        {/* Available Equipment & Presets */}
        <EquipmentChecklist
          availableEquipment={profile.availableEquipment}
          selectedPreset={profile.equipmentPreset}
          onToggleEquipment={toggleEquipment}
          onSelectPreset={setEquipmentPreset}
        />

        {/* Injury Exclusion Flags */}
        <InjuryFlags
          injuries={profile.injuries}
          onToggleInjury={toggleInjury}
        />
      </ScrollView>

      {/* ✏️ Edit Athlete Biometrics Modal with Keyboard Avoiding View */}
      <Modal visible={showEditBiometricsModal} transparent animationType="slide" onRequestClose={() => setShowEditBiometricsModal(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidContainer}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
              <View style={styles.editModal}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Edit Athlete Biometrics</Text>
                    <Text style={styles.modalSubtitle}>Update height, weight, age & profile</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      HapticsService.countdownTick();
                      setShowEditBiometricsModal(false);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                >
                  {/* Name */}
                  <Text style={styles.modalInputLabel}>Athlete Name:</Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="e.g. Dima Michaelov"
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.modalInput}
                    returnKeyType="done"
                    selectTextOnFocus
                  />

                  {/* Gender Toggle */}
                  <Text style={styles.modalInputLabel}>Biological Sex (for Rx Loading):</Text>
                  <View style={styles.genderRow}>
                    {(['male', 'female'] as Gender[]).map((g) => (
                      <TouchableOpacity
                        key={g}
                        onPress={() => {
                          HapticsService.countdownTick();
                          setEditGender(g);
                        }}
                        style={[
                          styles.genderChip,
                          editGender === g && styles.genderChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.genderChipText,
                            editGender === g && styles.genderChipTextActive,
                          ]}
                        >
                          {g === 'male' ? 'Male (Rx Men)' : 'Female (Rx Women)'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Age, Weight & Height Inputs Row */}
                  <View style={styles.biometricsInputRow}>
                    {/* Age */}
                    <View style={styles.biometricField}>
                      <Text style={styles.modalInputLabel}>Age (Yrs):</Text>
                      <TextInput
                        value={editAge}
                        onChangeText={setEditAge}
                        keyboardType="numeric"
                        placeholder="28"
                        placeholderTextColor={COLORS.textMuted}
                        style={styles.modalInput}
                        returnKeyType="done"
                        selectTextOnFocus
                      />
                    </View>

                    {/* Weight */}
                    <View style={styles.biometricField}>
                      <Text style={styles.modalInputLabel}>Weight (kg):</Text>
                      <TextInput
                        value={editWeight}
                        onChangeText={setEditWeight}
                        keyboardType="decimal-pad"
                        placeholder="82"
                        placeholderTextColor={COLORS.textMuted}
                        style={styles.modalInput}
                        returnKeyType="done"
                        selectTextOnFocus
                      />
                    </View>

                    {/* Height */}
                    <View style={styles.biometricField}>
                      <Text style={styles.modalInputLabel}>Height (cm):</Text>
                      <TextInput
                        value={editHeight}
                        onChangeText={setEditHeight}
                        keyboardType="numeric"
                        placeholder="180"
                        placeholderTextColor={COLORS.textMuted}
                        style={styles.modalInput}
                        returnKeyType="done"
                        selectTextOnFocus
                      />
                    </View>
                  </View>

                  <Button
                    title="Save Athlete Biometrics"
                    variant="primary"
                    size="lg"
                    onPress={handleSaveBiometrics}
                    style={styles.saveModalBtn}
                  />
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  topBarSide: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  brandTitleCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl * 2,
  },
  athleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.neonLime,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: '#000000',
    fontSize: 24,
    fontWeight: '900',
  },
  athleteInfo: {
    flex: 1,
  },
  athleteNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  athleteName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    gap: 3,
  },
  editPillText: {
    color: COLORS.cyanElectric,
    fontSize: 10,
    fontWeight: '800',
  },
  athleteBio: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  highlightBio: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  tierBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  unitToggle: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unitToggleText: {
    color: COLORS.neonLime,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  sectionHeader: {
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
  divisionList: {
    gap: SPACING.sm,
  },
  divisionCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  divisionCardActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    borderColor: COLORS.neonLime,
  },
  divisionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divisionLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  divisionLabelActive: {
    color: COLORS.neonLime,
  },
  selectedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.neonLime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divisionDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  editModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: COLORS.cyanElectric,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  modalInputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 2,
    marginBottom: SPACING.xs,
  },
  genderChip: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  genderChipActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: COLORS.cyanElectric,
  },
  genderChipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  genderChipTextActive: {
    color: COLORS.cyanElectric,
    fontWeight: '800',
  },
  biometricsInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  biometricField: {
    flex: 1,
  },
  saveModalBtn: {
    marginTop: SPACING.xl,
  },
});
