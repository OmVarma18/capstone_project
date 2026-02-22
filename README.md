# 🎙️ TalkNote

TalkNote is an intelligent meeting assistant built to record, transcribe, and summarize your meetings automatically. It intelligently identifies different speakers, extracts key actionable tasks, and stores everything in a secure database for easy review.

This project was built as a Capstone Project and features a modern, serverless architecture that offloads heavy AI processing to background cloud runners.

## ✨ Features

- **Secure Authentication:** User login and session management powered by [Clerk](https://clerk.com/).
- **Live Audio Recording:** Capture meetings directly from your browser.
- **Automated Transcription & Diarization:** Uses OpenAI's **Whisper** to transcribe audio and **SpeechBrain** to identify different speakers.
- **AI Meeting Summaries:** Leverages Google's latest **Gemini 2.5 Flash** AI to read your transcripts, generate concise summaries, and extract actionable checklists.
- **FeedFlash Architecture:** True serverless implementation. The frontend securely pushes audio to a cloud storage queue, and GitHub Actions automatically spins up a background Python environment to run the heavy AI models without blocking the user.
- **Serverless PostgreSQL Database:** Scalable and instant database management powered by [Neon](https://neon.tech/).

---

## 🏗️ Architecture

1. **Frontend (React + Vite):** The user interacts with the UI, logs in, and records a meeting.
2. **Upload API:** The audio file is pushed to the `uploads/` directory on the `main` branch via GitHub's API.
3. **Trigger:** A GitHub Action detects the new audio file and launches a Ubuntu runner.
4. **Processing Pipeline (`backend/process_batch.py`):**
   - **Audio Decoding:** FFMPEG cleans and decodes the `.m4a` / `.mp4` audio.
   - **Whisper & SpeechBrain:** Generates a timestamped, speaker-separated text transcript.
   - **Google GenAI (Gemini):** Analyzes the text and outputs a strict JSON file containing a Meeting Summary and action Tasks.
5. **Storage:** The parsed data is securely saved into the Neon Postgres Database.
6. **Cleanup:** The GitHub action automatically deletes the raw audio from the repository to save space.
7. **Viewing:** The Frontend queries the Neon Database to display the new Meeting summary to the user.

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Bun](https://bun.sh/) (Optional, but recommended for speed)
- Python 3.10+
- A Google [Gemini API Key](https://aistudio.google.com/app/apikey)
- A Neon Postgres Connection String (`DATABASE_URL`)
- Clerk Publishable / Secret Keys

### 1. Clone the Repository
```bash
git clone https://github.com/OmVarma18/capstone_project.git
cd capstone_project
```

### 2. Configure Environment Variables
Create a `.env.local` file inside the `frontend/` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_URL=http://localhost:3001/api

# Required for local API testing:
GITHUB_TOKEN=your_github_personal_access_token
DATABASE_URL=your_neon_postgres_string
```

### 3. Run the Frontend & Local API
Open two terminal windows in the `frontend/` directory.

**Terminal 1: Start the React App**
```bash
bun install
bun run dev
```

**Terminal 2: Start the Local Backend API Simulator**
```bash
bun run local_server.js
```

The app will now be running at `http://localhost:5173`. 

*Note: In production, the local API router (`local_server.js`) will be replaced by Vercel Serverless Functions.*

---

## ⚙️ GitHub Actions Configuration

To enable the automated AI pipeline in your fork or repository, you must add the following **Repository Secrets** in your GitHub Settings (`Settings > Secrets and variables > Actions`):

- `DATABASE_URL`: Your exact Neon PostgreSQL connection string.
- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `PAT_TOKEN`: A GitHub Personal Access Token with Write permissions (for uploading/deleting audio files).

---

## 🛠️ Tech Stack Foundational Deep Dive

- **Vite & React:** Blazing fast frontend build tools.
- **Clerk:** Identity & User Management perfectly suited for React.
- **Neon:** A serverless Postgres platform built for modern cloud apps.
- **Whisper (OpenAI):** Robust local state-of-the-art Automatic Speech Recognition.
- **SpeechBrain:** An open-source, all-in-one conversational AI toolkit based on PyTorch for speaker diarization.
- **Google GenAI SDK:** Calling `gemini-2.5-flash` natively to extract structural heuristic tasks from raw text.
- **GitHub Actions:** CI/CD runners repurposed as asynchronous long-running task workers.
