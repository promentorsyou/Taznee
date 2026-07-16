/**
 * fetch() wrapper for client components: adds a request timeout, turns
 * network-level failures (offline, DNS, dropped connection) and non-JSON
 * responses into clear human-readable errors, and never surfaces a raw
 * TypeError/SyntaxError to the customer.
 */

export class FetchJsonError extends Error {
  constructor(
    message: string,
    /** true when retrying is likely to help (timeout / offline / 5xx). */
    public readonly retryable: boolean,
  ) {
    super(message);
  }
}

const NETWORK_MESSAGE =
  "We couldn't reach the server. Please check your connection and try again.";
const TIMEOUT_MESSAGE = "The request took too long. Please try again.";
const SERVER_MESSAGE = "Something went wrong on our end. Please try again in a moment.";

export async function fetchJson<T = unknown>(
  url: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const { timeoutMs = 15000, ...rest } = init ?? {};

  let res: Response;
  try {
    res = await fetch(url, { ...rest, signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    if (err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError")) {
      throw new FetchJsonError(TIMEOUT_MESSAGE, true);
    }
    throw new FetchJsonError(NETWORK_MESSAGE, true);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON body (e.g. a proxy error page). Fall through to the status check.
  }

  if (!res.ok) {
    const serverError =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : null;
    if (res.status >= 500) {
      throw new FetchJsonError(serverError ?? SERVER_MESSAGE, true);
    }
    throw new FetchJsonError(serverError ?? "Request failed. Please check your details and try again.", false);
  }

  return data as T;
}
