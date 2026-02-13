import whisper
from speechbrain.pretrained import EncoderClassifier

def download_models():
    print("Downloading Whisper 'base' model...")
    # This downloads to ~/.cache/whisper
    whisper.load_model("base")
    
    print("Downloading SpeechBrain Speaker Encoder...")
    # This downloads to ~/.cache/huggingface
    EncoderClassifier.from_hparams(
        source="speechbrain/spkrec-ecapa-voxceleb"
        # Using default cache to match pipeline.py behavior
    )

if __name__ == "__main__":
    download_models()
