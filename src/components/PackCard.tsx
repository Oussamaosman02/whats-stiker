import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StickerPack } from '../types';
import { colors, borderRadius, spacing, fontSize, glassCard } from '../theme';

interface PackCardProps {
  pack: StickerPack;
  onPress: () => void;
  onDelete?: () => void;
}

export function PackCard({ pack, onPress, onDelete }: PackCardProps) {
  const previewStickers = pack.stickers.slice(0, 4);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.glowLine} />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{pack.name}</Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{pack.stickers.length}</Text>
          </View>
        </View>
        {onDelete && (
          <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        )}
      </View>

      <View style={styles.preview}>
        {previewStickers.map(sticker => (
          <View key={sticker.id} style={styles.previewWrap}>
            <Image
              source={{ uri: sticker.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        ))}
        {pack.stickers.length === 0 && (
          <View style={styles.emptyPreview}>
            <Ionicons name="cube-outline" size={28} color={colors.textMuted} />
            <Text style={styles.emptyText}>Pack vacío</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.authorRow}>
          <Ionicons name="person-outline" size={12} color={colors.textMuted} />
          <Text style={styles.author}>{pack.author}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    ...glassCard,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  glowLine: {
    position: 'absolute',
    top: 0,
    left: spacing.xl,
    right: spacing.xl,
    height: 1,
    backgroundColor: colors.primary,
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
  },
  countPill: {
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.borderCyan,
  },
  countText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: spacing.xs,
    backgroundColor: colors.dangerMuted,
    borderRadius: borderRadius.sm,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 76,
    gap: spacing.sm,
  },
  previewWrap: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: 54,
    height: 54,
    borderRadius: borderRadius.sm - 2,
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  author: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
