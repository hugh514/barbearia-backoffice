import { apiClient, ApiRequestError } from '@/lib/http/client';
import {
  channelConfigSchema,
  type ChannelConfig,
  type ConfigForm,
} from './schemas';

/** Busca a config do tenant; null se ainda não existe (404). */
export async function getConfig(
  signal?: AbortSignal,
): Promise<ChannelConfig | null> {
  try {
    return await apiClient('/channels/config', {
      schema: channelConfigSchema,
      signal,
    });
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
}

/** Cria (POST) ou atualiza (PATCH) a config conforme já exista. */
export async function saveConfig(
  form: ConfigForm,
  exists: boolean,
): Promise<ChannelConfig> {
  const body = {
    ...form,
    rules: form.rules || undefined,
    whatsappInstance: form.whatsappInstance || undefined,
    instagramPageId: form.instagramPageId || undefined,
  };
  return apiClient('/channels/config', {
    method: exists ? 'PATCH' : 'POST',
    body,
    schema: channelConfigSchema,
  });
}
