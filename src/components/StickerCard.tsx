import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Sticker } from '../types';
import { colors, borderRadius, spacing } from '../theme';

interface StickerCardProps {
  sticker: Sticker;
  onPress?: () => void;
  onDelete?: () => void;
  size?: number;
}

export function StickerCard({ sticker, onPress, onDelete, size = 100 }: StickerCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { width: size, height: size }]}
    >
      <View style={[styles.glowRing, { width: size - 2, height: size - 2 }]} />
      <Image
        source={{ uri: sticker.uri }}
        style={[styles.image, { width: size - 12, height: size - 12 }]}
        resizeMode="contain"
      />
      {onDelete && (
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <View style={styles.deleteInner}>
            <Ionicons name="close" size={14} color={colors.text} />
          </View>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: borderRadius.md - 1,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    opacity: 0.3,
  },
  image: {
    borderRadius: borderRadius.sm,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  deleteInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
