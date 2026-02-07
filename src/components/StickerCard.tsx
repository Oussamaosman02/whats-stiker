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
      <Image
        source={{ uri: sticker.uri }}
        style={[styles.image, { width: size - 8, height: size - 8 }]}
        resizeMode="contain"
      />
      {onDelete && (
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="close-circle" size={22} color={colors.danger} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    borderRadius: borderRadius.sm,
  },
  deleteButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
  },
});
