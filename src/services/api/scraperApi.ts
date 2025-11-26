import { aiApiClient } from './client';
import type { ScrapeRequest, ScrapeResponse } from '../../types/scraper';

/**
 * Represents a structured API error response.
 */
export class ApiError extends Error {
  status: number;
  detail: any;

  constructor(message: string, status: number, detail: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export const scraperApi = {
  /**
   * Scrape a list of URLs and return structured results.
   * Uses aiApiClient (45s timeout) instead of apiClient (10s timeout) because
   * scraping can take up to 30 seconds for slow websites.
   * @throws {ApiError} If the API responds with a validation or server error.
   */
  async scraper(urls: string[]): Promise<ScrapeResponse> {
    const requestData: ScrapeRequest = { urls };

    try {
      // Use aiApiClient (45s timeout) instead of apiClient (10s timeout)
      // because the scraper can take up to 30 seconds for slow websites
      const { data } = await aiApiClient.post<ScrapeResponse>('/scraper/scrape', requestData);
      return data;
    } catch (error: any) {
      // Axios-style error structure
      if (error.response) {
        const { status, data } = error.response;

        throw new ApiError('Scraper API request failed', status, data?.detail || data);
      }

      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new ApiError(
          'Scraper request timed out. The website may be slow or unresponsive. Please try again or use a different URL.',
          408,
          { timeout: true }
        );
      }

      // Network or unknown error
      throw new Error('An unexpected error occurred while calling the scraper API.');
    }
  },
};
