// Mock import.meta.env for Jest tests
global.import = {
  meta: {
    env: {
      VITE_APP_API_ENDPOINT_URL: 'https://api.themoviedb.org/3',
      VITE_APP_TMDB_V3_API_KEY: 'test-api-key',
    },
  },
};

// Also mock it on the global object for broader compatibility
if (typeof global !== 'undefined') {
  global.import = global.import || {};
  global.import.meta = global.import.meta || {};
  global.import.meta.env = {
    VITE_APP_API_ENDPOINT_URL: 'https://api.themoviedb.org/3',
    VITE_APP_TMDB_V3_API_KEY: 'test-api-key',
  };
} 