// Backend URL configuration
export const getBackendUrl = (): string => {
  // Check for environment variable first, then fallback to localhost
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  
  // Remove trailing slash if present
  return backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
};

// API endpoints
export const API_ENDPOINTS = {
  DEPLOY_DAO: '/api/deploy-dao',
  EXECUTE: '/api/execute',
  TREASURY: '/api/treasury',
} as const;

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string): string => {
  return `${getBackendUrl()}${endpoint}`;
}; 