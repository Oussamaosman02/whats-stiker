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
import { colors, spacing, fontSize, borderRadius, glassCard } from '../src/theme';

export default function SettingsScreen() {
  const { token, saveToken, clearToken, hasToken } = useApiToken();
  const [inputToken, setInputToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  useEffect(() => { if (token) setInputToken(token); }, [token]);

  const handleSave = async () => {
    const trimmed = inputToken.trim();
    if (!trimmed) { Alert.alert('Error', 'Introduce un token válido.'); return; }
    if (!trimmed.startsWith('r8_')) {
      Alert.alert('Token sospechoso', 'Los tokens de Replicate normalmente empiezan por "r8_". ¿Guardarlo igualmente?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Guardar', onPress: () => saveToken(trimmed) },
      ]);
      return;
    }
    await saveToken(trimmed);
    Alert.alert('Guardado', 'Token guardado correctamente.');
  };

  const handleClear = () => {
    Alert.alert('Eliminar Token', '¿Seguro? No podrás generar imágenes.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { clearToken(); setInputToken(''); } },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Ajustes' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.bgGlow1} />
        <View style={styles.bgGlow2} />

        {/* API Token */}
        <View style={styles.section}>
          <View style={styles.sectionGlow} />
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrap}>
              <Ionicons name="key" size={18} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>API Token</Text>
          </View>

          <Text style={styles.description}>
            Necesitas un token de la API de Replicate para generar imágenes con IA. Es gratuito para empezar.
          </Text>

          <Pressable
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://replicate.com/account/api-tokens')}
          >
            <Ionicons name="open-outline" size={14} color={colors.primary} />
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
            <Pressable style={styles.eyeButton} onPress={() => setShowToken(!showToken)}>
              <Ionicons name={showToken ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark" size={18} color="#000" />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </Pressable>
            {hasToken && (
              <Pressable style={styles.clearButton} onPress={handleClear}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            )}
          </View>

          {hasToken && (
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Token configurado</Text>
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={[styles.sectionGlow, { backgroundColor: colors.neonPurple }]} />
          <View style={styles.sectionHeader}>
            <View style={[styles.iconWrap, { backgroundColor: colors.secondaryMuted }]}>
              <Ionicons name="information-circle" size={18} color={colors.secondary} />
            </View>
            <Text style={styles.sectionTitle}>Acerca de</Text>
          </View>

          <Text style={styles.aboutText}>
            StickerAI te permite crear stickers personalizados para WhatsApp usando modelos de inteligencia artificial.
          </Text>

          {[
            ['Versión', '1.0.0'],
            ['Modelos IA', 'FLUX, SDXL, Playground, Kandinsky'],
            ['Formato stickers', '512x512 WebP'],
          ].map(([label, value], i) => (
            <View key={i} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  bgGlow1: {
    position: 'absolute', top: -60, right: -40, width: 180, height: 180,
    borderRadius: 90, backgroundColor: colors.neonCyan, opacity: 0.03,
  },
  bgGlow2: {
    position: 'absolute', top: 200, left: -60, width: 200, height: 200,
    borderRadius: 100, backgroundColor: colors.neonPurple, opacity: 0.02,
  },
  section: {
    ...glassCard, padding: spacing.md, marginBottom: spacing.md, overflow: 'hidden',
  },
  sectionGlow: {
    position: 'absolute', top: 0, left: spacing.xl, right: spacing.xl,
    height: 1, backgroundColor: colors.neonCyan, opacity: 0.4,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md,
  },
  iconWrap: {
    width: 32, height: 32, borderRadius: borderRadius.sm, backgroundColor: colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, letterSpacing: 0.3 },
  description: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  linkButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  linkText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.glass,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  input: { flex: 1, color: colors.text, fontSize: fontSize.sm, padding: spacing.md, fontFamily: 'monospace' },
  eyeButton: { padding: spacing.md },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  saveButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: 12,
  },
  saveButtonText: { color: '#000', fontWeight: '700', fontSize: fontSize.md },
  clearButton: {
    backgroundColor: colors.dangerMuted, borderRadius: borderRadius.md, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,59,92,0.15)',
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusText: { color: colors.success, fontSize: fontSize.sm, fontWeight: '500' },
  aboutText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  infoLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  infoValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: '500' },
});
