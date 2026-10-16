function requiredEnv(name, value) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = Object.freeze({
  apiBaseUrl: requiredEnv(
    'VITE_API_BASE_URL',
    import.meta.env.VITE_API_BASE_URL,
  ),
  appName: import.meta.env.VITE_APP_NAME || 'UBakrie Lost & Found',
});
