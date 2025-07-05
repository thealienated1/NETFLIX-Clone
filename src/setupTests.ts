import '@testing-library/jest-dom';

// Mock Vite environment variables
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_APP_API_ENDPOINT_URL: 'https://api.themoviedb.org/3',
        VITE_APP_TMDB_V3_API_KEY: 'test-api-key',
      },
    },
  },
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
(global as any).ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Use only the global mock for Jest environment
export const API_ENDPOINT_URL = (global as any).import?.meta?.env?.VITE_APP_API_ENDPOINT_URL || 'https://api.themoviedb.org/3';
export const TMDB_V3_API_KEY = (global as any).import?.meta?.env?.VITE_APP_TMDB_V3_API_KEY || 'test-api-key'; 