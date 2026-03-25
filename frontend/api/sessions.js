import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle pg client', err);
});

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: "Missing x-user-id header" });
            }

            console.log(`Fetching sessions for ${userId}...`);
            const result = await pool.query(
                'SELECT id, title, summary, transcript, tasks, created_at FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );

            return res.status(200).json(result.rows);
        } catch (error) {
            console.error("Database Fetch Error:", error);
            return res.status(500).json({ error: 'Failed to fetch sessions from database' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const id = req.query.id;
            const userId = req.headers['x-user-id'];

            if (!id || !userId) {
                return res.status(400).json({ error: "Missing ID or User ID" });
            }

            console.log(`Deleting session ${id}...`);
            const result = await pool.query(
                'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id',
                [id, userId]
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

    if (req.method === 'PATCH') {
        try {
            const { sessionId, taskIndex, completed } = req.body;
            const userId = req.headers['x-user-id'];

            if (!sessionId || taskIndex === undefined || completed === undefined || !userId) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const newStatus = completed ? 'Completed' : 'Pending';

            const result = await pool.query(
                `UPDATE sessions
                 SET tasks = jsonb_set(
                     jsonb_set(tasks, $1, $2::jsonb),
                     $3, $4::jsonb
                 )
                 WHERE id = $5 AND user_id = $6
                 RETURNING id`,
                [
                    `{${taskIndex},completed}`, JSON.stringify(completed),
                    `{${taskIndex},status}`,    JSON.stringify(newStatus),
                    sessionId, userId
                ]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Session not found or forbidden" });
            }

            return res.status(200).json({ message: "Task updated successfully" });
        } catch (error) {
            console.error("Task Update Error:", error);
            return res.status(500).json({ error: 'Failed to update task' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
