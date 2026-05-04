import { authService } from './authService';

export function apiFetch(url, options = {}) {
  const token = authService.getToken();
  const { headers: callerHeaders = {}, ...restOptions } = options;
  return fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...callerHeaders,
    },
  });
}
