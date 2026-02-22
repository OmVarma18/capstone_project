import fetch from 'node-fetch';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100mb', // Allow large audio files
        },
    },
};

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

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // 1. Get the auth token from Clerk (passed in header)
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // In a real app, you'd decode the JWT here to get the user ID
        // For now, we'll just extract it lazily or accept what the client sends
        // The client sends the body as JSON containing base64 file data

        const { filename, fileData, userId } = req.body;

        if (!filename || !fileData || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 2. Prepare GitHub API details
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Set securely in Vercel
        const REPO_OWNER = 'OmVarma18';
        const REPO_NAME = 'capstone_project';

        // Sanitize filename and append unique ID to avoid collisions
        const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const timestamp = Date.now();
        // Prefix the filename with the clerk userId so process_batch can read it
        const finalFilename = `${userId}___${timestamp}_${safeFilename}`;
        const filePath = `uploads/${finalFilename}`;

        console.log(`Uploading ${finalFilename} to GitHub...`);

        // 3. Make the API call to GitHub
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
                    message: `🎙️ Auto-upload audio from user ${userId}`,
                    content: fileData, // Already base64 encoded from the frontend
                    branch: 'main'
                }),
            }
        );

        const data = await githubRes.json();

        if (!githubRes.ok) {
            console.error("GitHub API Error:", data);
            return res.status(githubRes.status).json({
                error: 'Failed to upload to GitHub',
                details: data.message
            });
        }

        // Return success to the client
        return res.status(200).json({
            message: 'Upload successful. Processing has started in the background.',
            status: 'processing'
        });

    } catch (error) {
        console.error("Serverless Upload Error:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
