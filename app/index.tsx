import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PackCard } from '../src/components/PackCard';
import { useStickerPacks, useApiToken } from '../src/store/useStore';
import { deleteStickerPack } from '../src/services/stickerService';
import { colors, spacing, fontSize, borderRadius, glassCard } from '../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { packs, loading, refresh } = useStickerPacks();
  const { hasToken } = useApiToken();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleDeletePack = (packId: string, packName: string) => {
    Alert.alert(
      'Eliminar Pack',
      `¿Seguro que quieres eliminar "${packName}"? Se borrarán todos los stickers.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteStickerPack(packId);
            refresh();
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/settings')}
              hitSlop={8}
              style={styles.headerBtn}
            >
              <Ionicons name="cog-outline" size={22} color={colors.textSecondary} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
        }
      >
        {/* Ambient glow orbs */}
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>STICKER AI</Text>
          <Text style={styles.heroTitle}>Crea Stickers{'\n'}con IA</Text>
          <Text style={styles.heroSubtitle}>
            Genera stickers únicos para WhatsApp usando inteligencia artificial
          </Text>
        </View>

        {/* Token warning */}
        {!hasToken && (
          <Pressable style={styles.tokenWarning} onPress={() => router.push('/settings')}>
            <View style={styles.tokenIconWrap}>
              <Ionicons name="key" size={16} color={colors.accent} />
            </View>
            <Text style={styles.tokenWarningText}>
              Configura tu API token de Replicate para empezar
            </Text>
            <Ionicons name="arrow-forward" size={14} color={colors.accent} />
          </Pressable>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.actionCyan]}
            onPress={() => router.push('/create-pack')}
          >
            <View style={styles.actionGlow} />
            <View style={[styles.actionIcon, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Nuevo Pack</Text>
            <Text style={styles.actionDesc}>Crea un pack de stickers</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.actionPurple]}
            onPress={() => router.push('/generate')}
          >
            <View style={[styles.actionGlow, { backgroundColor: colors.neonPurple }]} />
            <View style={[styles.actionIcon, { backgroundColor: colors.secondaryMuted }]}>
              <Ionicons name="sparkles" size={24} color={colors.secondary} />
            </View>
            <Text style={styles.actionTitle}>Generar</Text>
            <Text style={styles.actionDesc}>Crear sticker con IA</Text>
          </Pressable>
        </View>

        {/* Packs list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Mis Packs</Text>
          </View>

          {packs.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyGlass}>
                <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No tienes packs todavía</Text>
                <Text style={styles.emptyDesc}>
                  Crea tu primer pack de stickers y genera imágenes con IA
                </Text>
              </View>
            </View>
          ) : (
            packs.map(pack => (
              <PackCard
                key={pack.id}
                pack={pack}
                onPress={() => router.push(`/pack/${pack.id}`)}
                onDelete={() => handleDeletePack(pack.id, pack.name)}
              />
            ))
          )}
        </View>
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
    paddingBottom: spacing.xxl * 2,
  },
  glowOrb1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.neonCyan,
    opacity: 0.04,
  },
  glowOrb2: {
    position: 'absolute',
    top: 120,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.neonPurple,
    opacity: 0.03,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  heroLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 44,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    lineHeight: 22,
  },
  tokenWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.15)',
    gap: spacing.sm,
  },
  tokenIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenWarningText: {
    flex: 1,
    color: colors.accent,
    fontSize: fontSize.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    ...glassCard,
    padding: spacing.md,
    overflow: 'hidden',
  },
  actionCyan: {
    borderColor: colors.borderCyan,
  },
  actionPurple: {
    borderColor: colors.borderPurple,
  },
  actionGlow: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    height: 1,
    backgroundColor: colors.neonCyan,
    opacity: 0.5,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
  },
  actionDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 3,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  emptyState: {
    paddingVertical: spacing.lg,
  },
  emptyGlass: {
    ...glassCard,
    alignItems: 'center',
    padding: spacing.xl,
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
    lineHeight: 20,
  },
});
