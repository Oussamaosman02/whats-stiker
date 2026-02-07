import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StickerPack } from '../types';
import { colors, borderRadius, spacing, fontSize } from '../theme';

interface PackCardProps {
  pack: StickerPack;
  onPress: () => void;
  onDelete?: () => void;
}

export function PackCard({ pack, onPress, onDelete }: PackCardProps) {
  const previewStickers = pack.stickers.slice(0, 4);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{pack.name}</Text>
          <Text style={styles.count}>{pack.stickers.length} stickers</Text>
        </View>
        {onDelete && (
          <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        )}
      </View>

      <View style={styles.preview}>
        {previewStickers.map(sticker => (
          <Image
            key={sticker.id}
            source={{ uri: sticker.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        ))}
        {pack.stickers.length === 0 && (
          <View style={styles.emptyPreview}>
            <Ionicons name="images-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>Sin stickers</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.author}>{pack.author}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  count: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 80,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  author: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
