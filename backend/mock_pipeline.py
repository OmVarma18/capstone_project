import time
import logging

# Configure Logging
logger = logging.getLogger(__name__)

class TalkNotePipeline:
    def __init__(self, session_id: str = "temp_session"):
        logger.info(f"Initializing Mock Pipeline for session {session_id}")
        self.session_id = session_id

    def process_file(self, file_path: str):
        """Mock processing that returns fake data."""
        logger.info(f"Processing file: {file_path}")
        time.sleep(2) # Simulate processing delay
        
        return {
            "transcript": [
                {
                    "start": 0.0,
                    "end": 2.5,
                    "text": "This is a simulated transcript from the mock backend.",
                    "speaker": "SPEAKER_1"
                },
                {
                    "start": 3.0,
                    "end": 6.0,
                    "text": "We are using this mode to test the frontend without downloading heavy AI models.",
                    "speaker": "SPEAKER_2"
                },
                {
                    "start": 6.5,
                    "end": 9.0,
                    "text": "Once deployed to Hugging Face, real analysis will happen.",
                    "speaker": "SPEAKER_1"
                }
            ],
            "speakers": ["SPEAKER_1", "SPEAKER_2"],
            "summary": "The team discussed the benefits of using a mock backend for parallel development of AI features and frontend UI components.",
            "tasks": [
                {
                    "title": "Complete Frontend Integration",
                    "meeting": "Local Dev Sync",
                    "assignee": "User",
                    "due": "2024-02-15",
                    "status": "In Progress"
                },
                {
                    "title": "Deploy to Hugging Face",
                    "meeting": "Local Dev Sync",
                    "assignee": "User",
                    "due": "2024-02-20",
                    "status": "To Do"
                }
            ]
        }
