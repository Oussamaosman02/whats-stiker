import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIModel } from '../types';
import { colors, borderRadius, spacing, fontSize } from '../theme';

interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: AIModel;
  onSelect: (model: AIModel) => void;
}

const MODEL_ICONS: Record<string, string> = {
  'sdxl': 'color-palette',
  'flux-schnell': 'flash',
  'flux-dev': 'sparkles',
  'playground-v2': 'game-controller',
  'kandinsky': 'brush',
};

export function ModelSelector({ models, selectedModel, onSelect }: ModelSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {models.map(model => {
        const isSelected = model.id === selectedModel.id;
        return (
          <Pressable
            key={model.id}
            style={[styles.card, isSelected && styles.selectedCard]}
            onPress={() => onSelect(model)}
          >
            <View style={[styles.iconContainer, isSelected && styles.selectedIcon]}>
              <Ionicons
                name={(MODEL_ICONS[model.id] || 'image') as keyof typeof Ionicons.glyphMap}
                size={24}
                color={isSelected ? colors.background : colors.primary}
              />
            </View>
            <Text style={[styles.modelName, isSelected && styles.selectedText]} numberOfLines={1}>
              {model.name}
            </Text>
            <Text style={styles.modelDesc} numberOfLines={2}>
              {model.description}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: spacing.sm,
  },
  card: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  selectedIcon: {
    backgroundColor: colors.primary,
  },
  modelName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  selectedText: {
    color: colors.primary,
  },
  modelDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
