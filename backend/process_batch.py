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
        The transcript may be in any language, but you MUST always respond in English.
        Return a beautiful, concise summary of the conversation in English, and extract an array of actionable tasks in English.
        Also, generate a short, professional title for the meeting based on the agenda discussed.
        
        For each task, determine the assignee (if mentioned, otherwise 'Unassigned') and the due date (if mentioned, otherwise 'N/A').
        
        Please format strictly as a JSON object matching this schema:
        {{
            "title": "A short, descriptive title based on the agenda",
            "summary": "a couple of sentences summarizing the main points in English",
            "tasks": [
                {{
                    "title": "The actionable task based on the transcript, written in English",
                    "status": "pending",
                    "assignee": "Person's name or Unassigned",
                    "due_date": "Date/Day or N/A"
                }}
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
        return {
            "title": data.get("title", ""),
            "summary": data.get("summary", ""),
            "tasks": data.get("tasks", [])
        }
        
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
    for ext in ['*.mp3', '*.wav', '*.m4a', '*.ogg', '*.m4p', '*.mp4', '*.webm', '*.weba']:
        audio_files.extend(glob.glob(os.path.join(UPLOAD_DIR, ext)))

    if not audio_files:
        logger.info("No audio files found to process.")
        return

    logger.info(f"Found {len(audio_files)} files to process.")
    
    # Initialize Pipeline (Model loading might take time)
    pipeline = TalkNotePipeline()

    for file_path in audio_files:
        try:
            filename = os.path.basename(file_path)
            logger.info(f"Processing: {filename}")
            
            # Parse language from filename: userId___timestamp_lang_filename.ext
            language = None
            try:
                # Split on '___' to get userId and the rest
                parts = filename.split('___', 1)
                if len(parts) == 2:
                    # rest = "timestamp_lang_filename.ext"
                    rest_parts = parts[1].split('_', 2)  # [timestamp, lang, filename.ext]
                    if len(rest_parts) >= 2:
                        lang_tag = rest_parts[1]
                        if lang_tag != 'auto' and len(lang_tag) == 2:
                            language = lang_tag
                            logger.info(f"Language detected from filename: {language}")
                        else:
                            logger.info("Language: auto-detect")
            except Exception as e:
                logger.warning(f"Could not parse language from filename: {e}")
            
            # 1. AI Processing
            result = pipeline.process_file(file_path, language=language)
            
            # 2. AI Insights (Summary & Tasks) via Gemini
            insights = generate_insights(result['transcript'])
            agenda_title = insights.get('title')
            summary = insights.get('summary', '')
            tasks = insights.get('tasks', [])
            
            # Use the AI title if valid, otherwise fallback to filename
            user_id_parts = filename.split('___')
            user_id = user_id_parts[0] if len(user_id_parts) > 1 else "unknown_user"
            original_title = user_id_parts[1].split('_', 1)[1] if len(user_id_parts) > 1 else filename
            final_title = agenda_title if (agenda_title and len(agenda_title) > 3) else original_title
            
            # --- DEBUG LOGGING ---
            logger.info("============== TRANSCRIPT RESULT ==============")
            logger.info(json.dumps(result['transcript'], indent=2))
            logger.info("============== INSIGHTS RESULT =================")
            logger.info(json.dumps(insights, indent=2))
            logger.info("===============================================")
            
            # 3. Save to Database
            # We connect to the DB *here* instead of before the AI processing,
            # because Neon DB closes idle connections if processing takes > 1 minute!
            conn = get_db_connection()
            cur = conn.cursor()
            
            try:
                cur.execute("""
                    INSERT INTO sessions (user_id, title, summary, transcript, tasks)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    user_id,
                    final_title,
                    summary,
                    Json(result['transcript']),
                    Json(tasks)
                ))
                conn.commit()
            except Exception as db_err:
                conn.rollback()
                logger.error(f"Database insertion error: {db_err}")
                raise db_err
            finally:
                cur.close()
                conn.close()
            
            # 4. Clean up original file
            os.remove(file_path)
            logger.info(f"Successfully processed and deleted {filename}")
            
        except Exception as e:
            logger.error(f"Error processing {filename}: {e}")
            # Stop swallowing exceptions in GitHub processing to ensure Action legitimately fails
            raise e

if __name__ == "__main__":
    # Ensure upload dir exists
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    process_files()
