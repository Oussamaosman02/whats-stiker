import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { ModelSelector } from '../src/components/ModelSelector';
import { GeneratingOverlay } from '../src/components/GeneratingOverlay';
import { useApiToken } from '../src/store/useStore';
import { AI_MODELS, createPrediction, pollPrediction } from '../src/services/replicateApi';
import { downloadAndProcessImage, processLocalImage, saveStickerPack, loadStickerPack } from '../src/services/stickerService';
import { AIModel, Sticker, StickerPack } from '../src/types';
import { colors, spacing, fontSize, borderRadius } from '../src/theme';

export default function GenerateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ packId?: string }>();
  const { hasToken } = useApiToken();

  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[1]); // FLUX Schnell default
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [numOutputs, setNumOutputs] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('starting');
  const [results, setResults] = useState<string[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!hasToken) {
      Alert.alert('Token requerido', 'Configura tu token de Replicate en Ajustes.', [
        { text: 'Ir a Ajustes', onPress: () => router.push('/settings') },
        { text: 'Cancelar', style: 'cancel' },
      ]);
      return;
    }

    if (!prompt.trim()) {
      Alert.alert('Prompt vacío', 'Describe lo que quieres generar.');
      return;
    }

    setGenerating(true);
    setGenStatus('starting');
    setResults([]);
    setSelectedResults(new Set());

    try {
      const prediction = await createPrediction(
        selectedModel,
        prompt.trim(),
        negativePrompt.trim() || undefined,
        numOutputs,
      );

      if (prediction.status === 'succeeded' && prediction.output) {
        setResults(prediction.output);
        setGenStatus('succeeded');
      } else if (prediction.status === 'failed') {
        throw new Error(prediction.error || 'La generación falló.');
      } else {
        // Poll for results
        const result = await pollPrediction(prediction.id, (status) => {
          setGenStatus(status);
        });

        if (result.status === 'succeeded' && result.output) {
          setResults(result.output);
        } else {
          throw new Error(result.error || 'La generación falló.');
        }
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setGenerating(false);
    }
  };

  const toggleResult = (index: number) => {
    setSelectedResults(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSaveStickers = async () => {
    const toSave = results.filter((_, i) => selectedResults.has(i));
    if (toSave.length === 0) {
      Alert.alert('Selecciona', 'Selecciona al menos una imagen para guardar.');
      return;
    }

    try {
      let pack: StickerPack;

      if (params.packId) {
        const existing = await loadStickerPack(params.packId);
        if (existing) {
          pack = existing;
        } else {
          Alert.alert('Error', 'Pack no encontrado.');
          return;
        }
      } else {
        // Create a quick pack
        pack = {
          id: uuidv4(),
          name: prompt.trim().slice(0, 30) || 'Mis Stickers',
          author: 'StickerAI',
          stickers: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      }

      for (const imageUrl of toSave) {
        const stickerId = uuidv4();
        const uri = await downloadAndProcessImage(imageUrl, stickerId);
        const sticker: Sticker = {
          id: stickerId,
          uri,
          prompt: prompt.trim(),
          model: selectedModel.name,
          createdAt: Date.now(),
        };
        pack.stickers.push(sticker);
      }

      pack.updatedAt = Date.now();
      await saveStickerPack(pack);

      Alert.alert(
        'Guardado',
        `${toSave.length} sticker(s) guardados en "${pack.name}"`,
        [
          { text: 'Ver Pack', onPress: () => router.replace(`/pack/${pack.id}`) },
          { text: 'Seguir generando', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al guardar');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      try {
        let pack: StickerPack;

        if (params.packId) {
          const existing = await loadStickerPack(params.packId);
          if (existing) {
            pack = existing;
          } else {
            pack = {
              id: uuidv4(),
              name: 'Mis Stickers',
              author: 'StickerAI',
              stickers: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
          }
        } else {
          pack = {
            id: uuidv4(),
            name: 'Stickers importados',
            author: 'StickerAI',
            stickers: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }

        const stickerId = uuidv4();
        const uri = await processLocalImage(asset.uri, stickerId);
        pack.stickers.push({
          id: stickerId,
          uri,
          createdAt: Date.now(),
        });
        pack.updatedAt = Date.now();
        await saveStickerPack(pack);

        Alert.alert('Guardado', 'Imagen importada como sticker.', [
          { text: 'Ver Pack', onPress: () => router.replace(`/pack/${pack.id}`) },
          { text: 'OK' },
        ]);
      } catch (error) {
        Alert.alert('Error', 'No se pudo procesar la imagen.');
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Generar Sticker' }} />
      <View style={styles.container}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Model selector */}
          <Text style={styles.label}>Modelo de IA</Text>
          <ModelSelector
            models={AI_MODELS}
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
          />

          {/* Prompt */}
          <Text style={styles.label}>Describe tu sticker</Text>
          <TextInput
            style={styles.promptInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Ej: un gato astronauta con casco espacial, kawaii"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />

          {/* Import from gallery */}
          <Pressable style={styles.importButton} onPress={handlePickImage}>
            <Ionicons name="image-outline" size={20} color={colors.secondary} />
            <Text style={styles.importText}>O importar imagen de la galería</Text>
          </Pressable>

          {/* Advanced options */}
          <Pressable
            style={styles.advancedToggle}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text style={styles.advancedText}>Opciones avanzadas</Text>
            <Ionicons
              name={showAdvanced ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>

          {showAdvanced && (
            <View style={styles.advancedSection}>
              <Text style={styles.label}>Prompt negativo</Text>
              <TextInput
                style={styles.input}
                value={negativePrompt}
                onChangeText={setNegativePrompt}
                placeholder="Lo que NO quieres en la imagen"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.label}>Cantidad de imágenes: {numOutputs}</Text>
              <View style={styles.numRow}>
                {[1, 2, 3, 4].map(n => (
                  <Pressable
                    key={n}
                    style={[styles.numButton, numOutputs === n && styles.numButtonActive]}
                    onPress={() => setNumOutputs(n)}
                  >
                    <Text style={[styles.numText, numOutputs === n && styles.numTextActive]}>
                      {n}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Results */}
          {results.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.label}>Resultados - toca para seleccionar</Text>
              <View style={styles.resultsGrid}>
                {results.map((uri, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.resultCard,
                      selectedResults.has(index) && styles.resultSelected,
                    ]}
                    onPress={() => toggleResult(index)}
                  >
                    <Image source={{ uri }} style={styles.resultImage} resizeMode="contain" />
                    {selectedResults.has(index) && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>

              <Pressable style={styles.saveButton} onPress={handleSaveStickers}>
                <Ionicons name="download" size={20} color={colors.background} />
                <Text style={styles.saveButtonText}>
                  Guardar {selectedResults.size > 0 ? `(${selectedResults.size})` : ''} como stickers
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Generate button */}
        <View style={styles.bottomBar}>
          <Pressable
            style={[styles.generateButton, (!prompt.trim() || generating) && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={!prompt.trim() || generating}
          >
            <Ionicons name="sparkles" size={22} color={colors.background} />
            <Text style={styles.generateButtonText}>Generar Sticker</Text>
          </Pressable>
        </View>

        <GeneratingOverlay
          visible={generating}
          status={genStatus}
          message={`Usando ${selectedModel.name}`}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  promptInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  importText: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  advancedText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  advancedSection: {
    paddingBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  numRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  numButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  numButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  numText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  numTextActive: {
    color: colors.background,
  },
  resultsSection: {
    marginTop: spacing.lg,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  resultCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  resultSelected: {
    borderColor: colors.primary,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: colors.background,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
