import os
import shutil
# Trigger Deploy v2
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user
import os

# Select Pipeline based on Environment
if os.getenv("USE_MOCK_AI", "false").lower() == "true":
    from mock_pipeline import TalkNotePipeline
else:
    from pipeline import TalkNotePipeline

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
            
        print(f"[INFO] File saved to {file_path}. User: {user.get('sub')}")
        
        # 2. Process file
        try:
            result = pipeline.process_file(file_path)
        except Exception as e:
            print(f"[ERROR] Pipeline failed: {e}")
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
        finally:
            # Cleanup
            if os.path.exists(file_path):
                os.remove(file_path)
                
        # 3. Return result
        return {
            "status": "success",
            "filename": file.filename,
            "transcript": result["transcript"],
            "speakers": result["speakers"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
