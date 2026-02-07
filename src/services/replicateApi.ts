import { AIModel, GenerationResult } from '../types';

const REPLICATE_API_URL = 'https://api.replicate.com/v1';

let apiToken: string | null = null;

export function setReplicateToken(token: string) {
  apiToken = token;
}

export function getReplicateToken(): string | null {
  return apiToken;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'sdxl',
    name: 'Stable Diffusion XL',
    description: 'Modelo versátil de alta calidad para generar imágenes creativas',
    replicateId: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
    inputFormat: 'text-to-image',
    defaultParams: {
      width: 512,
      height: 512,
      num_outputs: 1,
      scheduler: 'K_EULER',
      num_inference_steps: 25,
      guidance_scale: 7.5,
    },
  },
  {
    id: 'flux-schnell',
    name: 'FLUX Schnell',
    description: 'Generación ultra-rápida con calidad excelente',
    replicateId: 'black-forest-labs/flux-schnell',
    inputFormat: 'text-to-image',
    defaultParams: {
      num_outputs: 1,
      aspect_ratio: '1:1',
      output_format: 'png',
      output_quality: 90,
    },
  },
  {
    id: 'flux-dev',
    name: 'FLUX Dev',
    description: 'Alta calidad y detalle, ideal para stickers artísticos',
    replicateId: 'black-forest-labs/flux-dev',
    inputFormat: 'text-to-image',
    defaultParams: {
      num_outputs: 1,
      aspect_ratio: '1:1',
      output_format: 'png',
      output_quality: 90,
      guidance: 3.5,
      num_inference_steps: 28,
    },
  },
  {
    id: 'playground-v2',
    name: 'Playground v2.5',
    description: 'Excelente para arte estilizado y caricaturas',
    replicateId: 'playgroundai/playground-v2.5-1024px-aesthetic:a45f82a1382bed5c7aeb861dac7c7d191b0fdf74d8d57c4a0e6ed7d4d0bf7d24',
    inputFormat: 'text-to-image',
    defaultParams: {
      width: 512,
      height: 512,
      num_outputs: 1,
      scheduler: 'DPMSolver++',
      num_inference_steps: 25,
      guidance_scale: 3,
    },
  },
  {
    id: 'kandinsky',
    name: 'Kandinsky 2.2',
    description: 'Estilo artístico único, perfecto para stickers creativos',
    replicateId: 'ai-forever/kandinsky-2.2:ea1addaab376f4dc227f5368bbd8571f901820a442feb6c2de86d716753232bc',
    inputFormat: 'text-to-image',
    defaultParams: {
      width: 512,
      height: 512,
      num_outputs: 1,
      num_inference_steps: 50,
    },
  },
];

async function makeRequest(endpoint: string, body: Record<string, unknown>): Promise<Response> {
  if (!apiToken) {
    throw new Error('Replicate API token no configurado. Ve a Ajustes para añadir tu token.');
  }

  return fetch(`${REPLICATE_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait',
    },
    body: JSON.stringify(body),
  });
}

export async function createPrediction(
  model: AIModel,
  prompt: string,
  negativePrompt?: string,
  numOutputs: number = 1,
): Promise<GenerationResult> {
  const stickerPrompt = `${prompt}, sticker style, white outline, transparent background, cartoon, cute, high quality, detailed`;

  const input: Record<string, unknown> = {
    ...model.defaultParams,
    prompt: stickerPrompt,
    num_outputs: numOutputs,
  };

  if (negativePrompt) {
    input.negative_prompt = negativePrompt;
  } else {
    input.negative_prompt = 'blurry, low quality, distorted, deformed, ugly, bad anatomy';
  }

  try {
    const response = await makeRequest('/predictions', {
      version: model.replicateId.includes(':') ? model.replicateId.split(':')[1] : undefined,
      model: model.replicateId.includes(':') ? undefined : model.replicateId,
      input,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Error API: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      output: data.output ? (Array.isArray(data.output) ? data.output : [data.output]) : undefined,
      error: data.error,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión con la API de Replicate');
  }
}

export async function getPredictionStatus(predictionId: string): Promise<GenerationResult> {
  if (!apiToken) {
    throw new Error('Replicate API token no configurado.');
  }

  const response = await fetch(`${REPLICATE_API_URL}/predictions/${predictionId}`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `Error API: ${response.status}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    status: data.status,
    output: data.output ? (Array.isArray(data.output) ? data.output : [data.output]) : undefined,
    error: data.error,
  };
}

export async function pollPrediction(
  predictionId: string,
  onProgress?: (status: string) => void,
  maxAttempts: number = 60,
): Promise<GenerationResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getPredictionStatus(predictionId);
    onProgress?.(result.status);

    if (result.status === 'succeeded' || result.status === 'failed') {
      return result;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Timeout: la generación tardó demasiado.');
}
