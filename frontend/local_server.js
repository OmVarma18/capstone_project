import { serve } from "bun";
import { Pool } from "pg";
import { fetch as nodeFetch } from "node-fetch"; // Bun has native fetch, but we can also use this if needed.
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Ensure we have secrets
const DATABASE_URL = process.env.DATABASE_URL;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!DATABASE_URL || !GITHUB_TOKEN) {
    console.error("❌ Missing DATABASE_URL or GITHUB_TOKEN in .env.local");
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const REPO_OWNER = 'OmVarma18';
const REPO_NAME = 'capstone_project';

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id",
    "Content-Type": "application/json",
};

console.log("🚀 Starting local API Server on http://localhost:3001");

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle pg client', err);
    // Don't crash the server, just log the error.
});

serve({
    port: 3001,
    idleTimeout: 255, // Set a longer idle timeout to accommodate Neon sleeping instances
    async fetch(req) {
        const url = new URL(req.url);

        // Handle CORS preflight
        if (req.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // --- UPLOAD ROUTE ---
        if (url.pathname === "/api/upload" && req.method === "POST") {
            try {
                const body = await req.json();
                const { filename, fileData, userId } = body;

                if (!filename || !fileData || !userId) {
                    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
                }

                const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
                const timestamp = Date.now();
                const finalFilename = `${userId}___${timestamp}_${safeFilename}`;
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
                            message: `🎙️ Auto-upload audio from local environment ${userId}`,
                            content: fileData,
                            branch: 'main'
                        }),
                    }
                );

                const data = await githubRes.json();

                if (!githubRes.ok) {
                    console.error("GitHub API Error:", data);
                    return new Response(JSON.stringify({ error: 'Failed to upload to GitHub', details: data.message }), { status: 500, headers: corsHeaders });
                }

                console.log(`✅ Upload successful! GitHub Actions should start shortly.`);
                return new Response(JSON.stringify({
                    message: 'Upload successful. Processing has started in the background.',
                    status: 'processing'
                }), { headers: corsHeaders });

            } catch (error) {
                console.error("Upload Error:", error);
                return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: corsHeaders });
            }
        }

        // --- SESSIONS GET ROUTE ---
        if (url.pathname === "/api/sessions" && req.method === "GET") {
            try {
                const userId = req.headers.get("x-user-id");
                if (!userId) {
                    return new Response(JSON.stringify({ error: "Missing x-user-id header" }), { status: 401, headers: corsHeaders });
                }

                console.log(`Fetching sessions for ${userId}...`);
                const result = await pool.query(
                    'SELECT id, title, summary, transcript, tasks, created_at FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
                    [userId]
                );

                return new Response(JSON.stringify(result.rows), { headers: corsHeaders });
            } catch (error) {
                console.error("Database Fetch Error:", error);
                return new Response(JSON.stringify({ error: 'Failed to fetch sessions from database' }), { status: 500, headers: corsHeaders });
            }
        }

        // --- SESSIONS DELETE ROUTE ---
        if (url.pathname === "/api/sessions" && req.method === "DELETE") {
            try {
                const id = url.searchParams.get("id");
                const userId = req.headers.get("x-user-id");

                if (!id || !userId) {
                    return new Response(JSON.stringify({ error: "Missing ID or User ID" }), { status: 400, headers: corsHeaders });
                }

                console.log(`Deleting session ${id}...`);
                const result = await pool.query(
                    'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id',
                    [id, userId]
                );

                if (result.rowCount === 0) {
                    return new Response(JSON.stringify({ error: "Session not found or forbidden" }), { status: 404, headers: corsHeaders });
                }

                return new Response(JSON.stringify({ message: "Successfully deleted session." }), { headers: corsHeaders });
            } catch (error) {
                console.error("Database Delete Error:", error);
                return new Response(JSON.stringify({ error: 'Failed to delete session' }), { status: 500, headers: corsHeaders });
            }
        }

        return new Response(JSON.stringify({ message: "Not API route" }), { status: 404, headers: corsHeaders });
    }
});
