import { createApiClient } from '@coachos/ui';

// Student portal API client — redirects to /login on auth failure
const api = createApiClient({ baseURL: import.meta.env.VITE_API_URL || '/api/v1', loginPath: '/login' });
export default api;
