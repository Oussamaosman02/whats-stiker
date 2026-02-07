import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
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
import { colors, spacing, fontSize, borderRadius, glassCard } from '../../src/theme';

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

  useFocusEffect(useCallback(() => { loadPack(); }, [loadPack]));

  const handleDeleteSticker = (sticker: Sticker) => {
    Alert.alert('Eliminar Sticker', '¿Seguro que quieres eliminar este sticker?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        if (!pack) return;
        const updated = await deleteStickerFromPack(pack.id, sticker.id);
        setPack(updated);
      }},
    ]);
  };

  const handleShareSticker = async (sticker: Sticker) => {
    try { await shareSingleSticker(sticker); }
    catch (error) { Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo compartir.'); }
  };

  const handleExportWhatsApp = async () => {
    if (!pack) return;
    if (pack.stickers.length < 3) {
      Alert.alert('Faltan stickers', `Necesitas al menos 3. Tienes ${pack.stickers.length}.`, [
        { text: 'Generar más', onPress: () => router.push(`/generate?packId=${pack.id}`) },
        { text: 'OK', style: 'cancel' },
      ]);
      return;
    }
    try { await exportStickerPackForWhatsApp(pack); }
    catch (error) { Alert.alert('Error', error instanceof Error ? error.message : 'Error al exportar.'); }
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

  const progressPct = Math.min((pack.stickers.length / 30) * 100, 100);
  const progressColor = pack.stickers.length < 3 ? colors.accent : pack.stickers.length <= 30 ? colors.primary : colors.danger;

  return (
    <>
      <Stack.Screen
        options={{
          title: pack.name,
          headerRight: () => (
            <Pressable onPress={() => router.push(`/generate?packId=${pack.id}`)} hitSlop={8} style={styles.headerBtn}>
              <Ionicons name="add" size={20} color={colors.primary} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.bgGlow1} />
        <View style={styles.bgGlow2} />

        {/* Pack info */}
        <View style={styles.infoCard}>
          <View style={styles.infoGlow} />
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.packName}>{pack.name}</Text>
              <View style={styles.authorRow}>
                <Ionicons name="person-outline" size={11} color={colors.textMuted} />
                <Text style={styles.packAuthor}>{pack.author}</Text>
              </View>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{pack.stickers.length}</Text>
              <Text style={styles.countLabel}>stickers</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                {pack.stickers.length < 3 ? `Necesitas ${3 - pack.stickers.length} más` : pack.stickers.length <= 30 ? 'Listo para WhatsApp' : 'Máx. 30 stickers'}
              </Text>
              <Text style={[styles.progressCount, { color: progressColor }]}>
                {Math.min(pack.stickers.length, 30)}/30
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: progressColor }]} />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButton} onPress={() => router.push(`/generate?packId=${pack.id}`)}>
            <Ionicons name="sparkles" size={18} color={colors.secondary} />
            <Text style={styles.actionText}>Generar con IA</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.whatsappBtn, pack.stickers.length < 3 && styles.actionDisabled]}
            onPress={handleExportWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={18} color={colors.whatsapp} />
            <Text style={[styles.actionText, { color: colors.whatsapp }]}>WhatsApp</Text>
          </Pressable>
        </View>

        {/* Stickers */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle}>Stickers</Text>
        </View>

        {pack.stickers.length === 0 ? (
          <View style={styles.emptyGlass}>
            <Ionicons name="cube-outline" size={44} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin stickers todavía</Text>
            <Text style={styles.emptyDesc}>Genera stickers con IA o importa imágenes</Text>
            <Pressable style={styles.emptyButton} onPress={() => router.push(`/generate?packId=${pack.id}`)}>
              <Ionicons name="sparkles" size={16} color="#000" />
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
                  <Text style={styles.stickerPrompt} numberOfLines={1}>{sticker.prompt}</Text>
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
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl * 2 },
  bgGlow1: {
    position: 'absolute', top: -50, right: -30, width: 180, height: 180,
    borderRadius: 90, backgroundColor: colors.neonCyan, opacity: 0.03,
  },
  bgGlow2: {
    position: 'absolute', top: 200, left: -60, width: 200, height: 200,
    borderRadius: 100, backgroundColor: colors.neonPurple, opacity: 0.02,
  },
  headerBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primaryMuted,
    borderWidth: 1, borderColor: colors.borderCyan, alignItems: 'center', justifyContent: 'center',
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: spacing.md },
  loadingText: { color: colors.textSecondary, fontSize: fontSize.md },
  errorText: { color: colors.danger, fontSize: fontSize.lg, fontWeight: '600' },

  infoCard: { ...glassCard, padding: spacing.md, marginBottom: spacing.md, overflow: 'hidden' },
  infoGlow: {
    position: 'absolute', top: 0, left: spacing.xl, right: spacing.xl,
    height: 1, backgroundColor: colors.neonCyan, opacity: 0.4,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  packName: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, letterSpacing: 0.3 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 3 },
  packAuthor: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  countBadge: {
    backgroundColor: colors.primaryMuted, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'center',
    borderWidth: 1, borderColor: colors.borderCyan,
  },
  countText: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary },
  countLabel: { fontSize: 9, color: colors.primary, letterSpacing: 1, textTransform: 'uppercase' },

  progressSection: { marginTop: spacing.xs },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  progressLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  progressCount: { fontSize: fontSize.xs, fontWeight: '700' },
  progressBar: { height: 4, backgroundColor: colors.glass, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },

  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    ...glassCard, padding: spacing.md,
  },
  whatsappBtn: { borderColor: 'rgba(37, 211, 102, 0.2)' },
  actionDisabled: { opacity: 0.4 },
  actionText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondary },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, letterSpacing: 0.5 },

  emptyGlass: { ...glassCard, alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textSecondary, marginTop: spacing.md },
  emptyDesc: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, maxWidth: 260 },
  emptyButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primary,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginTop: spacing.lg,
  },
  emptyButtonText: { color: '#000', fontWeight: '700', fontSize: fontSize.md },

  stickersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  stickerWrapper: { alignItems: 'center', width: 108, marginBottom: spacing.sm },
  stickerPrompt: { fontSize: 10, color: colors.textMuted, marginTop: 2, maxWidth: 100, textAlign: 'center' },
});
