import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';
import { StickerPack } from '../src/types';
import { saveStickerPack } from '../src/services/stickerService';
import { colors, spacing, fontSize, borderRadius, glassCard } from '../src/theme';

export default function CreatePackScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Dale un nombre a tu pack de stickers.');
      return;
    }
    const pack: StickerPack = {
      id: uuidv4(), name: name.trim(), author: author.trim() || 'StickerAI',
      stickers: [], createdAt: Date.now(), updatedAt: Date.now(),
    };
    await saveStickerPack(pack);
    Alert.alert('Pack creado', `"${pack.name}" está listo. ¿Quieres generar stickers ahora?`, [
      { text: 'Generar stickers', onPress: () => router.replace(`/generate?packId=${pack.id}`) },
      { text: 'Ir al pack', onPress: () => router.replace(`/pack/${pack.id}`) },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Nuevo Pack' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.glowOrb} />

        <View style={styles.iconContainer}>
          <View style={styles.iconRing}>
            <Ionicons name="albums" size={40} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.title}>Crear Pack de Stickers</Text>
        <Text style={styles.subtitle}>
          Los packs de WhatsApp necesitan entre 3 y 30 stickers.{'\n'}Puedes añadirlos después.
        </Text>

        <Text style={styles.label}>Nombre del Pack</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ej: Mis gatitos, Memes locos..."
          placeholderTextColor={colors.textMuted}
          maxLength={50}
        />

        <Text style={styles.label}>Autor</Text>
        <TextInput
          style={styles.input}
          value={author}
          onChangeText={setAuthor}
          placeholder="Tu nombre (opcional)"
          placeholderTextColor={colors.textMuted}
          maxLength={50}
        />

        <View style={styles.tipsCard}>
          <View style={styles.tipsGlow} />
          <Text style={styles.tipsTitle}>Requisitos WhatsApp</Text>
          {[
            'Mínimo 3 stickers para exportar',
            'Máximo 30 stickers por pack',
            'Auto-redimensionado a 512x512',
            'Formato WebP optimizado',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.createButton, !name.trim() && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!name.trim()}
        >
          <Ionicons name="add" size={20} color="#000" />
          <Text style={styles.createButtonText}>Crear Pack</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  glowOrb: {
    position: 'absolute', top: -40, left: '30%', width: 200, height: 200,
    borderRadius: 100, backgroundColor: colors.neonCyan, opacity: 0.03,
  },
  iconContainer: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md },
  iconRing: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryMuted,
    borderWidth: 2, borderColor: colors.borderCyan, alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxl, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm,
    marginTop: spacing.md, letterSpacing: 1, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.glass, borderRadius: borderRadius.md, padding: spacing.md,
    color: colors.text, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border,
  },
  tipsCard: {
    ...glassCard, padding: spacing.md, marginTop: spacing.xl, overflow: 'hidden',
  },
  tipsGlow: {
    position: 'absolute', top: 0, left: spacing.xl, right: spacing.xl,
    height: 1, backgroundColor: colors.neonPurple, opacity: 0.4,
  },
  tipsTitle: {
    fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, letterSpacing: 0.3,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  tipDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary },
  tipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  createButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 14, marginTop: spacing.xl,
    shadowColor: colors.neonCyan, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  createButtonDisabled: { opacity: 0.4 },
  createButtonText: { color: '#000', fontSize: fontSize.lg, fontWeight: '800', letterSpacing: 0.5 },
});
