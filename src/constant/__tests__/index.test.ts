import { API_ENDPOINT_URL, TMDB_V3_API_KEY, MAIN_PATH, COMMON_TITLES } from '../__mocks__/index';

describe('Constants', () => {
  test('API_ENDPOINT_URL is defined', () => {
    expect(API_ENDPOINT_URL).toBeDefined();
  });

  test('TMDB_V3_API_KEY is defined', () => {
    expect(TMDB_V3_API_KEY).toBeDefined();
  });

  test('MAIN_PATH has correct structure', () => {
    expect(MAIN_PATH).toEqual({
      root: "",
      browse: "browse",
      genreExplore: "genre",
      watch: "watch",
    });
  });

  test('COMMON_TITLES has correct structure', () => {
    expect(COMMON_TITLES).toHaveLength(4);
    expect(COMMON_TITLES[0]).toEqual({ name: "Popular", apiString: "popular" });
    expect(COMMON_TITLES[1]).toEqual({ name: "Top Rated", apiString: "top_rated" });
    expect(COMMON_TITLES[2]).toEqual({ name: "Now Playing", apiString: "now_playing" });
    expect(COMMON_TITLES[3]).toEqual({ name: "Upcoming", apiString: "upcoming" });
  });
}); 