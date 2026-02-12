import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
    /**
     * Uploads an audio file for transcription
     * @param {File} file - The audio file to upload
     * @param {string} token - The Clerk session token
     * @returns {Promise<Object>} The transcription result
     */
    uploadAudio: async (file, token) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
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
     * Checks backend health
     */
    checkHealth: async () => {
        try {
            const res = await axios.get(`${API_URL}/health`);
            return res.data;
        } catch (e) {
            return { status: "error" };
        }
    }
};
