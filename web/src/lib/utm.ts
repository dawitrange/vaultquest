/** First-touch UTMs from the signup URL or `vq_ft_utm` cookie. No analytics vendor. */

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmTouch = Partial<Record<UtmKey, string>>;

export const FIRST_TOUCH_COOKIE = "vq_ft_utm";
export const FIRST_TOUCH_MAX_AGE_SEC = 60 * 60 * 24 * 90;
const VALUE_MAX = 80;

function sanitizeUtmValue(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const cleaned = raw.trim().replace(/[^\w.+\- ]/g, "").slice(0, VALUE_MAX).trim();
  return cleaned || undefined;
}

export function hasUtm(utm: UtmTouch): boolean {
  return UTM_KEYS.some((key) => Boolean(utm[key]));
}

export function utmFromUnknown(input: unknown): UtmTouch {
  if (!input || typeof input !== "object") return {};
  const out: UtmTouch = {};
  for (const key of UTM_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) continue;
    const value = sanitizeUtmValue(Reflect.get(input, key));
    if (value) out[key] = value;
  }
  return out;
}

export function utmFromSearchParams(params: Record<string, string | string[] | undefined>): UtmTouch {
  const out: UtmTouch = {};
  for (const key of UTM_KEYS) {
    const raw = params[key];
    const value = sanitizeUtmValue(Array.isArray(raw) ? raw[0] : raw);
    if (value) out[key] = value;
  }
  return out;
}

export function utmFromFormData(formData: FormData): UtmTouch {
  const out: UtmTouch = {};
  for (const key of UTM_KEYS) {
    const value = sanitizeUtmValue(formData.get(key));
    if (value) out[key] = value;
  }
  return out;
}

export function utmFromCookieValue(raw: string | undefined | null): UtmTouch {
  if (!raw) return {};
  try {
    return utmFromUnknown(JSON.parse(raw));
  } catch {
    try {
      return utmFromUnknown(JSON.parse(decodeURIComponent(raw)));
    } catch {
      return {};
    }
  }
}

export function serializeUtmCookie(utm: UtmTouch): string {
  return JSON.stringify(utm);
}

/** First source wins per key. Later sources fill gaps only. */
export function mergeFirstTouch(...sources: UtmTouch[]): UtmTouch {
  const out: UtmTouch = {};
  for (const source of sources) {
    for (const key of UTM_KEYS) {
      if (!out[key] && source[key]) out[key] = source[key];
    }
  }
  return out;
}

export function firstTouchCookieWrite(utm: UtmTouch): string | null {
  if (!hasUtm(utm)) return null;
  return `${FIRST_TOUCH_COOKIE}=${encodeURIComponent(serializeUtmCookie(utm))}; Path=/; Max-Age=${FIRST_TOUCH_MAX_AGE_SEC}; SameSite=Lax`;
}

export function parseBrowserUtmCookie(cookieHeader: string | undefined): UtmTouch {
  if (!cookieHeader) return {};
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq);
    if (name !== FIRST_TOUCH_COOKIE) continue;
    return utmFromCookieValue(trimmed.slice(eq + 1));
  }
  return {};
}
