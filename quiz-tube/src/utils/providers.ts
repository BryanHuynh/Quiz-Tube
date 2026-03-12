export type Provider = 'google' | 'openai' | 'anthropic'

export interface ProviderConfig {
  label: string
  models: string[]
  defaultModel: string
  keyLabel: string
  keyPlaceholder: string
}

export const PROVIDERS: Record<Provider, ProviderConfig> = {
  google: {
    label: 'Google Gemini',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    defaultModel: 'gemini-2.0-flash',
    keyLabel: 'Google AI API Key',
    keyPlaceholder: 'AIza...',
  },
  openai: {
    label: 'OpenAI',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
    defaultModel: 'gpt-4o-mini',
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-...',
  },
  anthropic: {
    label: 'Anthropic',
    models: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6'],
    defaultModel: 'claude-haiku-4-5-20251001',
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-...',
  },
}

export const PROVIDER_KEYS = Object.keys(PROVIDERS) as Provider[]
