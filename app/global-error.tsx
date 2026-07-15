"use client";

// Catches errors thrown in the root layout itself (app/error.tsx cannot,
// since it renders inside that layout). Must render its own <html>/<body>.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 640, margin: "6rem auto", textAlign: "center", padding: "0 1rem" }}>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Something went wrong</h1>
          <p style={{ color: "#666", marginBottom: "2rem" }}>
            Taznee hit an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#7a2135",
              color: "#faf6ef",
              padding: "0.75rem 1.5rem",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
