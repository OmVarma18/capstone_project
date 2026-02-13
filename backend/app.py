import os
import shutil
import json
import logging
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user
from huggingface_hub import HfApi, hf_hub_download

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Select Pipeline based on Environment
# Selective Pipeline
if os.getenv("USE_MOCK_AI", "false").lower() == "true":
    from mock_pipeline import TalkNotePipeline
else:
    from pipeline import TalkNotePipeline

# Cloud Storage Config
HF_TOKEN = os.getenv("HF_TOKEN")
DATA_REPO = os.getenv("DATA_REPO")  # e.g. "Om-Varma/talknote-data"
hf_api = HfApi(token=HF_TOKEN)

app = FastAPI()

# CORS logic
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
    "*" # For development, allow all
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Pipeline (Global for now)
pipeline = TalkNotePipeline()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "TalkNote Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    user: dict = Depends(get_current_user)
):
    """
    Upload an audio file, save it temporarily, and process it with the pipeline.
    Requires Clerk Authentication.
    """
    try:
        # 1. Save file temporarily
        upload_dir = "temp_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        logger.info(f"File saved to {file_path}. User: {user.get('sub')}")
        
        # 2. Process file
        try:
            result = pipeline.process_file(file_path)
        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
        finally:
            # Cleanup
            if os.path.exists(file_path):
                os.remove(file_path)
                
        # 3. Save to Cloud (Hugging Face Model Repo)
        if HF_TOKEN and DATA_REPO:
            session_id = f"session_{int(datetime.now().timestamp())}"
            data_to_save = {
                "id": session_id,
                "user_id": user.get("sub"),
                "filename": file.filename,
                "date": datetime.now().isoformat(),
                "transcript": result.get("transcript", []),
                "summary": result.get("summary", ""),
                "tasks": result.get("tasks", [])
            }
            
            # Save local JSON then upload
            local_json = f"{session_id}.json"
            with open(local_json, "w") as f:
                json.dump(data_to_save, f)
                
            hf_api.upload_file(
                path_or_fileobj=local_json,
                path_in_repo=f"data/{user.get('sub')}/{local_json}",
                repo_id=DATA_REPO,
                repo_type="model"
            )
            os.remove(local_json)
            logger.info(f"Data synced to cloud: {DATA_REPO}")

        return {
            "status": "success",
            "filename": file.filename,
            "transcript": result.get("transcript", []),
            "summary": result.get("summary", ""),
            "tasks": result.get("tasks", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions")
async def list_sessions(user: dict = Depends(get_current_user)):
    """Fetch list of sessions from HF Cloud Storage"""
    if not HF_TOKEN or not DATA_REPO:
        return []
    
    try:
        files = hf_api.list_repo_files(repo_id=DATA_REPO, repo_type="model")
        user_prefix = f"data/{user.get('sub')}/"
        user_files = [f for f in files if f.startswith(user_prefix)]
        
        sessions = []
        for f_path in user_files:
            sessions.append({
                "id": f_path.split("/")[-1].replace(".json", ""),
                "path": f_path
            })
        return sessions
    except Exception as e:
        return {"error": str(e)}

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str, user: dict = Depends(get_current_user)):
    """Delete a session from HF Cloud Storage"""
    if not HF_TOKEN or not DATA_REPO:
        raise HTTPException(status_code=400, detail="Cloud storage not configured")
    
    file_path = f"data/{user.get('sub')}/{session_id}.json"
    try:
        hf_api.delete_file(
            path_in_repo=file_path,
            repo_id=DATA_REPO,
            repo_type="model"
        )
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    # Use 7860 to match HF Spaces and local .env.local
    uvicorn.run(app, host="0.0.0.0", port=7860)
