import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StickerCard } from '../../src/components/StickerCard';
import {
  loadStickerPack,
  deleteStickerFromPack,
  exportStickerPackForWhatsApp,
  shareSingleSticker,
} from '../../src/services/stickerService';
import { StickerPack, Sticker } from '../../src/types';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme';

export default function PackDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pack, setPack] = useState<StickerPack | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPack = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const loaded = await loadStickerPack(id);
    setPack(loaded);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadPack();
    }, [loadPack])
  );

  const handleDeleteSticker = (sticker: Sticker) => {
    Alert.alert(
      'Eliminar Sticker',
      '¿Seguro que quieres eliminar este sticker?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!pack) return;
            const updated = await deleteStickerFromPack(pack.id, sticker.id);
            setPack(updated);
          },
        },
      ]
    );
  };

  const handleShareSticker = async (sticker: Sticker) => {
    try {
      await shareSingleSticker(sticker);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo compartir.');
    }
  };

  const handleExportWhatsApp = async () => {
    if (!pack) return;

    if (pack.stickers.length < 3) {
      Alert.alert(
        'Faltan stickers',
        `Necesitas al menos 3 stickers para exportar a WhatsApp. Tienes ${pack.stickers.length}.`,
        [
          {
            text: 'Generar más',
            onPress: () => router.push(`/generate?packId=${pack.id}`),
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
      return;
    }

    try {
      await exportStickerPackForWhatsApp(pack);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al exportar.');
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cargando...' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando pack...</Text>
        </View>
      </>
    );
  }

  if (!pack) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error' }} />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.danger} />
          <Text style={styles.errorText}>Pack no encontrado</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: pack.name,
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/generate?packId=${pack.id}`)}
              hitSlop={8}
            >
              <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Pack info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.packName}>{pack.name}</Text>
              <Text style={styles.packAuthor}>por {pack.author}</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{pack.stickers.length}</Text>
              <Text style={styles.countLabel}>stickers</Text>
            </View>
          </View>

          {/* Progress bar for WhatsApp */}
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                {pack.stickers.length < 3
                  ? `Necesitas ${3 - pack.stickers.length} más para WhatsApp`
                  : pack.stickers.length <= 30
                  ? 'Listo para WhatsApp'
                  : 'Máximo 30 stickers permitidos'}
              </Text>
              <Text style={styles.progressCount}>
                {Math.min(pack.stickers.length, 30)}/30
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((pack.stickers.length / 30) * 100, 100)}%`,
                    backgroundColor:
                      pack.stickers.length < 3
                        ? colors.accent
                        : pack.stickers.length <= 30
                        ? colors.primary
                        : colors.danger,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push(`/generate?packId=${pack.id}`)}
          >
            <Ionicons name="sparkles" size={22} color={colors.secondary} />
            <Text style={styles.actionText}>Generar con IA</Text>
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              styles.whatsappButton,
              pack.stickers.length < 3 && styles.actionDisabled,
            ]}
            onPress={handleExportWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            <Text style={[styles.actionText, { color: '#25D366' }]}>
              Añadir a WhatsApp
            </Text>
          </Pressable>
        </View>

        {/* Stickers grid */}
        <Text style={styles.sectionTitle}>Stickers</Text>
        {pack.stickers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin stickers todavía</Text>
            <Text style={styles.emptyDesc}>
              Genera stickers con IA o importa imágenes de tu galería
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push(`/generate?packId=${pack.id}`)}
            >
              <Ionicons name="sparkles" size={18} color={colors.background} />
              <Text style={styles.emptyButtonText}>Generar stickers</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.stickersGrid}>
            {pack.stickers.map(sticker => (
              <View key={sticker.id} style={styles.stickerWrapper}>
                <StickerCard
                  sticker={sticker}
                  size={100}
                  onPress={() => handleShareSticker(sticker)}
                  onDelete={() => handleDeleteSticker(sticker)}
                />
                {sticker.prompt && (
                  <Text style={styles.stickerPrompt} numberOfLines={1}>
                    {sticker.prompt}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  packName: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  packAuthor: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  countText: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
  },
  countLabel: {
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  progressSection: {
    marginTop: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  progressCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  whatsappButton: {
    borderColor: '#25D366' + '40',
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyDesc: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 260,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  emptyButtonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  stickerWrapper: {
    alignItems: 'center',
    width: 108,
    marginBottom: spacing.sm,
  },
  stickerPrompt: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    maxWidth: 100,
    textAlign: 'center',
  },
});
