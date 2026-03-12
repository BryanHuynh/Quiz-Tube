function parseTimestamp(ts: string): number {
  const parts = ts.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parseFloat(ts) || 0
}

export function seekToTimestamp(ts: string) {
  const seconds = parseTimestamp(ts)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id
    if (!tabId) return
    chrome.scripting.executeScript({
      target: { tabId },
      func: (secs: number) => {
        const video = document.querySelector('video')
        if (video) video.currentTime = secs
      },
      args: [seconds],
    })
  })
}
