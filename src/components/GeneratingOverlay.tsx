import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, borderRadius, spacing, fontSize, glassCardStrong } from '../theme';

interface GeneratingOverlayProps {
  visible: boolean;
  status: string;
  message?: string;
}

export function GeneratingOverlay({ visible, status, message }: GeneratingOverlayProps) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, spinAnim, pulseAnim, glowAnim]);

  if (!visible) return null;

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const statusText: Record<string, string> = {
    starting: 'Inicializando modelo...',
    processing: 'Generando tu sticker...',
    succeeded: 'Completado',
    failed: 'Error en la generación',
  };

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.glowOrb, styles.glowOrb1, { opacity: pulseAnim }]} />
      <Animated.View style={[styles.glowOrb, styles.glowOrb2, { opacity: glowAnim }]} />

      <View style={styles.card}>
        <View style={styles.spinnerContainer}>
          <Animated.View style={[styles.spinnerOuter, { transform: [{ rotate: spin }] }]} />
          <Animated.View style={[styles.spinnerInner, { opacity: pulseAnim }]} />
          <View style={styles.spinnerCenter}>
            <Text style={styles.spinnerIcon}>
              {status === 'failed' ? '!' : status === 'succeeded' ? '+' : '*'}
            </Text>
          </View>
        </View>

        <Text style={styles.statusText}>{statusText[status] || 'Procesando...'}</Text>
        {message && <Text style={styles.message}>{message}</Text>}

        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: pulseAnim.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0.2, i === 1 ? 1 : 0.6],
                  }),
                  backgroundColor: i === 1 ? colors.primary : colors.secondary,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  glowOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  glowOrb1: {
    top: '30%',
    left: '10%',
    backgroundColor: colors.neonCyan,
    opacity: 0.06,
  },
  glowOrb2: {
    bottom: '30%',
    right: '10%',
    backgroundColor: colors.neonPurple,
    opacity: 0.06,
  },
  card: {
    ...glassCardStrong,
    padding: spacing.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    minWidth: 260,
  },
  spinnerContainer: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  spinnerOuter: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: colors.primary,
    borderRightColor: colors.primaryMuted,
  },
  spinnerInner: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomColor: colors.secondary,
    borderLeftColor: colors.secondaryMuted,
  },
  spinnerCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '800',
  },
  statusText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
