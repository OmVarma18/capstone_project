import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const api = {
    /**
     * Uploads an audio file for transcription
     * @param {File} file - The audio file to upload
     * @param {string} token - The Clerk session token
     * @returns {Promise<Object>} The transcription result
     */
    /**
     * Uploads an audio file by sending base64 data to our Serverless function
     * @param {File} file - The audio file to upload
     * @param {string} token - The Clerk session token
     * @param {string} userId - The Clerk user ID
     */
    uploadAudio: async (file, token, userId) => {
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
                userId: userId
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("API Upload Error:", error);
            throw error;
        }
    },

    /**
     * Fetches user's session history from Neon via Serverless DB Bridge
     */
    fetchSessions: async (token, userId) => {
        try {
            const res = await axios.get(`${API_URL}/sessions`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "x-user-id": userId  // MVP auth pass-through
                }
            });
            return res.data;
        } catch (error) {
            console.error("API Fetch Error:", error);
            throw error;
        }
    },

    /**
     * Deletes a session from Neon via Serverless DB Bridge
     */
    deleteSession: async (id, token, userId) => {
        try {
            await axios.delete(`${API_URL}/sessions?id=${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "x-user-id": userId
                }
            });
        } catch (error) {
            console.error("API Delete Error:", error);
            throw error;
        }
    }
};
