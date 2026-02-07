import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '../theme';

interface GeneratingOverlayProps {
  visible: boolean;
  status: string;
  message?: string;
}

export function GeneratingOverlay({ visible, status, message }: GeneratingOverlayProps) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, spinAnim, pulseAnim]);

  if (!visible) return null;

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const statusText: Record<string, string> = {
    starting: 'Iniciando modelo...',
    processing: 'Generando tu sticker...',
    succeeded: 'Completado!',
    failed: 'Error en la generación',
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinnerInner} />
        </Animated.View>
        <Animated.Text style={[styles.emoji, { transform: [{ scale: pulseAnim }] }]}>
          {status === 'failed' ? '!' : '*'}
        </Animated.Text>
        <Text style={styles.statusText}>{statusText[status] || 'Procesando...'}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
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
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 250,
    borderWidth: 1,
    borderColor: colors.border,
  },
  spinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.border,
    borderTopColor: colors.primary,
    marginBottom: spacing.md,
  },
  spinnerInner: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.border,
    borderTopColor: colors.secondary,
  },
  emoji: {
    fontSize: 36,
    position: 'absolute',
    top: 48,
    color: colors.primary,
    fontWeight: '700',
  },
  statusText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
