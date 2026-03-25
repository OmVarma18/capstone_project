from faster_whisper import WhisperModel
from speechbrain.pretrained import EncoderClassifier

def download_models():
    print("Downloading faster-whisper 'base' model...")
    # This downloads the CTranslate2-converted model to ~/.cache/huggingface
    WhisperModel("base", device="cpu", compute_type="int8")
    
    print("Downloading SpeechBrain Speaker Encoder...")
    # This downloads to ~/.cache/huggingface
    EncoderClassifier.from_hparams(
        source="speechbrain/spkrec-ecapa-voxceleb"
        # Using default cache to match pipeline.py behavior
    )

if __name__ == "__main__":
    download_models()
