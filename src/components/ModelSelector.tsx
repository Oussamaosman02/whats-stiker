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

const MODEL_COLORS: Record<string, string> = {
  'sdxl': colors.neonPink,
  'flux-schnell': colors.neonCyan,
  'flux-dev': colors.neonPurple,
  'playground-v2': colors.neonGreen,
  'kandinsky': colors.neonBlue,
};

export function ModelSelector({ models, selectedModel, onSelect }: ModelSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {models.map(model => {
        const isSelected = model.id === selectedModel.id;
        const color = MODEL_COLORS[model.id] || colors.primary;
        return (
          <Pressable
            key={model.id}
            style={[
              styles.card,
              isSelected && { borderColor: color + '60', backgroundColor: color + '10' },
            ]}
            onPress={() => onSelect(model)}
          >
            {isSelected && (
              <View style={[styles.neonBar, { backgroundColor: color }]} />
            )}
            <View style={[
              styles.iconContainer,
              { backgroundColor: color + '15' },
              isSelected && { backgroundColor: color + '25', borderColor: color + '40', borderWidth: 1 },
            ]}>
              <Ionicons
                name={(MODEL_ICONS[model.id] || 'image') as keyof typeof Ionicons.glyphMap}
                size={22}
                color={isSelected ? color : colors.textMuted}
              />
            </View>
            <Text style={[styles.modelName, isSelected && { color }]} numberOfLines={1}>
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
    width: 135,
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  neonBar: {
    position: 'absolute',
    top: 0,
    left: spacing.md,
    right: spacing.md,
    height: 2,
    borderRadius: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  modelName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  modelDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 15,
  },
});
