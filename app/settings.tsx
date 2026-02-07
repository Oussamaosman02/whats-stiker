import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApiToken } from '../src/store/useStore';
import { colors, spacing, fontSize, borderRadius } from '../src/theme';

export default function SettingsScreen() {
  const { token, saveToken, clearToken, hasToken } = useApiToken();
  const [inputToken, setInputToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (token) {
      setInputToken(token);
    }
  }, [token]);

  const handleSave = async () => {
    const trimmed = inputToken.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Introduce un token válido.');
      return;
    }
    if (!trimmed.startsWith('r8_')) {
      Alert.alert(
        'Token sospechoso',
        'Los tokens de Replicate normalmente empiezan por "r8_". ¿Quieres guardarlo igualmente?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Guardar', onPress: () => saveToken(trimmed) },
        ]
      );
      return;
    }
    await saveToken(trimmed);
    Alert.alert('Guardado', 'Token guardado correctamente.');
  };

  const handleClear = () => {
    Alert.alert(
      'Eliminar Token',
      '¿Seguro que quieres eliminar el token? No podrás generar imágenes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            clearToken();
            setInputToken('');
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Ajustes' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* API Token */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="key" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>API Token de Replicate</Text>
          </View>

          <Text style={styles.description}>
            Necesitas un token de la API de Replicate para generar imágenes con IA.
            Es gratuito para empezar.
          </Text>

          <Pressable
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://replicate.com/account/api-tokens')}
          >
            <Ionicons name="open-outline" size={16} color={colors.primary} />
            <Text style={styles.linkText}>Obtener token en replicate.com</Text>
          </Pressable>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputToken}
              onChangeText={setInputToken}
              placeholder="r8_xxxxxxxxxxxxxxxxxxxx"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showToken}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowToken(!showToken)}
            >
              <Ionicons
                name={showToken ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark" size={20} color={colors.background} />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </Pressable>
            {hasToken && (
              <Pressable style={styles.clearButton} onPress={handleClear}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            )}
          </View>

          {hasToken && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.statusText}>Token configurado</Text>
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color={colors.secondary} />
            <Text style={styles.sectionTitle}>Acerca de</Text>
          </View>

          <Text style={styles.aboutText}>
            StickerAI te permite crear stickers personalizados para WhatsApp usando modelos
            de inteligencia artificial. Genera imágenes únicas, organízalas en packs y
            compártelas directamente.
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versión</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Modelos IA</Text>
            <Text style={styles.infoValue}>FLUX, SDXL, Playground, Kandinsky</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Formato stickers</Text>
            <Text style={styles.infoValue}>512x512 WebP</Text>
          </View>
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
  section: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    padding: spacing.md,
    fontFamily: 'monospace',
  },
  eyeButton: {
    padding: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  clearButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  statusText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  aboutText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
});
