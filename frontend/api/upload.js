import { Pool } from "pg";
import fetch from "node-fetch";

const DATABASE_URL = process.env.DATABASE_URL;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle pg client', err);
});

const REPO_OWNER = 'OmVarma18';
const REPO_NAME = 'capstone_project';

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { filename, fileData, userId, language } = req.body;

        if (!filename || !fileData || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const timestamp = Date.now();
        const langTag = language || 'auto';
        const finalFilename = `${userId}___${timestamp}_${langTag}_${safeFilename}`;
        const filePath = `uploads/${finalFilename}`;

        console.log(`📡 Pushing ${finalFilename} to GitHub to trigger Actions...`);

        const githubRes = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `🎙️ Auto-upload audio from Vercel ${userId}`,
                    content: fileData,
                    branch: 'main'
                }),
            }
        );

        const data = await githubRes.json();

        if (!githubRes.ok) {
            console.error("GitHub API Error:", data);
            return res.status(500).json({ error: 'Failed to upload to GitHub', details: data.message });
        }

        console.log(`✅ Upload successful! GitHub Actions should start shortly.`);
        return res.status(200).json({
            message: 'Upload successful. Processing has started in the background.',
            status: 'processing'
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
