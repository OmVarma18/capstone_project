import os
import glob
import json
import logging
import psycopg2
from psycopg2.extras import Json
from google import genai
from pipeline import TalkNotePipeline
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
UPLOAD_DIR = "uploads"
DATABASE_URL = os.environ.get("DATABASE_URL")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def create_table_if_not_exists():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            summary TEXT,
            transcript JSONB,
            tasks JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

def generate_insights(transcript):
    """Uses Gemini to generate a summary and a list of actionable tasks from the transcript."""
    if not transcript:
        return {"summary": "No content to summarize.", "tasks": []}
    
    text_only = " ".join([seg['text'] for seg in transcript])
    
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not found. Using simple fallback summary.")
        return {
            "summary": text_only[:200] + "...",
            "tasks": []
        }

    try:
        prompt = f"""
        You are an intelligent meeting assistant. Analyze the following meeting transcript.
        Return a beautiful, concise summary of the conversation, and extract an array of actionable tasks.
        
        Please format strictly as a JSON object matching this schema:
        {{
            "summary": "a couple of sentences summarizing the main points",
            "tasks": [
                {{"title": "The actionable task based on the transcript", "status": "pending"}}
            ]
        }}
        
        Transcript: 
        {text_only}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Safely clean up Gemini's response string before parsing
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()
            
        # Parse the JSON response
        data = json.loads(raw_text)
        return {"summary": data.get("summary", ""), "tasks": data.get("tasks", [])}
        
    except Exception as e:
        logger.error(f"Error calling Gemini AI: {e}")
        # Try to log the raw text if available for debugging
        try:
            logger.error(f"Raw Gemini Output was: {response.text}")
        except:
            pass
        
        return {
            "summary": text_only[:200] + "... (AI summary failed)",
            "tasks": []
        }

def process_files():
    # if not DATABASE_URL:
    #     logger.error("DATABASE_URL not found in environment variables.")
    #     return
    
    # create_table_if_not_exists()
    
    audio_files = []
    for ext in ['*.mp3', '*.wav', '*.m4a', '*.ogg', '*.m4p', '*.mp4']:
        audio_files.extend(glob.glob(os.path.join(UPLOAD_DIR, ext)))

    if not audio_files:
        logger.info("No audio files found to process.")
        return

    logger.info(f"Found {len(audio_files)} files to process.")
    
    # Initialize Pipeline (Model loading might take time)
    pipeline = TalkNotePipeline()

    conn = get_db_connection()
    cur = conn.cursor()

    for file_path in audio_files:
        try:
            filename = os.path.basename(file_path)
            logger.info(f"Processing: {filename}")
            
            # 1. AI Processing
            result = pipeline.process_file(file_path)
            
            # 2. Heuristic Summary & Tasks (Mocking for now)
            insights = generate_insights(result['transcript'])
            summary = insights['summary']
            tasks = insights['tasks']
            
            # --- DEBUG LOGGING ---
            logger.info("============== TRANSCRIPT RESULT ==============")
            logger.info(json.dumps(result['transcript'], indent=2))
            logger.info("============== INSIGHTS RESULT =================")
            logger.info(json.dumps(insights, indent=2))
            logger.info("===============================================")
            
            # 3. Save to Database
            # Filename format from upload.js: userId___timestamp_filename.ext
            user_id_parts = filename.split('___')
            user_id = user_id_parts[0] if len(user_id_parts) > 1 else "unknown_user"
            original_title = user_id_parts[1].split('_', 1)[1] if len(user_id_parts) > 1 else filename

            cur.execute("""
                INSERT INTO sessions (user_id, title, summary, transcript, tasks)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                user_id,
                original_title,
                summary,
                Json(result['transcript']),
                Json(tasks)
            ))
            
            # 4. Clean up original file
            os.remove(file_path)
            logger.info(f"Successfully processed and deleted {filename}")
            
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")

    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    # Ensure upload dir exists
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    process_files()
