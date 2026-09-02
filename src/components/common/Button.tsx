import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { HapticsService } from '../../services/hapticsService';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'orange';
  size?: 'sm' | 'md' | 'lg' | 'giant';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    HapticsService.countdownTick();
    onPress();
  };

  let bg = COLORS.neonLime;
  let textCol = COLORS.textInverse;
  let borderCol = 'transparent';

  switch (variant) {
    case 'primary':
      bg = COLORS.neonLime;
      textCol = '#000000';
      break;
    case 'secondary':
      bg = COLORS.surfaceElevated;
      textCol = COLORS.textPrimary;
      break;
    case 'outline':
      bg = 'transparent';
      textCol = COLORS.textPrimary;
      borderCol = COLORS.border;
      break;
    case 'danger':
      bg = COLORS.crimsonRed;
      textCol = '#FFFFFF';
      break;
    case 'orange':
      bg = COLORS.safetyOrange;
      textCol = '#FFFFFF';
      break;
  }

  let padY = SPACING.md;
  let padX = SPACING.xl;
  let fontSz = 15;

  if (size === 'sm') {
    padY = SPACING.xs + 2;
    padX = SPACING.md;
    fontSz = 13;
  } else if (size === 'lg') {
    padY = SPACING.lg;
    padX = SPACING.xxl;
    fontSz = 17;
  } else if (size === 'giant') {
    padY = SPACING.xxl;
    padX = SPACING.xxxl;
    fontSz = 22;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: bg,
          borderColor: borderCol,
          paddingVertical: padY,
          paddingHorizontal: padX,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textCol} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: textCol,
                fontSize: fontSz,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
