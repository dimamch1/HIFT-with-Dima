import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/useUserStore';
import { useWorkoutStore } from '../../src/store/useWorkoutStore';
import { useTimerStore } from '../../src/store/useTimerStore';
import { PhaseCard } from '../../src/components/workout/PhaseCard';
import { SubstitutionModal } from '../../src/components/workout/SubstitutionModal';
import { MovementVideoModal } from '../../src/components/workout/MovementVideoModal';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { PrescribedMovement, TimerMode } from '../../src/types';
import {
  Zap,
  Clock,
  RotateCw,
  Sliders,
  ShieldCheck,
  Flame,
  Dumbbell,
  Play,
  Video,
} from 'lucide-react-native';
import { HapticsService } from '../../src/services/hapticsService';

export default function TodayScreen() {
  const user = useUserStore((s) => s.profile);
  const isUserLoading = useUserStore((s) => s.isLoading);

  const {
    todaySession,
    fatigueAnalysis,
    isTimeCrunched,
    isLoading: isWorkoutLoading,
    initialize,
    generateDailyWOD,
    toggleTimeCrunch,
    substituteMovement,
  } = useWorkoutStore();

  const setTimerMode = useTimerStore((s) => s.setMode);
  const updateTimerConfig = useTimerStore((s) => s.updateConfig);
  const setActiveWodDetails = useTimerStore((s) => s.setActiveWodDetails);

  // Substitution Modal State
  const [selectedSubMovement, setSelectedSubMovement] = useState<PrescribedMovement | null>(null);
  const [subModalVisible, setSubModalVisible] = useState(false);

  // Movement Video Demo Modal State (Item 1 requested)
  const [selectedVideoMovement, setSelectedVideoMovement] = useState<PrescribedMovement | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      initialize(user);
    }
  }, [isUserLoading]);

  const handleLaunchInTimer = () => {
    if (!todaySession) return;
    const metcon = todaySession.partBMetCon;

    HapticsService.workoutGo();

    // Configure timer to match MetCon specifications
    const timerMode: TimerMode =
      metcon.format === 'CHIPPER'
        ? 'FOR_TIME'
        : metcon.format === 'E2MOM'
        ? 'EMOM'
        : metcon.format === 'INTERVAL'
        ? 'CUSTOM_INTERVAL'
        : metcon.format;

    setTimerMode(timerMode);
    updateTimerConfig({
      timeCapSeconds: metcon.timeCapMinutes * 60,
      intervalWorkSeconds: metcon.intervalWorkSeconds || 60,
      intervalRestSeconds: metcon.intervalRestSeconds || 0,
      totalRounds: metcon.totalRounds || (metcon.format === 'EMOM' ? metcon.timeCapMinutes : 1),
    });

    // Populate active WOD details for timer display
    setActiveWodDetails({
      title: metcon.title,
      format: metcon.format,
      description: todaySession.theme,
      movements: metcon.movements.map((m) => {
        let countText = '';
        if (m.calories) countText = `${m.calories} Cals`;
        else if (m.distanceMeters) countText = `${m.distanceMeters}m`;
        else if (m.reps) countText = `${m.reps} Reps`;

        const load = m.scaledDescription || m.rxDescription || m.customNotes || '';
        return {
          name: m.name,
          prescription: load ? `${countText} • ${load}` : countText,
        };
      }),
      intendedStimulus: metcon.intendedStimulus,
      targetScore: metcon.targetScoreRx,
    });

    // Navigate to timer tab
    router.push('/(tabs)/timer');
  };

  const handleOpenSubstitution = (movement: PrescribedMovement) => {
    setSelectedSubMovement(movement);
    setSubModalVisible(true);
  };

  const handleOpenVideoDemo = (movement: PrescribedMovement) => {
    setSelectedVideoMovement(movement);
    setVideoModalVisible(true);
  };

  const handlePerformSubstitution = (origId: string, subId: string) => {
    substituteMovement(origId, subId, user);
  };

  if (isUserLoading || isWorkoutLoading || !todaySession) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.neonLime} />
          <Text style={styles.loadingText}>Generating Periodized HIFT Session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const handleRegenerateWOD = () => {
    HapticsService.workoutGo();
    const latestUser = useUserStore.getState().profile;
    generateDailyWOD(latestUser, true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🌟 Top App Hero Bar with Centered HIFT with Dima Title (Item 2 requested) */}
      <View style={styles.topBar}>
        <View style={styles.topBarSide}>
          <Badge label={todaySession.division} variant="neon" size="sm" />
        </View>

        <View style={styles.brandTitleCol}>
          <Text style={styles.heroBrandTitle}>HIFT with Dima</Text>
          <View style={styles.sessionMetaRow}>
            <Text style={styles.dateText}>{todayStr.toUpperCase()}</Text>
            <Text style={styles.metaBullet}>•</Text>
            <Text style={styles.sessionWodName}>{todaySession.title}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.topBarSide, { alignItems: 'flex-end' }]}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          <View style={styles.athleteAvatarBadge}>
            <Text style={styles.athleteAvatarInitial}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Action & Crunch Mode Bar */}
        <View style={styles.actionToolbar}>
          <TouchableOpacity
            onPress={() => toggleTimeCrunch(user)}
            style={[
              styles.timeCrunchButton,
              isTimeCrunched && styles.timeCrunchButtonActive,
            ]}
            activeOpacity={0.8}
          >
            <Clock
              size={16}
              color={isTimeCrunched ? '#000000' : COLORS.neonLime}
            />
            <Text
              style={[
                styles.timeCrunchText,
                isTimeCrunched && styles.timeCrunchTextActive,
              ]}
            >
              {isTimeCrunched ? '⚡ Time Crunch ON (28 Min)' : '⏱️ Time Crunch (-15 Min)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRegenerateWOD}
            style={styles.refreshButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <RotateCw size={18} color={COLORS.neonLime} />
          </TouchableOpacity>
        </View>

        {/* Fatigue & Biomechanics Intelligence Banner */}
        {fatigueAnalysis && (
          <View style={styles.fatigueCard}>
            <View style={styles.fatigueHeader}>
              <ShieldCheck size={16} color={COLORS.cyanElectric} />
              <Text style={styles.fatigueTitle}>Joint & Fatigue Intelligence</Text>
            </View>
            <Text style={styles.fatigueSummary}>
              {fatigueAnalysis.analysisSummary}
            </Text>
          </View>
        )}

        {/* Session Overview Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Clock size={14} color={COLORS.textMuted} />
            <Text style={styles.statLabel}>Est. Duration</Text>
            <Text style={styles.statValue}>{todaySession.estimatedDurationMinutes} Min</Text>
          </View>
          <View style={styles.statBox}>
            <Zap size={14} color={COLORS.safetyOrange} />
            <Text style={styles.statLabel}>Format</Text>
            <Text style={styles.statValue}>{todaySession.partBMetCon.format}</Text>
          </View>
          <View style={styles.statBox}>
            <Dumbbell size={14} color={COLORS.cyanElectric} />
            <Text style={styles.statLabel}>Gear Match</Text>
            <Text style={styles.statValue}>{user.equipmentPreset.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>

        {/* Phase 1: Targeted Warm-up */}
        <PhaseCard
          phaseType="WARMUP"
          warmupData={todaySession.mobilityWarmup}
        />

        {/* Phase 2: Strength / OLy / Skill (Part A) */}
        {todaySession.partAStrength && (
          <PhaseCard
            phaseType="STRENGTH"
            strengthData={todaySession.partAStrength}
            onOpenVideoDemo={handleOpenVideoDemo}
          />
        )}

        {/* Phase 3: Main MetCon (Part B) */}
        <PhaseCard
          phaseType="METCON"
          metconData={todaySession.partBMetCon}
          onLaunchTimer={handleLaunchInTimer}
          onOpenSubstitution={handleOpenSubstitution}
          onOpenVideoDemo={handleOpenVideoDemo}
        />

        {/* Phase 4: Accessory & Down-Regulation (Part C) */}
        <PhaseCard
          phaseType="ACCESSORY"
          accessoryData={todaySession.partCAccessory}
        />
      </ScrollView>

      {/* 🎥 Movement Video Demonstration Modal */}
      <MovementVideoModal
        visible={videoModalVisible}
        movement={selectedVideoMovement}
        onClose={() => setVideoModalVisible(false)}
      />

      {/* 1-Click Substitution Modal */}
      <SubstitutionModal
        visible={subModalVisible}
        movement={selectedSubMovement}
        onClose={() => setSubModalVisible(false)}
        onSelectSubstitute={handlePerformSubstitution}
      />
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
    backgroundColor: COLORS.background,
  },
  topBarSide: {
    width: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  brandTitleCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBrandTitle: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    flexWrap: 'wrap',
    gap: 6,
  },
  dateText: {
    color: COLORS.cyanElectric,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  metaBullet: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  sessionWodName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 140,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  actionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  timeCrunchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
    gap: SPACING.sm,
  },
  timeCrunchButtonActive: {
    backgroundColor: COLORS.neonLime,
    borderColor: COLORS.neonLime,
  },
  timeCrunchText: {
    color: COLORS.neonLime,
    fontSize: 13,
    fontWeight: '800',
  },
  timeCrunchTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  refreshButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fatigueCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.cyanElectric,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  fatigueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  fatigueTitle: {
    color: COLORS.cyanElectric,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fatigueSummary: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: 2,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  athleteAvatarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1.5,
    borderColor: COLORS.cyanElectric,
    alignItems: 'center',
    justifyContent: 'center',
  },
  athleteAvatarInitial: {
    color: COLORS.cyanElectric,
    fontSize: 12,
    fontWeight: '900',
  },
});
