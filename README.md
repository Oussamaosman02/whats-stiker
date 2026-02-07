# StickerAI - Creador de Stickers para WhatsApp con IA

Aplicación React Native (Expo) para crear stickers de WhatsApp usando modelos de inteligencia artificial a través de la API de Replicate.

## Características

- **Generación con IA**: Crea imágenes únicas usando modelos como FLUX Schnell, FLUX Dev, SDXL, Playground v2.5 y Kandinsky 2.2
- **Packs de stickers**: Organiza tus stickers en packs (3-30 stickers por pack, requisito de WhatsApp)
- **Importar imágenes**: Importa fotos de tu galería y conviértelas en stickers
- **Exportar a WhatsApp**: Comparte stickers directamente a WhatsApp
- **Conversión automática**: Redimensiona a 512x512 y convierte a WebP automáticamente
- **Interfaz en español**: UI completa en español con tema oscuro

## Requisitos

- Node.js 18+
- Expo CLI
- Token de API de [Replicate](https://replicate.com/account/api-tokens) (gratuito para empezar)

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

## Configuración

1. Obtén un token de API en [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Abre la app y ve a **Ajustes**
3. Pega tu token de API
4. Empieza a generar stickers

## Estructura del proyecto

```
├── app/                    # Pantallas (expo-router file-based routing)
│   ├── _layout.tsx         # Layout raíz con navegación Stack
│   ├── index.tsx           # Pantalla principal - lista de packs
│   ├── generate.tsx        # Generación de stickers con IA
│   ├── create-pack.tsx     # Crear nuevo pack
│   ├── settings.tsx        # Ajustes y token API
│   └── pack/
│       └── [id].tsx        # Detalle de pack con gestión de stickers
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── GeneratingOverlay.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── PackCard.tsx
│   │   └── StickerCard.tsx
│   ├── services/
│   │   ├── replicateApi.ts # Cliente API de Replicate
│   │   └── stickerService.ts # Gestión de archivos y stickers
│   ├── store/
│   │   └── useStore.ts     # Hooks de estado (token, packs)
│   ├── theme/
│   │   └── index.ts        # Colores, spacing, tipografía
│   └── types/
│       └── index.ts        # Tipos TypeScript
```

## Modelos de IA disponibles

| Modelo | Descripción |
|--------|------------|
| FLUX Schnell | Ultra-rápido con calidad excelente |
| FLUX Dev | Alta calidad y detalle |
| Stable Diffusion XL | Versátil, alta calidad |
| Playground v2.5 | Arte estilizado y caricaturas |
| Kandinsky 2.2 | Estilo artístico único |

## Tecnologías

- React Native + Expo SDK 54
- TypeScript
- expo-router (navegación file-based)
- expo-file-system (nueva API File/Directory/Paths)
- expo-image-manipulator (redimensionado y conversión)
- expo-sharing (exportar a WhatsApp)
- Replicate API (generación de imágenes con IA)
