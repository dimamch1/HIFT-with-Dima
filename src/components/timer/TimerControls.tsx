import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { ActiveTimerState } from '../../types';
import { Button } from '../common/Button';
import { Play, Pause, RotateCcw, CheckCircle, Flag } from 'lucide-react-native';

interface TimerControlsProps {
  state: ActiveTimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onFinish: () => void;
  onRecordSplit: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  state,
  onStart,
  onPause,
  onResume,
  onReset,
  onFinish,
  onRecordSplit,
}) => {
  const { status, config } = state;

  if (status === 'IDLE') {
    return (
      <View style={styles.container}>
        <Button
          title="START WORKOUT (3-2-1)"
          variant="primary"
          size="giant"
          icon={<Play size={24} color="#000" fill="#000" />}
          onPress={onStart}
          style={styles.fullButton}
        />
      </View>
    );
  }

  if (status === 'RUNNING') {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {config.mode === 'FOR_TIME' && (
            <Button
              title="Split"
              variant="secondary"
              size="lg"
              icon={<Flag size={18} color={COLORS.cyanElectric} />}
              onPress={onRecordSplit}
              style={styles.splitBtn}
            />
          )}

          <Button
            title="PAUSE"
            variant="orange"
            size="lg"
            icon={<Pause size={20} color="#FFF" />}
            onPress={onPause}
            style={styles.flexBtn}
          />

          <Button
            title="FINISH"
            variant="primary"
            size="lg"
            icon={<CheckCircle size={20} color="#000" />}
            onPress={onFinish}
            style={styles.flexBtn}
          />
        </View>
      </View>
    );
  }

  if (status === 'PAUSED') {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Button
            title="RESET"
            variant="outline"
            size="lg"
            icon={<RotateCcw size={18} color={COLORS.crimsonRed} />}
            onPress={onReset}
            style={styles.flexBtn}
          />
          <Button
            title="RESUME"
            variant="primary"
            size="lg"
            icon={<Play size={20} color="#000" fill="#000" />}
            onPress={onResume}
            style={styles.flexBtn}
          />
        </View>
      </View>
    );
  }

  if (status === 'COMPLETED') {
    return (
      <View style={styles.container}>
        <Button
          title="START NEW TIMER"
          variant="primary"
          size="giant"
          icon={<RotateCcw size={22} color="#000" />}
          onPress={onReset}
          style={styles.fullButton}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  fullButton: {
    width: '100%',
  },
  flexBtn: {
    flex: 1,
  },
  splitBtn: {
    minWidth: 90,
  },
});
