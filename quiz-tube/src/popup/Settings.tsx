import { useState } from 'react'
import { PROVIDERS, PROVIDER_KEYS, type Provider } from '../utils/providers'
import { saveSettings, clearSettings, type LLMSettings } from '../utils/storage'

interface Props {
  current: LLMSettings | null
  onBack: () => void
}

export function Settings({ current, onBack }: Props) {
  const [provider, setProvider] = useState<Provider>(current?.provider ?? 'google')
  const [model, setModel] = useState(current?.model ?? PROVIDERS.google.defaultModel)
  const [apiKey, setApiKey] = useState(current?.apiKey ?? '')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const providerConfig = PROVIDERS[provider]

  const handleProviderChange = (p: Provider) => {
    setProvider(p)
    setModel(PROVIDERS[p].defaultModel)
    setSaved(false)
  }

  const handleSave = async () => {
    await saveSettings({ provider, model, apiKey })
    setSaved(true)
    setTimeout(onBack, 600)
  }

  const handleClear = async () => {
    await clearSettings()
    setApiKey('')
    setSaved(false)
  }

  const canSave = apiKey.trim().length > 0

  const inputCls = 'w-full bg-[#0f0f0f] border border-[#3a3a3a] focus:border-red-600 rounded-lg text-white text-sm px-3 py-2.5 outline-none transition-colors'
  const selectCls = `${inputCls} cursor-pointer`

  return (
    <div className="p-4 flex flex-col gap-4">
      <p className="text-xs text-[#555] leading-relaxed">
        Your key is stored locally in Chrome and sent only to your backend. It never leaves your machine.
      </p>

      {/* Provider */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#888] uppercase tracking-wide">Provider</label>
        <select
          className={selectCls}
          value={provider}
          onChange={e => handleProviderChange(e.target.value as Provider)}
        >
          {PROVIDER_KEYS.map(p => (
            <option key={p} value={p}>{PROVIDERS[p].label}</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#888] uppercase tracking-wide">Model</label>
        <select
          className={selectCls}
          value={model}
          onChange={e => { setModel(e.target.value); setSaved(false) }}
        >
          {providerConfig.models.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#888] uppercase tracking-wide">
          {providerConfig.keyLabel}
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            className={`${inputCls} pr-10`}
            placeholder={providerConfig.keyPlaceholder}
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setSaved(false) }}
            spellCheck={false}
            autoComplete="off"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#aaa] text-xs transition-colors"
            onClick={() => setShowKey(v => !v)}
          >
            {showKey ? 'hide' : 'show'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          className="bg-red-600 hover:bg-red-700 disabled:bg-[#2e2e2e] disabled:text-[#555] disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-semibold w-full cursor-pointer transition-colors duration-150"
          onClick={handleSave}
          disabled={!canSave}
        >
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>

        {current && (
          <button
            className="text-[#555] hover:text-red-400 text-xs text-center cursor-pointer transition-colors py-1"
            onClick={handleClear}
          >
            Clear saved key
          </button>
        )}
      </div>
    </div>
  )
}
