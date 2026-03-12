import type { Provider } from './providers'

export interface LLMSettings {
  provider: Provider
  model: string
  apiKey: string
}

export async function loadSettings(): Promise<LLMSettings | null> {
  const data = await chrome.storage.local.get('llmSettings')
  return (data.llmSettings as LLMSettings) ?? null
}

export async function saveSettings(settings: LLMSettings): Promise<void> {
  await chrome.storage.local.set({ llmSettings: settings })
}

export async function clearSettings(): Promise<void> {
  await chrome.storage.local.remove('llmSettings')
}
