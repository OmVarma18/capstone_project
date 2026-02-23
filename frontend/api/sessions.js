import { Pool } from 'pg';
import { createClerkClient } from '@clerk/backend';

// Initialize Clerk client (automatically picks up CLERK_SECRET_KEY)
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Verify required env variables
if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL in Vercel environment.");
}

// In serverless, it's better to instantiate the pool outside the handler
// so it can be reused across warm invocations
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default async function handler(req, res) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    )

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    // Handle Fetching Sessions (GET)
    if (req.method === 'GET') {
        try {
            // 1. Get auth token from header
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: "Unauthorized: Missing token" });
            }

            // Verify the token server-side via Clerk
            let verifiedUserId;
            try {
                const payload = await clerk.verifyToken(token);
                verifiedUserId = payload.sub; // The true Clerk user ID
            } catch (err) {
                console.error("Clerk Token Verification Failed:", err);
                return res.status(401).json({
                    error: "Unauthorized: Invalid token",
                    details: err.message
                });
            }

            // 2. Query Neon Database securely using verified ID
            const result = await pool.query(
                'SELECT id, title, summary, transcript, tasks, created_at FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
                [verifiedUserId]
            );

            // Return the rows to the client
            return res.status(200).json(result.rows);

        } catch (error) {
            console.error("Database Fetch Error:", error);
            return res.status(500).json({ error: 'Failed to fetch sessions from database' });
        }
    }

    // Handle Deleting Sessions (DELETE)
    if (req.method === 'DELETE') {
        try {
            const { id } = req.query; // e.g. /api/sessions?id=123
            const token = req.headers.authorization?.split(' ')[1];

            if (!id || !token) {
                return res.status(400).json({ error: "Missing ID or Token" });
            }

            // Verify the token server-side via Clerk
            let verifiedUserId;
            try {
                const payload = await clerk.verifyToken(token);
                verifiedUserId = payload.sub;
            } catch (err) {
                return res.status(401).json({
                    error: "Unauthorized: Invalid token",
                    details: err.message
                });
            }

            // Ensure user only deletes their own session
            const result = await pool.query(
                'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id',
                [id, verifiedUserId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Session not found or forbidden" });
            }

            return res.status(200).json({ message: "Successfully deleted session." });

        } catch (error) {
            console.error("Database Delete Error:", error);
            return res.status(500).json({ error: 'Failed to delete session' });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}
