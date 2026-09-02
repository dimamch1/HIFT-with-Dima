import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';
import { Flame, Timer as TimerIcon, Trophy, User } from 'lucide-react-native';
import { HapticsService } from '../../src/services/hapticsService';

interface CustomTabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string; params?: unknown }[];
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarLabel?: string;
        tabBarAccessibilityLabel?: string;
      };
    }
  >;
  navigation: {
    emit: (event: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: unknown) => void;
  };
}

function CustomBottomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === 'ios';

  // Dynamic bottom padding for safe area / browser bars
  const bottomInset = Math.max(insets.bottom, isIOS ? 24 : 10);

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: bottomInset }]}>
      <View style={styles.tabBarRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const color = isFocused ? COLORS.neonLime : COLORS.textMuted;
          const label = options.title !== undefined ? options.title : route.name;

          let Icon = Flame;
          if (route.name === 'timer') Icon = TimerIcon;
          else if (route.name === 'benchmarks') Icon = Trophy;
          else if (route.name === 'profile') Icon = User;

          const onPress = () => {
            HapticsService.countdownTick();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
                <Icon size={22} color={color} strokeWidth={isFocused ? 2.5 : 2} />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  { color, fontWeight: isFocused ? '900' : '700' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomBottomTabBar {...(props as CustomTabBarProps)} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Daily WOD',
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer Suite',
        }}
      />
      <Tabs.Screen
        name="benchmarks"
        options={{
          title: 'Benchmarks',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Athlete Hub',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.borderDark,
    borderTopWidth: 1,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 12,
  },
  tabBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 52,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrapper: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: 2,
    textAlign: 'center',
  },
});
