/**
 * Renders a JSON-LD structured-data script. Server component — the object
 * is serialized at render time. The `<` escape prevents any string value
 * from breaking out of the <script> element.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
