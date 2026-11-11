export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const unauthorizedListeners = new Set<() => void>();

export function onUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener);

  return () => {
    unauthorizedListeners.delete(listener);
  };
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

  if (!baseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_URL in your .env file.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');

    if (options.body) {
      headers.set('Content-Type', 'application/json');
    }

    let response: Response;

    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
        credentials: 'include',
        signal: controller.signal,
      });
    } catch {
      throw new Error(
        'Could not reach the server. Check your connection and try again.',
      );
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // A failed login should show an error on the login screen.
      // A 401 elsewhere means the existing session is no longer valid.
      if (response.status === 401 && path !== '/login') {
        unauthorizedListeners.forEach((listener) => listener());
      }

      throw new ApiError(
        data?.error ?? 'The request failed. Please try again.',
        response.status,
      );
    }

    if (data === null) {
      throw new Error('The server returned an unexpected response.');
    }

    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}