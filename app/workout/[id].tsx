import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { useWorkoutStore } from '../../src/store/useWorkoutStore';
import { useUserStore } from '../../src/store/useUserStore';
import { useTimerStore } from '../../src/store/useTimerStore';
import { PhaseCard } from '../../src/components/workout/PhaseCard';
import { Button } from '../../src/components/common/Button';
import { Badge } from '../../src/components/common/Badge';
import { TimerMode } from '../../src/types';
import { X, CheckCircle, ArrowLeft, Play } from 'lucide-react-native';
import { HapticsService } from '../../src/services/hapticsService';

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams();
  const todaySession = useWorkoutStore((s) => s.todaySession);
  const setTimerMode = useTimerStore((s) => s.setMode);
  const updateTimerConfig = useTimerStore((s) => s.updateConfig);

  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  if (!todaySession) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active session found.</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleLaunchMetConTimer = () => {
    const metcon = todaySession.partBMetCon;
    HapticsService.workoutGo();

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

    useTimerStore.getState().setActiveWodDetails({
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

    router.push('/(tabs)/timer');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{todaySession.title}</Text>
          <Text style={styles.subtitle}>{todaySession.theme}</Text>
        </View>

        <Badge label={todaySession.division} variant="neon" size="sm" />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase 1: Warmup */}
        <PhaseCard
          phaseType="WARMUP"
          warmupData={todaySession.mobilityWarmup}
        />

        {/* Phase 2: Strength */}
        {todaySession.partAStrength && (
          <PhaseCard
            phaseType="STRENGTH"
            strengthData={todaySession.partAStrength}
          />
        )}

        {/* Phase 3: MetCon */}
        <PhaseCard
          phaseType="METCON"
          metconData={todaySession.partBMetCon}
          onLaunchTimer={handleLaunchMetConTimer}
        />

        {/* Phase 4: Accessory */}
        <PhaseCard
          phaseType="ACCESSORY"
          accessoryData={todaySession.partCAccessory}
        />

        <Button
          title="Complete Workout Session"
          variant="primary"
          size="giant"
          icon={<CheckCircle size={22} color="#000" />}
          onPress={() => {
            HapticsService.workoutComplete();
            router.back();
          }}
          style={styles.finishBtn}
        />
      </ScrollView>
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  backBtn: {
    padding: 6,
    marginRight: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.neonLime,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl * 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  finishBtn: {
    marginTop: SPACING.lg,
  },
});
