export interface Sticker {
  id: string;
  uri: string;
  prompt?: string;
  model?: string;
  createdAt: number;
}

export interface StickerPack {
  id: string;
  name: string;
  author: string;
  trayImageUri?: string;
  stickers: Sticker[];
  createdAt: number;
  updatedAt: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  replicateId: string;
  inputFormat: 'text-to-image' | 'image-to-image';
  defaultParams: Record<string, unknown>;
}

export interface GenerationRequest {
  model: AIModel;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
}

export interface GenerationResult {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string[];
  error?: string;
}
