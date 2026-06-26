const DEFAULT_BASE_URL =
  "https://raw.githubusercontent.com/chase-manning/warhammer-api/refs/heads/main/data";

const CACHE_TTL = 86400;

export const CACHE_VERSION = 11;

let baseUrl: string | null = null;

export function setBaseUrl(url: string) {
  baseUrl = url;
}

export async function fetchData<T>(path: string): Promise<T> {
  const base = baseUrl ?? DEFAULT_BASE_URL;
  const url = `${base}/${path}?v=${CACHE_VERSION}`;
  const res = await fetch(url, {
    cf: { cacheTtl: CACHE_TTL, cacheEverything: true },
  });
  if (!res.ok) {
    throw new Error(`Data fetch failed: ${path} (${res.status})`);
  }
  return res.json() as Promise<T>;
}
