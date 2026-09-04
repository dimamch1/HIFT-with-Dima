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
import { useTimerStore } from '../../src/store/useTimerStore';
import { useWorkoutStore } from '../../src/store/useWorkoutStore';
import { useUserStore } from '../../src/store/useUserStore';
import { TimerModeSelector } from '../../src/components/timer/TimerModeSelector';
import { TimerDisplay } from '../../src/components/timer/TimerDisplay';
import { TimerControls } from '../../src/components/timer/TimerControls';
import { RoundTracker } from '../../src/components/timer/RoundTracker';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import {
  Volume2,
  VolumeX,
  Smartphone,
  Settings2,
  Check,
  X,
  Star,
  Flame,
  Zap,
  Dumbbell,
  Clock,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { HapticsService } from '../../src/services/hapticsService';

export default function TimerScreen() {
  const user = useUserStore((s) => s.profile);
  const { logWorkout } = useWorkoutStore();

  const {
    state,
    countdownValue,
    setMode,
    updateConfig,
    setActiveWodDetails,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    incrementAmrapRound,
    incrementAmrapRep,
    recordSplit,
    finishWorkout,
  } = useTimerStore();

  const [showLogScoreModal, setShowLogScoreModal] = useState(false);
  const [logRpe, setLogRpe] = useState(8);
  const [logNotes, setLogNotes] = useState('');
  const [isRxLog, setIsRxLog] = useState(true);
  const [isWodCollapsed, setIsWodCollapsed] = useState(false);

  const isIdle = state.status === 'IDLE';

  const toggleSound = () => {
    HapticsService.countdownTick();
    updateConfig({ soundEnabled: !state.config.soundEnabled });
  };

  const toggleHaptics = () => {
    HapticsService.countdownTick();
    updateConfig({ hapticsEnabled: !state.config.hapticsEnabled });
  };

  const handleFinishAndOpenLog = () => {
    finishWorkout();
    setShowLogScoreModal(true);
  };

  const handleSaveLog = () => {
    let scoreStr = '';
    if (state.config.mode === 'FOR_TIME') {
      const mins = Math.floor(state.elapsedSeconds / 60);
      const secs = state.elapsedSeconds % 60;
      scoreStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    } else if (state.config.mode === 'AMRAP') {
      scoreStr = `${state.amrapRounds} Rounds + ${state.amrapReps} Reps`;
    } else {
      scoreStr = `Completed ${state.currentRound} Rounds`;
    }

    logWorkout(
      {
        wodTitle: state.activeWodDetails?.title || `${state.config.mode} Session`,
        format: state.config.mode === 'CUSTOM_INTERVAL' ? 'INTERVAL' : state.config.mode,
        division: user.division,
        score: scoreStr,
        roundsCompleted: state.amrapRounds,
        repsCompleted: state.amrapReps,
        timeTakenSeconds: state.elapsedSeconds,
        isRx: isRxLog,
        rpe: logRpe,
        notes: logNotes,
        recordedPlanes: ['MONOSTRUCTURAL', 'KNEE_FLEXION', 'VERTICAL_PULL'],
        axialLoad: 'LOW',
      },
      user
    );

    HapticsService.workoutComplete();
    setShowLogScoreModal(false);
    resetTimer();
  };

  // Interval quick presets
  const INTERVAL_PRESETS = [
    { label: '45s / 15s', work: 45, rest: 15, rounds: 6 },
    { label: '30s / 30s', work: 30, rest: 30, rounds: 8 },
    { label: '40s / 20s', work: 40, rest: 20, rounds: 6 },
    { label: '20s / 10s', work: 20, rest: 10, rounds: 8 },
    { label: '60s / 30s', work: 60, rest: 30, rounds: 5 },
    { label: '50s / 10s', work: 50, rest: 10, rounds: 6 },
  ];

  const applyIntervalPreset = (p: { work: number; rest: number; rounds: number }) => {
    HapticsService.countdownTick();
    updateConfig({
      intervalWorkSeconds: p.work,
      intervalRestSeconds: p.rest,
      totalRounds: p.rounds,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarSide} />
        <View style={styles.brandTitleCol}>
          <Text style={styles.brandTitle}>HIFT with Dima</Text>
          <Text style={styles.subtitle}>CrossFit Precision Timer Suite</Text>
        </View>

        {/* Audio & Haptic Toggles */}
        <View style={[styles.toggleRow, styles.topBarSide]}>
          <TouchableOpacity
            onPress={toggleSound}
            style={[
              styles.iconBtn,
              state.config.soundEnabled && styles.iconBtnActive,
            ]}
          >
            {state.config.soundEnabled ? (
              <Volume2 size={18} color={COLORS.neonLime} />
            ) : (
              <VolumeX size={18} color={COLORS.textMuted} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleHaptics}
            style={[
              styles.iconBtn,
              state.config.hapticsEnabled && styles.iconBtnActive,
            ]}
          >
            <Smartphone
              size={18}
              color={state.config.hapticsEnabled ? COLORS.cyanElectric : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Mode Selector */}
        <TimerModeSelector
          currentMode={state.config.mode}
          onSelectMode={setMode}
          disabled={!isIdle}
        />

        {/* Giant Timer Display */}
        <TimerDisplay state={state} countdownValue={countdownValue} />

        {/* 📋 Active Workout Protocol Card (Item 1: Collapsible / Expandable) */}
        {state.activeWodDetails && (
          <View style={styles.activeWodCard}>
            <TouchableOpacity
              onPress={() => {
                HapticsService.countdownTick();
                setIsWodCollapsed(!isWodCollapsed);
              }}
              style={styles.activeWodHeader}
              activeOpacity={0.85}
            >
              <View style={styles.activeWodTitleRow}>
                <Flame size={18} color={COLORS.safetyOrange} />
                <Text style={styles.activeWodTitle}>{state.activeWodDetails.title}</Text>
              </View>
              <View style={styles.activeWodBadgeRow}>
                <Badge label={state.activeWodDetails.format} variant="orange" size="sm" />
                <View style={styles.collapseToggleBtn}>
                  {isWodCollapsed ? (
                    <ChevronDown size={18} color={COLORS.neonLime} />
                  ) : (
                    <ChevronUp size={18} color={COLORS.neonLime} />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {!isWodCollapsed && (
              <>
                {state.activeWodDetails.description ? (
                  <Text style={styles.activeWodDesc}>{state.activeWodDetails.description}</Text>
                ) : null}

                {/* Prescribed Movements Breakdown */}
                {state.activeWodDetails.movements && state.activeWodDetails.movements.length > 0 && (
                  <View style={styles.movementsContainer}>
                    {state.activeWodDetails.movements.map((mov, idx) => (
                      <View key={idx} style={styles.movementItemRow}>
                        <View style={styles.movementDot} />
                        <Text style={styles.movementNameText}>{mov.name}</Text>
                        <Text style={styles.movementPrescriptionText}>{mov.prescription}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Stimulus & Target guidance */}
                {state.activeWodDetails.intendedStimulus ? (
                  <View style={styles.stimulusPill}>
                    <Zap size={13} color={COLORS.neonLime} />
                    <Text style={styles.stimulusPillText}>{state.activeWodDetails.intendedStimulus}</Text>
                  </View>
                ) : null}

                {/* Option to clear protocol */}
                <TouchableOpacity
                  onPress={() => {
                    HapticsService.countdownTick();
                    setActiveWodDetails(null);
                  }}
                  style={styles.clearWodActionRow}
                >
                  <Text style={styles.clearWodText}>נקה אימון מהטיימר</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Action Controls */}
        <TimerControls
          state={state}
          onStart={startTimer}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onReset={resetTimer}
          onFinish={handleFinishAndOpenLog}
          onRecordSplit={recordSplit}
        />

        {/* Round & Split Tracker */}
        <RoundTracker
          state={state}
          onIncrementRound={incrementAmrapRound}
          onIncrementRep={incrementAmrapRep}
        />

        {/* Configuration Panel (when Idle) */}
        {isIdle && (
          <View style={styles.configCard}>
            <View style={styles.configHeader}>
              <Settings2 size={18} color={COLORS.cyanElectric} />
              <Text style={styles.configTitle}>Timer Configuration</Text>
            </View>

            {/* Time Cap Stepper */}
            {(state.config.mode === 'FOR_TIME' || state.config.mode === 'AMRAP') && (
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Time Cap (Minutes):</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    onPress={() =>
                      updateConfig({
                        timeCapSeconds: Math.max(60, state.config.timeCapSeconds - 60),
                      })
                    }
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>
                    {Math.floor(state.config.timeCapSeconds / 60)} Min
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      updateConfig({
                        timeCapSeconds: state.config.timeCapSeconds + 60,
                      })
                    }
                    style={styles.stepBtn}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* EMOM Configuration */}
            {state.config.mode === 'EMOM' && (
              <>
                <View style={styles.paramRow}>
                  <Text style={styles.paramLabel}>Interval Length:</Text>
                  <Text style={styles.paramNote}>Every 1:00 (Standard)</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramLabel}>Total Minutes:</Text>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      onPress={() =>
                        updateConfig({
                          totalRounds: Math.max(1, state.config.totalRounds - 1),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepVal}>{state.config.totalRounds} Min</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateConfig({
                          totalRounds: state.config.totalRounds + 1,
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* Tabata Configuration */}
            {state.config.mode === 'TABATA' && (
              <>
                <View style={styles.paramRow}>
                  <Text style={styles.paramLabel}>Work / Rest:</Text>
                  <Text style={styles.paramNote}>20s Work / 10s Rest (Standard)</Text>
                </View>
              </>
            )}

            {/* ⏱️ Custom Interval Mode Configuration */}
            {state.config.mode === 'CUSTOM_INTERVAL' && (
              <View style={styles.intervalConfigBlock}>
                {/* Work Duration Stepper */}
                <View style={styles.paramRow}>
                  <View>
                    <Text style={styles.paramLabel}>Work Duration:</Text>
                    <Text style={styles.paramSubLabel}>Active interval</Text>
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      onPress={() =>
                        updateConfig({
                          intervalWorkSeconds: Math.max(5, state.config.intervalWorkSeconds - 5),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.stepVal, { color: COLORS.neonLime }]}>
                      {state.config.intervalWorkSeconds}s
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateConfig({
                          intervalWorkSeconds: state.config.intervalWorkSeconds + 5,
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Rest Duration Stepper */}
                <View style={styles.paramRow}>
                  <View>
                    <Text style={styles.paramLabel}>Rest Duration:</Text>
                    <Text style={styles.paramSubLabel}>Recovery interval</Text>
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      onPress={() =>
                        updateConfig({
                          intervalRestSeconds: Math.max(0, state.config.intervalRestSeconds - 5),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.stepVal, { color: COLORS.amberRest }]}>
                      {state.config.intervalRestSeconds}s
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateConfig({
                          intervalRestSeconds: state.config.intervalRestSeconds + 5,
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Total Rounds Stepper */}
                <View style={styles.paramRow}>
                  <View>
                    <Text style={styles.paramLabel}>Total Rounds:</Text>
                    <Text style={styles.paramSubLabel}>
                      Session: {Math.floor(((state.config.intervalWorkSeconds + state.config.intervalRestSeconds) * state.config.totalRounds) / 60)}:
                      {((state.config.intervalWorkSeconds + state.config.intervalRestSeconds) * state.config.totalRounds) % 60 < 10 ? '0' : ''}
                      {((state.config.intervalWorkSeconds + state.config.intervalRestSeconds) * state.config.totalRounds) % 60} Min
                    </Text>
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      onPress={() =>
                        updateConfig({
                          totalRounds: Math.max(1, state.config.totalRounds - 1),
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepVal}>{state.config.totalRounds} Rds</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateConfig({
                          totalRounds: state.config.totalRounds + 1,
                        })
                      }
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quick Interval Presets */}
                <Text style={styles.presetsLabel}>Quick Interval Presets:</Text>
                <View style={styles.presetsRow}>
                  {INTERVAL_PRESETS.map((p, idx) => {
                    const isCurrent =
                      state.config.intervalWorkSeconds === p.work &&
                      state.config.intervalRestSeconds === p.rest &&
                      state.config.totalRounds === p.rounds;
                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => applyIntervalPreset(p)}
                        style={[
                          styles.presetChip,
                          isCurrent && styles.presetChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            isCurrent && styles.presetChipTextActive,
                          ]}
                        >
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Post-Workout Score Logging Modal */}
      <Modal visible={showLogScoreModal} transparent animationType="slide" onRequestClose={() => setShowLogScoreModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          >
            <View style={styles.logModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Log Workout Score</Text>
                <TouchableOpacity
                  onPress={() => {
                    HapticsService.countdownTick();
                    setShowLogScoreModal(false);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Score summary */}
              <Text style={styles.scoreLabel}>Final Result:</Text>
              <Text style={styles.finalScoreDigits}>
                {state.config.mode === 'FOR_TIME'
                  ? `${Math.floor(state.elapsedSeconds / 60)}:${state.elapsedSeconds % 60 < 10 ? '0' : ''}${state.elapsedSeconds % 60}`
                  : `${state.amrapRounds} Rounds + ${state.amrapReps} Reps`}
              </Text>

              {/* Rx / Scaled Toggle */}
              <View style={styles.divisionToggleRow}>
                <TouchableOpacity
                  onPress={() => {
                    HapticsService.countdownTick();
                    setIsRxLog(true);
                  }}
                  style={[
                    styles.divisionToggleBtn,
                    isRxLog && styles.divisionToggleBtnActiveRx,
                  ]}
                >
                  <Text
                    style={[
                      styles.divisionToggleText,
                      isRxLog && styles.divisionToggleTextActive,
                    ]}
                  >
                    Rx (Prescribed)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    HapticsService.countdownTick();
                    setIsRxLog(false);
                  }}
                  style={[
                    styles.divisionToggleBtn,
                    !isRxLog && styles.divisionToggleBtnActiveScaled,
                  ]}
                >
                  <Text
                    style={[
                      styles.divisionToggleText,
                      !isRxLog && styles.divisionToggleTextActive,
                    ]}
                  >
                    Scaled / Modified
                  </Text>
                </TouchableOpacity>
              </View>

              {/* RPE Exertion Rating */}
              <Text style={styles.rpeLabel}>Rate of Perceived Exertion (RPE: {logRpe}/10):</Text>
              <View style={styles.rpeRow}>
                {[6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => {
                      HapticsService.countdownTick();
                      setLogRpe(num);
                    }}
                    style={[
                      styles.rpeChip,
                      logRpe === num && styles.rpeChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rpeChipText,
                        logRpe === num && styles.rpeChipTextActive,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Athlete Notes */}
              <Text style={styles.notesLabel}>Notes & Pacing Feedback:</Text>
              <TextInput
                value={logNotes}
                onChangeText={setLogNotes}
                placeholder="e.g. Unbroken thrusters, felt fast in round 2..."
                placeholderTextColor={COLORS.textMuted}
                style={styles.notesInput}
                inputMode="text"
                multiline
                returnKeyType="done"
                blurOnSubmit={true}
              />

              <Button
                title="Save to Training Journal"
                variant="primary"
                size="lg"
                onPress={handleSaveLog}
                style={styles.saveLogBtn}
              />
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
  brandTitleCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarSide: {
    width: 80,
    alignItems: 'flex-end',
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
    color: COLORS.neonLime,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  iconBtnActive: {
    borderColor: COLORS.neonLime,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl * 2,
  },
  activeWodCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.safetyOrange,
    shadowColor: COLORS.safetyOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  activeWodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  activeWodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeWodTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 6,
  },
  activeWodBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapseToggleBtn: {
    padding: 4,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearWodActionRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    marginTop: 4,
  },
  clearWodText: {
    color: COLORS.textMuted,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  activeWodDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  movementsContainer: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    gap: 6,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  movementItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  movementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neonLime,
    marginRight: 6,
  },
  movementNameText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  movementPrescriptionText: {
    color: COLORS.neonLime,
    fontSize: 12,
    fontWeight: '700',
  },
  stimulusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs + 2,
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  stimulusPillText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  configCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  configTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  paramLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  paramSubLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  paramNote: {
    color: COLORS.neonLime,
    fontSize: 12,
    fontWeight: '700',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepBtnText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  stepVal: {
    color: COLORS.neonLime,
    fontSize: 14,
    fontWeight: '800',
    minWidth: 60,
    textAlign: 'center',
  },
  intervalConfigBlock: {
    gap: SPACING.xs,
  },
  presetsLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  presetChipActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderColor: COLORS.neonLime,
  },
  presetChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  presetChipTextActive: {
    color: COLORS.neonLime,
    fontWeight: '800',
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
  logModal: {
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
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  scoreLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  finalScoreDigits: {
    color: COLORS.neonLime,
    fontSize: 32,
    fontWeight: '900',
    marginVertical: SPACING.xs,
  },
  divisionToggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  divisionToggleBtn: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  divisionToggleBtnActiveRx: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderColor: COLORS.neonLime,
  },
  divisionToggleBtnActiveScaled: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: COLORS.cyanElectric,
  },
  divisionToggleText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  divisionToggleTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '900',
  },
  rpeLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  rpeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  rpeChip: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  rpeChipActive: {
    backgroundColor: COLORS.safetyOrange,
    borderColor: COLORS.safetyOrange,
  },
  rpeChipText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '800',
  },
  rpeChipTextActive: {
    color: '#FFFFFF',
  },
  notesLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  notesInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 14,
    height: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  } as any,
  saveLogBtn: {
    marginTop: SPACING.lg,
  },
});
