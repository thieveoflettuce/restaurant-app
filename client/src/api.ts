import axios from 'axios';

function stripTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, '');
}

/**
 * REACT_APP_API_URL: full backend origin in production (e.g. Netlify).
 * In development, CRA's proxy forwards /api/* to :5000 only when the request path is /api/... at
 * the dev server root. If we use PUBLIC_URL (/restaurant-app from homepage) as baseURL, axios
 * resolves to /restaurant-app/api/dishes, the proxy forwards that full path, and Express has no
 * /restaurant-app/api/dishes route — menu fails with 404.
 */
function resolveApiBaseURL(): string {
  const explicit = stripTrailingSlashes((process.env.REACT_APP_API_URL || '').trim());
  if (explicit) return explicit;

  if (process.env.NODE_ENV === 'development') {
    return '';
  }

  const pub = (process.env.PUBLIC_URL || '').trim();
  if (!pub) return '';

  if (/^https?:\/\//i.test(pub)) {
    try {
      const url = new URL(pub);
      const path = stripTrailingSlashes(url.pathname || '');
      return path ? `${url.origin}${path}` : url.origin;
    } catch {
      return stripTrailingSlashes(pub);
    }
  }

  return stripTrailingSlashes(pub);
}

const api = axios.create({
  baseURL: resolveApiBaseURL(),
});

export default api;
