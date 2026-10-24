import '@testing-library/jest-dom/vitest';

if (!import.meta.env.VITE_API_BASE_URL) {
  import.meta.env.VITE_API_BASE_URL = 'http://localhost:5001/api';
}
