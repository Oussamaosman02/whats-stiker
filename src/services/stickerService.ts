import { File, Directory, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Sticker, StickerPack } from '../types';

const STICKER_SIZE = 512;

function getStickerDir(): Directory {
  const dir = new Directory(Paths.document, 'stickers');
  if (!dir.exists) {
    dir.create();
  }
  return dir;
}

function getPacksDir(): Directory {
  const dir = new Directory(Paths.document, 'packs');
  if (!dir.exists) {
    dir.create();
  }
  return dir;
}

export async function downloadAndProcessImage(imageUrl: string, stickerId: string): Promise<string> {
  const stickerDir = getStickerDir();
  const tempFile = new File(Paths.cache, `temp_${stickerId}.png`);

  // Download image
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  tempFile.write(new Uint8Array(arrayBuffer));

  // Resize to sticker dimensions
  const manipulated = await ImageManipulator.manipulateAsync(
    tempFile.uri,
    [{ resize: { width: STICKER_SIZE, height: STICKER_SIZE } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
  );

  // Move to final destination
  const finalFile = new File(stickerDir, `${stickerId}.webp`);
  const processedFile = new File(manipulated.uri);
  if (processedFile.exists) {
    processedFile.move(finalFile);
  }

  // Clean up temp
  if (tempFile.exists) {
    tempFile.delete();
  }

  return finalFile.uri;
}

export async function processLocalImage(imageUri: string, stickerId: string): Promise<string> {
  const stickerDir = getStickerDir();

  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: STICKER_SIZE, height: STICKER_SIZE } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
  );

  const finalFile = new File(stickerDir, `${stickerId}.webp`);
  const processedFile = new File(manipulated.uri);
  if (processedFile.exists) {
    processedFile.move(finalFile);
  }

  return finalFile.uri;
}

export async function createTrayIcon(imageUri: string, packId: string): Promise<string> {
  const stickerDir = getStickerDir();

  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 96, height: 96 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
  );

  const trayFile = new File(stickerDir, `tray_${packId}.webp`);
  const processedFile = new File(manipulated.uri);
  if (processedFile.exists) {
    processedFile.move(trayFile);
  }

  return trayFile.uri;
}

export async function saveStickerPack(pack: StickerPack): Promise<void> {
  const packsDir = getPacksDir();
  const packFile = new File(packsDir, `${pack.id}.json`);
  packFile.write(JSON.stringify(pack));
}

export async function loadStickerPacks(): Promise<StickerPack[]> {
  const packsDir = getPacksDir();
  const entries = packsDir.list();
  const packs: StickerPack[] = [];

  for (const entry of entries) {
    if (entry instanceof File && entry.name.endsWith('.json')) {
      try {
        const content = await entry.text();
        packs.push(JSON.parse(content));
      } catch {
        // Skip corrupted files
      }
    }
  }

  return packs.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function loadStickerPack(packId: string): Promise<StickerPack | null> {
  const packsDir = getPacksDir();
  const packFile = new File(packsDir, `${packId}.json`);

  if (!packFile.exists) return null;

  try {
    const content = await packFile.text();
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function deleteStickerPack(packId: string): Promise<void> {
  const pack = await loadStickerPack(packId);
  if (pack) {
    for (const sticker of pack.stickers) {
      try {
        const stickerFile = new File(sticker.uri);
        if (stickerFile.exists) {
          stickerFile.delete();
        }
      } catch {
        // Ignore missing files
      }
    }
    if (pack.trayImageUri) {
      try {
        const trayFile = new File(pack.trayImageUri);
        if (trayFile.exists) {
          trayFile.delete();
        }
      } catch {
        // Ignore
      }
    }
  }

  const packsDir = getPacksDir();
  const packFile = new File(packsDir, `${packId}.json`);
  if (packFile.exists) {
    packFile.delete();
  }
}

export async function deleteStickerFromPack(packId: string, stickerId: string): Promise<StickerPack | null> {
  const pack = await loadStickerPack(packId);
  if (!pack) return null;

  const sticker = pack.stickers.find(s => s.id === stickerId);
  if (sticker) {
    try {
      const stickerFile = new File(sticker.uri);
      if (stickerFile.exists) {
        stickerFile.delete();
      }
    } catch {
      // Ignore
    }
    pack.stickers = pack.stickers.filter(s => s.id !== stickerId);
    pack.updatedAt = Date.now();
    await saveStickerPack(pack);
  }

  return pack;
}

export async function exportStickerPackForWhatsApp(pack: StickerPack): Promise<void> {
  if (pack.stickers.length < 3) {
    throw new Error('WhatsApp requiere al menos 3 stickers en un pack.');
  }
  if (pack.stickers.length > 30) {
    throw new Error('WhatsApp permite un máximo de 30 stickers por pack.');
  }

  // Share via system share sheet — full native WhatsApp integration
  // requires a Content Provider (Android) which needs a custom native module.
  const firstSticker = pack.stickers[0];
  if (firstSticker) {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(firstSticker.uri, {
        mimeType: 'image/webp',
        dialogTitle: `Sticker Pack: ${pack.name}`,
        UTI: Platform.OS === 'ios' ? 'net.whatsapp.sticker' : 'public.image',
      });
    }
  }
}

export async function shareSingleSticker(sticker: Sticker): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Compartir no está disponible en este dispositivo.');
  }

  await Sharing.shareAsync(sticker.uri, {
    mimeType: 'image/webp',
    dialogTitle: 'Enviar sticker',
    UTI: 'public.image',
  });
}
