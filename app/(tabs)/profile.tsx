import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/useUserStore';
import { useWorkoutStore } from '../../src/store/useWorkoutStore';
import { DivisionTier, Gender, SkillLevel, UserProfile } from '../../src/types';
import { SkillProficiency } from '../../src/components/profile/SkillProficiency';
import { EquipmentChecklist } from '../../src/components/profile/EquipmentChecklist';
import { InjuryFlags } from '../../src/components/profile/InjuryFlags';
import { OneRMManager } from '../../src/components/profile/OneRMManager';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import {
  User,
  Users,
  Award,
  Check,
  Edit3,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Menu,
  ChevronRight,
} from 'lucide-react-native';
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
    profiles,
    activeProfileId,
    profile,
    switchProfile,
    createProfile,
    deleteProfile,
    updateProfile,
    update1RM,
    updateSkill,
    toggleEquipment,
    setEquipmentPreset,
    toggleInjury,
  } = useUserStore();

  const { generateDailyWOD } = useWorkoutStore();

  // Athlete Hamburger Menu Modal State
  const [showAthleteMenuModal, setShowAthleteMenuModal] = useState(false);

  // Save Toast Feedback State
  const [saveToastVisible, setSaveToastVisible] = useState(false);

  // Biometrics Edit Modal State
  const [showEditBiometricsModal, setShowEditBiometricsModal] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editAge, setEditAge] = useState(profile.age.toString());
  const [editWeight, setEditWeight] = useState(profile.weightKg.toString());
  const [editHeight, setEditHeight] = useState(profile.heightCm.toString());
  const [editGender, setEditGender] = useState<Gender>(profile.gender);

  // New Athlete Modal State
  const [showNewAthleteModal, setShowNewAthleteModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDivision, setNewDivision] = useState<DivisionTier>('RX');
  const [newGender, setNewGender] = useState<Gender>('male');
  const [newAge, setNewAge] = useState('28');
  const [newWeight, setNewWeight] = useState('80');
  const [newHeight, setNewHeight] = useState('178');

  const triggerSaveFeedback = () => {
    HapticsService.roundIncrement();
    setSaveToastVisible(true);
    setTimeout(() => setSaveToastVisible(false), 2500);
  };

  const handleOpenEditBiometrics = () => {
    HapticsService.countdownTick();
    setEditName(profile.name);
    setEditAge(profile.age.toString());
    setEditWeight(profile.weightKg.toString());
    setEditHeight(profile.heightCm.toString());
    setEditGender(profile.gender);
    setShowEditBiometricsModal(true);
  };

  const handleSaveBiometrics = async () => {
    const ageNum = parseInt(editAge, 10) || profile.age;
    const weightNum = parseFloat(editWeight) || profile.weightKg;
    const heightNum = parseInt(editHeight, 10) || profile.heightCm;

    await updateProfile({
      name: editName.trim() || profile.name,
      age: ageNum,
      weightKg: weightNum,
      heightCm: heightNum,
      gender: editGender,
    });

    setShowEditBiometricsModal(false);
    triggerSaveFeedback();
  };

  const handleCreateNewAthlete = async () => {
    if (!newName.trim()) return;

    const ageNum = parseInt(newAge, 10) || 28;
    const weightNum = parseFloat(newWeight) || 80;
    const heightNum = parseInt(newHeight, 10) || 178;

    await createProfile(newName.trim(), {
      division: newDivision,
      gender: newGender,
      age: ageNum,
      weightKg: weightNum,
      heightCm: heightNum,
    });

    setShowNewAthleteModal(false);
    setShowAthleteMenuModal(false);
    setNewName('');
    triggerSaveFeedback();
  };

  const handleDeleteAthlete = (targetProfile: UserProfile) => {
    if (profiles.length <= 1) {
      Alert.alert('Cannot Delete', 'You must have at least one active athlete profile.');
      return;
    }

    Alert.alert(
      'Delete Athlete Profile',
      `Are you sure you want to delete "${targetProfile.name}"? All custom 1RMs and skills for this athlete will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            HapticsService.workoutComplete();
            await deleteProfile(targetProfile.id);
            triggerSaveFeedback();
          },
        },
      ]
    );
  };

  const handleSelectDivision = async (div: DivisionTier) => {
    HapticsService.roundIncrement();
    await updateProfile({ division: div });
    triggerSaveFeedback();
  };

  const handleToggleUnit = async () => {
    HapticsService.countdownTick();
    const nextUnit = profile.unitPreference === 'metric' ? 'imperial' : 'metric';
    await updateProfile({ unitPreference: nextUnit });
    triggerSaveFeedback();
  };

  const weightDisplay =
    profile.unitPreference === 'imperial'
      ? `${Math.round(profile.weightKg * 2.20462)} lbs`
      : `${profile.weightKg} kg`;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header with Hamburger Athlete Selector */}
      <View style={styles.topBar}>
        {/* Left: Active Athlete Indicator */}
        <View style={styles.topBarSide}>
          <View style={styles.athleteBadgeHeader}>
            <Text style={styles.athleteBadgeHeaderText}>{profile.name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        {/* Center: Brand Title */}
        <View style={styles.brandTitleCol}>
          <Text style={styles.brandTitle}>HIFT with Dima</Text>
          <Text style={styles.subtitle}>Athlete Hub • {profile.name}</Text>
        </View>

        {/* Right: Hamburger Menu Button */}
        <TouchableOpacity
          onPress={() => {
            HapticsService.countdownTick();
            setShowAthleteMenuModal(true);
          }}
          style={styles.hamburgerButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Open Athlete Switcher Menu"
        >
          <Menu size={22} color={COLORS.neonLime} />
          {profiles.length > 1 && (
            <View style={styles.profilesCountBadge}>
              <Text style={styles.profilesCountText}>{profiles.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Save Confirmation Toast Banner */}
      {saveToastVisible && (
        <View style={styles.toastBanner}>
          <CheckCircle2 size={16} color="#000000" />
          <Text style={styles.toastBannerText}>
            Profile saved for {profile.name} • Daily WOD synced!
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* 👤 Current Active Athlete Overview & Biometrics Card */}
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
              <Text style={styles.athleteName} numberOfLines={1}>{profile.name}</Text>
              <View style={styles.editPill}>
                <Edit3 size={12} color={COLORS.cyanElectric} />
                <Text style={styles.editPillText}>Edit Stats</Text>
              </View>
            </View>

            {/* Height, Weight & Age Parameters */}
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

        {/* Quick Switch Athletes Button */}
        <TouchableOpacity
          onPress={() => {
            HapticsService.countdownTick();
            setShowAthleteMenuModal(true);
          }}
          style={styles.quickSwitchBar}
          activeOpacity={0.8}
        >
          <View style={styles.quickSwitchLeft}>
            <Users size={16} color={COLORS.cyanElectric} />
            <Text style={styles.quickSwitchTitle}>
              Switch Athlete ({profiles.length} available)
            </Text>
          </View>
          <View style={styles.quickSwitchRight}>
            <Text style={styles.quickSwitchActiveName}>{profile.name}</Text>
            <ChevronRight size={16} color={COLORS.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Division Tier Selection */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Award size={18} color={COLORS.neonLime} />
            <Text style={styles.sectionTitle}>Competition Division & Scaling Tier</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Sets baseline barbell cycling weights and gymnastics volume in daily sessions for {profile.name}.
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
          onUpdate1RM={async (exercise, weight) => {
            await update1RM(exercise, weight);
            triggerSaveFeedback();
          }}
        />

        {/* Gymnastics Skill Matrix with Explanatory Legend */}
        <SkillProficiency
          skills={profile.skills}
          onUpdateSkill={async (skill, level) => {
            await updateSkill(skill, level);
            triggerSaveFeedback();
          }}
        />

        {/* Available Equipment & Presets */}
        <EquipmentChecklist
          availableEquipment={profile.availableEquipment}
          selectedPreset={profile.equipmentPreset}
          onToggleEquipment={async (id) => {
            await toggleEquipment(id);
            triggerSaveFeedback();
          }}
          onSelectPreset={async (preset) => {
            await setEquipmentPreset(preset);
            triggerSaveFeedback();
          }}
        />

        {/* Injury Exclusion Flags */}
        <InjuryFlags
          injuries={profile.injuries}
          onToggleInjury={async (injury) => {
            await toggleInjury(injury);
            triggerSaveFeedback();
          }}
        />
      </ScrollView>

      {/* 🍔 Hamburger Athlete Selector Modal / Drawer */}
      <Modal
        visible={showAthleteMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAthleteMenuModal(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowAthleteMenuModal(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <View style={styles.drawerContainer}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderLeft}>
                <Menu size={20} color={COLORS.neonLime} />
                <Text style={styles.drawerTitle}>Athlete Profiles</Text>
                <View style={styles.drawerBadge}>
                  <Text style={styles.drawerBadgeText}>{profiles.length}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowAthleteMenuModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeDrawerBtn}
              >
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.drawerSubtitle}>
              Select an athlete to instantly switch 1RMs, skills & customized Daily WOD:
            </Text>

            {/* Profiles List */}
            <ScrollView
              style={styles.drawerList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
            >
              {profiles.map((p) => {
                const isActive = p.id === activeProfileId;

                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {
                      if (!isActive) {
                        HapticsService.roundIncrement();
                        switchProfile(p.id);
                        setShowAthleteMenuModal(false);
                        triggerSaveFeedback();
                      } else {
                        setShowAthleteMenuModal(false);
                      }
                    }}
                    style={[
                      styles.drawerProfileItem,
                      isActive && styles.drawerProfileItemActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    {/* Avatar */}
                    <View
                      style={[
                        styles.drawerAvatar,
                        isActive && styles.drawerAvatarActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.drawerAvatarText,
                          isActive && styles.drawerAvatarTextActive,
                        ]}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    {/* Info */}
                    <View style={styles.drawerProfileInfo}>
                      <View style={styles.drawerNameRow}>
                        <Text
                          style={[
                            styles.drawerProfileName,
                            isActive && styles.drawerProfileNameActive,
                          ]}
                          numberOfLines={1}
                        >
                          {p.name}
                        </Text>
                        {isActive && (
                          <View style={styles.activeTag}>
                            <Text style={styles.activeTagText}>ACTIVE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.drawerProfileMeta}>
                        {p.division} • {p.weightKg}kg • {p.heightCm}cm • {p.gender === 'female' ? 'Rx Women' : 'Rx Men'}
                      </Text>
                    </View>

                    {/* Action icon */}
                    {isActive ? (
                      <View style={styles.drawerActiveIcon}>
                        <Check size={16} color="#000" strokeWidth={3} />
                      </View>
                    ) : (
                      profiles.length > 1 && (
                        <TouchableOpacity
                          onPress={() => handleDeleteAthlete(p)}
                          style={styles.drawerDeleteBtn}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Trash2 size={16} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      )
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Add Athlete Button */}
            <TouchableOpacity
              onPress={() => {
                HapticsService.countdownTick();
                setShowAthleteMenuModal(false);
                setShowNewAthleteModal(true);
              }}
              style={styles.drawerAddBtn}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#000" />
              <Text style={styles.drawerAddBtnText}>Add New Athlete Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ➕ Create New Athlete Profile Modal */}
      <Modal
        visible={showNewAthleteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewAthleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          >
            <View style={styles.editModal}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Add New Athlete Profile</Text>
                  <Text style={styles.modalSubtitle}>Create a profile with custom 1RMs & settings</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowNewAthleteModal(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                bounces={false}
              >
                {/* Name */}
                <Text style={styles.modalInputLabel}>Athlete Name:</Text>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="e.g. Sarah Cohen, Dan Miller..."
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.modalInput}
                  inputMode="text"
                  returnKeyType="next"
                  autoCorrect={false}
                />

                {/* Biological Sex */}
                <Text style={styles.modalInputLabel}>Biological Sex (Rx Loading baseline):</Text>
                <View style={styles.genderRow}>
                  {(['male', 'female'] as Gender[]).map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => {
                        HapticsService.countdownTick();
                        setNewGender(g);
                      }}
                      style={[
                        styles.genderChip,
                        newGender === g && styles.genderChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.genderChipText,
                          newGender === g && styles.genderChipTextActive,
                        ]}
                      >
                        {g === 'male' ? 'Male (Rx Men)' : 'Female (Rx Women)'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Division Selection */}
                <Text style={styles.modalInputLabel}>Starting Division:</Text>
                <View style={styles.genderRow}>
                  {(['INTERMEDIATE', 'RX', 'COMPETITOR', 'FOUNDATION'] as DivisionTier[]).map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => {
                        HapticsService.countdownTick();
                        setNewDivision(d);
                      }}
                      style={[
                        styles.divisionChip,
                        newDivision === d && styles.divisionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.divisionChipText,
                          newDivision === d && styles.divisionChipTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Age, Weight & Height Inputs Row */}
                <View style={styles.biometricsInputRow}>
                  <View style={styles.biometricField}>
                    <Text style={styles.modalInputLabel}>Age:</Text>
                    <TextInput
                      value={newAge}
                      onChangeText={setNewAge}
                      keyboardType="numeric"
                      inputMode="numeric"
                      placeholder="28"
                      placeholderTextColor={COLORS.textMuted}
                      style={styles.modalInput}
                      returnKeyType="done"
                    />
                  </View>

                  <View style={styles.biometricField}>
                    <Text style={styles.modalInputLabel}>Weight (kg):</Text>
                    <TextInput
                      value={newWeight}
                      onChangeText={setNewWeight}
                      keyboardType="decimal-pad"
                      inputMode="decimal"
                      placeholder="80"
                      placeholderTextColor={COLORS.textMuted}
                      style={styles.modalInput}
                      returnKeyType="done"
                    />
                  </View>

                  <View style={styles.biometricField}>
                    <Text style={styles.modalInputLabel}>Height (cm):</Text>
                    <TextInput
                      value={newHeight}
                      onChangeText={setNewHeight}
                      keyboardType="numeric"
                      inputMode="numeric"
                      placeholder="178"
                      placeholderTextColor={COLORS.textMuted}
                      style={styles.modalInput}
                      returnKeyType="done"
                    />
                  </View>
                </View>

                <Button
                  title="Create & Switch to Athlete"
                  variant="primary"
                  size="lg"
                  onPress={handleCreateNewAthlete}
                  style={styles.saveModalBtn}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ✏️ Edit Athlete Biometrics Modal */}
      <Modal
        visible={showEditBiometricsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditBiometricsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          >
            <View style={styles.editModal}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Edit Athlete Biometrics</Text>
                  <Text style={styles.modalSubtitle}>Update parameters for {profile.name}</Text>
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
                keyboardShouldPersistTaps="always"
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
                  inputMode="text"
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
                  <View style={styles.biometricField}>
                    <Text style={styles.modalInputLabel}>Age (Yrs):</Text>
                    <TextInput
                      value={editAge}
                      onChangeText={setEditAge}
                      keyboardType="numeric"
                      inputMode="numeric"
                      placeholder="28"
                      placeholderTextColor={COLORS.textMuted}
                      style={styles.modalInput}
                      returnKeyType="done"
                      selectTextOnFocus
                    />
                  </View>

                  <View style={styles.biometricField}>
                    <Text style={styles.modalInputLabel}>Weight (kg):</Text>
                    <TextInput
                      value={editWeight}
                      onChangeText={setEditWeight}
                      keyboardType="decimal-pad"
                      inputMode="decimal"
                      placeholder="82"
                      placeholderTextColor={COLORS.textMuted}
                      style={styles.modalInput}
                      returnKeyType="done"
                      selectTextOnFocus
                    />
                  </View>

                  <View style={styles.biometricField}>
                    <Text style={styles.modalInputLabel}>Height (cm):</Text>
                    <TextInput
                      value={editHeight}
                      onChangeText={setEditHeight}
                      keyboardType="numeric"
                      inputMode="numeric"
                      placeholder="180"
                      placeholderTextColor={COLORS.textMuted}
                      style={styles.modalInput}
                      returnKeyType="done"
                      selectTextOnFocus
                    />
                  </View>
                </View>

                <Button
                  title="Save Changes"
                  variant="primary"
                  size="lg"
                  onPress={handleSaveBiometrics}
                  style={styles.saveModalBtn}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
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
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  athleteBadgeHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1.5,
    borderColor: COLORS.neonLime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  athleteBadgeHeaderText: {
    color: COLORS.neonLime,
    fontSize: 14,
    fontWeight: '900',
  },
  brandTitleCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  hamburgerButton: {
    width: 44,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profilesCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.neonLime,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilesCountText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neonLime,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    gap: 6,
  },
  toastBannerText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl * 2,
  },
  quickSwitchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  quickSwitchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickSwitchTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  quickSwitchRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickSwitchActiveName: {
    color: COLORS.cyanElectric,
    fontSize: 12,
    fontWeight: '800',
  },
  athleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.25)',
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
    flexShrink: 1,
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
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  drawerContainer: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    zIndex: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  drawerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerTitle: {
    color: COLORS.textPrimary,
    fontSize: 19,
    fontWeight: '900',
  },
  drawerBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.neonLime,
  },
  drawerBadgeText: {
    color: COLORS.neonLime,
    fontSize: 11,
    fontWeight: '900',
  },
  closeDrawerBtn: {
    padding: 4,
  },
  drawerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  drawerList: {
    maxHeight: 320,
    marginVertical: SPACING.xs,
  },
  drawerProfileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
  },
  drawerProfileItemActive: {
    borderColor: COLORS.neonLime,
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
  },
  drawerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  drawerAvatarActive: {
    backgroundColor: COLORS.neonLime,
    borderColor: COLORS.neonLime,
  },
  drawerAvatarText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '900',
  },
  drawerAvatarTextActive: {
    color: '#000000',
  },
  drawerProfileInfo: {
    flex: 1,
  },
  drawerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  drawerProfileName: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '800',
  },
  drawerProfileNameActive: {
    color: COLORS.textPrimary,
  },
  activeTag: {
    backgroundColor: COLORS.neonLime,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  activeTagText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  drawerProfileMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  drawerActiveIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.neonLime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerDeleteBtn: {
    padding: 6,
  },
  drawerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neonLime,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    gap: 6,
  },
  drawerAddBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  editModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    zIndex: 10,
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
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  } as any,
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 2,
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
  },
  genderChip: {
    flex: 1,
    minWidth: 130,
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
  divisionChip: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  divisionChipActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    borderColor: COLORS.neonLime,
  },
  divisionChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  divisionChipTextActive: {
    color: COLORS.neonLime,
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
    marginBottom: SPACING.md,
  },
});
