import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { ActiveTimerState, TimerMode } from '../../types';

interface TimerDisplayProps {
  state: ActiveTimerState;
  countdownValue: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ state, countdownValue }) => {
  const { status, config, elapsedSeconds, remainingSeconds, currentRound, totalRounds, intervalPhase, intervalRemainingSeconds, amrapRounds, amrapReps } = state;

  // Format seconds to mm:ss
  const formatTime = (totalSec: number): string => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const padMin = mins < 10 ? `0${mins}` : `${mins}`;
    const padSec = secs < 10 ? `0${secs}` : `${secs}`;
    return `${padMin}:${padSec}`;
  };

  // Determine main digits to show
  let mainDigits = '00:00';
  let subDigits = '';
  let statusColor = COLORS.neonLime;
  let phaseLabel = 'READY';

  if (status === 'PRE_COUNTDOWN') {
    mainDigits = `${countdownValue}`;
    statusColor = COLORS.safetyOrange;
    phaseLabel = 'GET READY';
  } else if (status === 'COMPLETED') {
    mainDigits = 'DONE!';
    statusColor = COLORS.emeraldGreen;
    phaseLabel = 'WORKOUT FINISHED';
  } else {
    if (config.mode === 'FOR_TIME') {
      mainDigits = formatTime(elapsedSeconds);
      subDigits = `CAP: ${formatTime(config.timeCapSeconds)}`;
      phaseLabel = status === 'PAUSED' ? 'PAUSED' : 'FOR TIME';
      statusColor = COLORS.neonLime;
    } else if (config.mode === 'AMRAP') {
      mainDigits = formatTime(remainingSeconds);
      subDigits = `${amrapRounds} Rds + ${amrapReps} Reps`;
      phaseLabel = status === 'PAUSED' ? 'PAUSED' : 'AMRAP COUNTDOWN';
      statusColor = remainingSeconds <= 30 ? COLORS.safetyOrange : COLORS.neonLime;
    } else if (config.mode === 'EMOM' || config.mode === 'TABATA' || config.mode === 'CUSTOM_INTERVAL') {
      mainDigits = formatTime(intervalRemainingSeconds);
      subDigits = `ROUND ${currentRound} / ${totalRounds}`;
      phaseLabel = status === 'PAUSED' ? 'PAUSED' : intervalPhase === 'WORK' ? '🔥 WORK' : '🛑 REST';
      statusColor = intervalPhase === 'WORK' ? COLORS.neonLime : COLORS.amberRest;
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: statusColor,
          backgroundColor:
            status === 'PRE_COUNTDOWN'
              ? 'rgba(255, 85, 0, 0.08)'
              : intervalPhase === 'REST' && status === 'RUNNING'
              ? 'rgba(245, 158, 11, 0.08)'
              : 'rgba(204, 255, 0, 0.04)',
        },
      ]}
    >
      {/* Mode / Phase Pill */}
      <View
        style={[
          styles.phasePill,
          {
            backgroundColor: statusColor,
          },
        ]}
      >
        <Text style={styles.phasePillText}>{phaseLabel}</Text>
      </View>

      {/* Main Massive Digits */}
      <Text
        style={[
          styles.mainDigits,
          {
            color: statusColor,
            fontSize: status === 'PRE_COUNTDOWN' ? 120 : status === 'COMPLETED' ? 68 : 84,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {mainDigits}
      </Text>

      {/* Sub Info / Rounds / Splits */}
      {subDigits ? (
        <View style={styles.subContainer}>
          <Text style={styles.subText}>{subDigits}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    minHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  phasePill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
  },
  phasePillText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  mainDigits: {
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    ...Platform.select({
      ios: { fontFamily: 'HelveticaNeue-CondensedBlack' },
      android: { fontFamily: 'sans-serif-condensed' },
    }),
  },
  subContainer: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  subText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
