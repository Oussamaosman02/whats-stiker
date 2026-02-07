import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StickerPack } from '../types';
import { loadStickerPacks } from '../services/stickerService';
import { setReplicateToken, getReplicateToken } from '../services/replicateApi';

const TOKEN_KEY = 'replicate_api_token';

export function useApiToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then(stored => {
      if (stored) {
        setToken(stored);
        setReplicateToken(stored);
      }
      setLoading(false);
    });
  }, []);

  const saveToken = useCallback(async (newToken: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setReplicateToken(newToken);
    setToken(newToken);
  }, []);

  const clearToken = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setReplicateToken('');
    setToken(null);
  }, []);

  return { token, loading, saveToken, clearToken, hasToken: !!token };
}

export function useStickerPacks() {
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await loadStickerPacks();
      setPacks(loaded);
    } catch (error) {
      console.error('Error loading packs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { packs, loading, refresh };
}
