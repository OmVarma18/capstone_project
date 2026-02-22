import os
import glob
import json
import logging
import psycopg2
from psycopg2.extras import Json
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

def simple_summarize(transcript):
    """Placeholder for a better summarization model."""
    if not transcript:
        return "No content to summarize."
    
    # Just take the first few lines as a 'proxy' summary for now
    text_only = " ".join([seg['text'] for seg in transcript[:5]])
    return text_only[:200] + "..."

def process_files():
    # if not DATABASE_URL:
    #     logger.error("DATABASE_URL not found in environment variables.")
    #     return
    
    # create_table_if_not_exists()
    
    audio_files = []
    for ext in ['*.mp3', '*.wav', '*.m4a', '*.ogg']:
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
            summary = simple_summarize(result['transcript'])
            tasks = [] # We could add keyword extraction here later
            
            # --- DEBUG LOGGING ---
            logger.info("============== TRANSCRIPT RESULT ==============")
            logger.info(json.dumps(result['transcript'], indent=2))
            logger.info("============== SUMMARY RESULT =================")
            logger.info(summary)
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
