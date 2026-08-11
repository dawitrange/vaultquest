type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Server-safe JSON-LD script tag. Pass one object or an array of graph nodes. */
export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload),
      }}
    />
  );
}
