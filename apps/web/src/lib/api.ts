import { createApiClient } from '@coachos/ui';

const api = createApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'https://Maneza-coachos.onrender.com/api/v1',
  loginPath: '/login'
});

// Extra interceptor specific to the web portal to handle plan limits
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && ['PLAN_LIMIT', 'LIMIT_REACHED', 'PLAN_LIMIT_REACHED'].includes(error.response?.data?.code)) {
      window.dispatchEvent(new CustomEvent('UPGRADE_REQUIRED', {
        detail: {
          isLimitReached: true,
          message: error.response?.data?.error || 'You have reached the limits of your current plan.'
        }
      }));
    }
    return Promise.reject(error);
  }
);

export default api;
