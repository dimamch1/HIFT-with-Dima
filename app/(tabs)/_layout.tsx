import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../src/constants/theme';
import { Flame, Timer as TimerIcon, Trophy, User } from 'lucide-react-native';

export default function TabLayout() {
  const isWeb = Platform.OS === 'web';
  const isIOS = Platform.OS === 'ios';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: isIOS ? 98 : isWeb ? 88 : 84,
            paddingBottom: isIOS ? 36 : isWeb ? 24 : 20,
            paddingTop: 8,
          },
        ],
        tabBarActiveTintColor: COLORS.neonLime,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.tabIcon,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Daily WOD',
          tabBarIcon: ({ color, focused }) => (
            <Flame size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer Suite',
          tabBarIcon: ({ color, focused }) => (
            <TimerIcon size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="benchmarks"
        options={{
          title: 'Benchmarks',
          tabBarIcon: ({ color, focused }) => (
            <Trophy size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Athlete Hub',
          tabBarIcon: ({ color, focused }) => (
            <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.borderDark,
    borderTopWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  tabIcon: {
    marginTop: 2,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: 2,
    marginBottom: 2,
  },
});
