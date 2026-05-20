type SentinelLike = { release: () => Promise<void> };

let sentinel: SentinelLike | null = null;

export async function requestWakeLock(): Promise<void> {
  try {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: "screen") => Promise<SentinelLike> };
    };
    if (!nav.wakeLock) return;
    sentinel = await nav.wakeLock.request("screen");
  } catch {
    /* user may not have granted, or document not visible — ignore */
  }
}

export async function releaseWakeLock(): Promise<void> {
  try {
    await sentinel?.release();
  } catch {
    /* ignore */
  } finally {
    sentinel = null;
  }
}
