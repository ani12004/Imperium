
import fetch from 'node-fetch';
import logger from './logger.js';

const BASE_URL = process.env.JIOSAAVN_API_URL || 'https://saavn.sumit.co';

/**
 * Search for a song on JioSaavn
 * @param {string} query 
 * @returns {Promise<Object|null>} The first song result or null
 */
export async function searchSong(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=1`);
        const data = await response.json();

        if (data.success && data.data.results.length > 0) {
            return data.data.results[0]; // Return the first result
        }
        return null;
    } catch (error) {
        logger.error(`JioSaavn Search Error: ${error.message}`);
        return null;
    }
}

/**
 * Get song details including download URLs
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
export async function getSongDetails(id) {
    try {
        // Some APIs return details directly in search, but let's be safe if we need a specific details endpoint
        // For saavn.sumit.co and similar, the search result usually contains 'downloadUrl' array.
        // If we need to fetch details specifically:
        // const response = await fetch(`${BASE_URL}/songs?id=${id}`);
        // For now, we'll assume the search result object passed in or fetched is sufficient if it has downloadUrl
        // If this function is needed for standalone ID fetching:

        const response = await fetch(`${BASE_URL}/songs?id=${id}`);
        const data = await response.json();

        if (data.success && data.data) {
            // Handle array or single object return
            return Array.isArray(data.data) ? data.data[0] : data.data;
        }
        return null;
    } catch (error) {
        logger.error(`JioSaavn Details Error: ${error.message}`);
        return null;
    }
}

/**
 * Helper to extract the highest quality stream URL
 * @param {Object} songData 
 * @returns {string|null}
 */
export function getHighestQualityUrl(songData) {
    if (!songData || !songData.downloadUrl) return null;

    // downloadUrl is typically an array: [{ quality: "12kbps", url: "..." }, { quality: "320kbps", url: "..." }]
    // We want the last one or the one with 320kbps

    // Sort by quality (parsing "320kbps" to 320)
    const sorted = songData.downloadUrl.sort((a, b) => {
        const qualA = parseInt(a.quality);
        const qualB = parseInt(b.quality);
        return qualB - qualA; // Descending
    });

    return sorted[0]?.url || null;
}
