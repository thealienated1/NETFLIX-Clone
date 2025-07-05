import { CustomGenre } from "src/types/Genre";

// Environment variables - safe for both Jest and Vite
const getEnvVar = (key: string, defaultValue: string = '') => {
  // Try global mock first (Jest)
  if ((global as any).import?.meta?.env?.[key]) {
    return (global as any).import.meta.env[key];
  }
  // Try process.env as fallback
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  // Final fallback
  return defaultValue;
};

export const API_ENDPOINT_URL = getEnvVar('VITE_APP_API_ENDPOINT_URL', 'https://api.themoviedb.org/3');
export const TMDB_V3_API_KEY = getEnvVar('VITE_APP_TMDB_V3_API_KEY', 'test-api-key');

export const MAIN_PATH = {
  root: "",
  browse: "browse",
  genreExplore: "genre",
  watch: "watch",
};

export const ARROW_MAX_WIDTH = 60;
export const COMMON_TITLES: CustomGenre[] = [
  { name: "Popular", apiString: "popular" },
  { name: "Top Rated", apiString: "top_rated" },
  { name: "Now Playing", apiString: "now_playing" },
  { name: "Upcoming", apiString: "upcoming" },
];

export const YOUTUBE_URL = "https://www.youtube.com/watch?v=";
export const APP_BAR_HEIGHT = 70;

export const INITIAL_DETAIL_STATE = {
  id: undefined,
  mediaType: undefined,
  mediaDetail: undefined,
};
