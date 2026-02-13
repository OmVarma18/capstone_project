FROM python:3.10

WORKDIR /app

# Install system dependencies for audio processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set cache directories to a writable location
ENV XDG_CACHE_HOME=/app/.cache \
    HF_HOME=/app/.cache/huggingface

# Install system dependencies for audio processing
# ... (apt-get update is fine)

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
# Using --no-cache-dir to keep image size smaller
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download models (Whisper + SpeechBrain) to embed them in the image
COPY preload_models.py .
RUN python preload_models.py && \
    chmod -R 777 /app/.cache

# Copy application code
COPY . .

# Expose port (HF Spaces expects 7860)
EXPOSE 7860

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
