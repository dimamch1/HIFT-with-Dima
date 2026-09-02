import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Modality } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'neon' | 'orange' | 'cyan' | 'purple' | 'amber' | 'green' | 'muted' | 'modality';
  modality?: Modality;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  modality,
  size = 'md',
  style,
}) => {
  let bgColor = COLORS.surfaceElevated;
  let textColor = COLORS.textPrimary;
  let borderColor = COLORS.border;

  if (modality) {
    if (modality === 'M') {
      bgColor = 'rgba(0, 229, 255, 0.15)';
      textColor = COLORS.modalityM;
      borderColor = COLORS.modalityM;
    } else if (modality === 'G') {
      bgColor = 'rgba(168, 85, 247, 0.15)';
      textColor = COLORS.modalityG;
      borderColor = COLORS.modalityG;
    } else {
      bgColor = 'rgba(255, 85, 0, 0.15)';
      textColor = COLORS.modalityW;
      borderColor = COLORS.modalityW;
    }
  } else {
    switch (variant) {
      case 'neon':
        bgColor = 'rgba(204, 255, 0, 0.15)';
        textColor = COLORS.neonLime;
        borderColor = COLORS.neonLime;
        break;
      case 'orange':
        bgColor = 'rgba(255, 85, 0, 0.15)';
        textColor = COLORS.safetyOrange;
        borderColor = COLORS.safetyOrange;
        break;
      case 'cyan':
        bgColor = 'rgba(0, 229, 255, 0.15)';
        textColor = COLORS.cyanElectric;
        borderColor = COLORS.cyanElectric;
        break;
      case 'purple':
        bgColor = 'rgba(168, 85, 247, 0.15)';
        textColor = COLORS.vibrantPurple;
        borderColor = COLORS.vibrantPurple;
        break;
      case 'amber':
        bgColor = 'rgba(245, 158, 11, 0.15)';
        textColor = COLORS.amberRest;
        borderColor = COLORS.amberRest;
        break;
      case 'green':
        bgColor = 'rgba(16, 185, 129, 0.15)';
        textColor = COLORS.emeraldGreen;
        borderColor = COLORS.emeraldGreen;
        break;
      case 'muted':
        bgColor = COLORS.surfaceLight;
        textColor = COLORS.textSecondary;
        borderColor = COLORS.borderDark;
        break;
    }
  }

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor,
          paddingHorizontal: isSmall ? 6 : isLarge ? 12 : 8,
          paddingVertical: isSmall ? 2 : isLarge ? 6 : 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: isSmall ? 10 : isLarge ? 13 : 11,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
