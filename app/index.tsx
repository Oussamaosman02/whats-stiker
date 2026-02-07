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
import { colors, spacing, fontSize, borderRadius } from '../src/theme';

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
          title: 'StickerAI',
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
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
        {/* Hero section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Crea Stickers con IA</Text>
          <Text style={styles.heroSubtitle}>
            Genera stickers únicos para WhatsApp usando inteligencia artificial
          </Text>
        </View>

        {/* Token warning */}
        {!hasToken && (
          <Pressable style={styles.tokenWarning} onPress={() => router.push('/settings')}>
            <Ionicons name="key-outline" size={20} color={colors.accent} />
            <Text style={styles.tokenWarningText}>
              Configura tu API token de Replicate para empezar
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </Pressable>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/create-pack')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Nuevo Pack</Text>
            <Text style={styles.actionDesc}>Crea un pack de stickers</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/generate')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="sparkles" size={28} color={colors.secondary} />
            </View>
            <Text style={styles.actionTitle}>Generar</Text>
            <Text style={styles.actionDesc}>Crear sticker con IA</Text>
          </Pressable>
        </View>

        {/* Packs list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Packs de Stickers</Text>
          {packs.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No tienes packs todavía</Text>
              <Text style={styles.emptyDesc}>
                Crea tu primer pack de stickers y genera imágenes con IA
              </Text>
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
    paddingBottom: spacing.xxl,
  },
  hero: {
    paddingVertical: spacing.xl,
  },
  heroTitle: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  tokenWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent + '30',
    gap: spacing.sm,
  },
  tokenWarningText: {
    flex: 1,
    color: colors.accent,
    fontSize: fontSize.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  actionDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
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
});
