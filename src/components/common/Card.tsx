import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'highlight' | 'orange' | 'cyan';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
}) => {
  let bg = COLORS.surface;
  let border = COLORS.borderDark;

  if (variant === 'elevated') {
    bg = COLORS.surfaceElevated;
    border = COLORS.border;
  } else if (variant === 'highlight') {
    bg = COLORS.surfaceCard;
    border = COLORS.neonLime;
  } else if (variant === 'orange') {
    bg = COLORS.surfaceCard;
    border = COLORS.safetyOrange;
  } else if (variant === 'cyan') {
    bg = COLORS.surfaceCard;
    border = COLORS.cyanElectric;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor: border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});
