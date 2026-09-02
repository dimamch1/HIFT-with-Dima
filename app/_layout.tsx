import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../src/constants/theme';
import { AudioService } from '../src/services/audioService';
import { useUserStore } from '../src/store/useUserStore';

export default function RootLayout() {
  const loadProfile = useUserStore((s) => s.loadProfile);

  useEffect(() => {
    // Initialize audio ducking session & load profile
    AudioService.initAudioSession();
    loadProfile();
  }, []);

  return (
    <View style={styles.outerContainer}>
      <StatusBar style="light" />
      <View style={styles.responsiveShell}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="workout/[id]"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  responsiveShell: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
});
