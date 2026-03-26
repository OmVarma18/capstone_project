import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Simple in-memory cache to prevent redundant fetches when switching pages
let sessionCache = {
    data: null,
    timestamp: null
};
const CACHE_TTL = 5 * 60 * 1000; // 2 minutes

export const api = {
    /**
     * Uploads an audio file by sending base64 data to our Serverless function
     * @param {File} file - The audio file to upload
     * @param {string} token - The Clerk session token
     * @param {string} userId - The Clerk user ID
     */
    uploadAudio: async (file, token, userId, language = null) => {
        // Convert file to base64 for the serverless function to easily pass to GitHub API
        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]); // remove data:*/*;base64,
            reader.onerror = error => reject(error);
        });

        try {
            const base64Data = await toBase64(file);

            const response = await axios.post(`${API_URL}/upload`, {
                filename: file.name,
                fileData: base64Data,
                userId: userId,
                language: language
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            // Invalidate cache since new data is processing/available
            sessionCache.data = null;

            return response.data;
        } catch (error) {
            console.error("API Upload Error:", error);
            throw error;
        }
    },

    /**
     * Fetches user's session history from Neon via Serverless DB Bridge
     * Uses in-memory caching to prevent redundant calls across navigations.
     */
    fetchSessions: async (token, userId, forceRefresh = false) => {
        try {
            // Check cache validity
            const isCacheValid = sessionCache.data && sessionCache.timestamp && (Date.now() - sessionCache.timestamp < CACHE_TTL);

            if (!forceRefresh && isCacheValid) {
                console.log("Serving sessions from internal cache.");
                return sessionCache.data;
            }

            console.log("Fetching fresh sessions from API...");
            const res = await axios.get(`${API_URL}/sessions`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "x-user-id": userId  // MVP auth pass-through
                }
            });

            // Set cache
            sessionCache = {
                data: res.data,
                timestamp: Date.now()
            };

            return res.data;
        } catch (error) {
            console.error("API Fetch Error:", error);
            throw error;
        }
    },

    /**
     * Deletes a session from Neon via Serverless DB Bridge
     * Actively updates the in-memory cache to stay in sync.
     */
    deleteSession: async (id, token, userId) => {
        try {
            await axios.delete(`${API_URL}/sessions?id=${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "x-user-id": userId
                }
            });

            // Update cache optimistically if it exists
            if (sessionCache.data) {
                sessionCache.data = sessionCache.data.filter(session => session.id !== id);
            }
        } catch (error) {
            console.error("API Delete Error:", error);
            throw error;
        }
    },

    /**
     * Persists a task's completed/status to the DB.
     * @param {number} sessionId - The session the task belongs to
     * @param {number} taskIndex - Index of the task in the session's tasks array
     * @param {boolean} completed - New completed state
     */
    updateTask: async (sessionId, taskIndex, completed, token, userId) => {
        try {
            await axios.patch(`${API_URL}/sessions`,
                { sessionId, taskIndex, completed },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "x-user-id": userId
                    }
                }
            );
            // Invalidate cache so next fetch is fresh
            sessionCache.data = null;
        } catch (error) {
            console.error("API Task Update Error:", error);
            throw error;
        }
    }
};
