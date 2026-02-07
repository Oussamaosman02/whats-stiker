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
import { colors, spacing, fontSize, borderRadius } from '../src/theme';

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
      id: uuidv4(),
      name: name.trim(),
      author: author.trim() || 'StickerAI',
      stickers: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveStickerPack(pack);

    Alert.alert(
      'Pack creado',
      `"${pack.name}" está listo. ¿Quieres generar stickers ahora?`,
      [
        {
          text: 'Generar stickers',
          onPress: () => router.replace(`/generate?packId=${pack.id}`),
        },
        {
          text: 'Ir al pack',
          onPress: () => router.replace(`/pack/${pack.id}`),
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Nuevo Pack' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="albums" size={64} color={colors.primary} />
        </View>

        <Text style={styles.title}>Crear Pack de Stickers</Text>
        <Text style={styles.subtitle}>
          Los packs de WhatsApp necesitan entre 3 y 30 stickers.
          Puedes añadir stickers después de crear el pack.
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

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Consejos</Text>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={styles.tipText}>Mínimo 3 stickers para exportar a WhatsApp</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={styles.tipText}>Máximo 30 stickers por pack</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={styles.tipText}>Se redimensionan automáticamente a 512x512</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={styles.tipText}>Formato WebP optimizado para WhatsApp</Text>
          </View>
        </View>

        <Pressable
          style={[styles.createButton, !name.trim() && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!name.trim()}
        >
          <Ionicons name="add-circle" size={22} color={colors.background} />
          <Text style={styles.createButtonText}>Crear Pack</Text>
        </Pressable>
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
  iconContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: colors.background,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
