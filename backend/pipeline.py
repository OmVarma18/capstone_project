import os
import torch
import logging
import numpy as np
import librosa
from faster_whisper import WhisperModel
from speechbrain.pretrained import EncoderClassifier
from sklearn.cluster import SpectralClustering
from sklearn.metrics import silhouette_score
from collections import defaultdict

# Configure Logging
logger = logging.getLogger(__name__)

SAMPLE_RATE = 16000
DEVICE = "cpu"  # Force CPU for compatibility, change to "cuda" if GPU is available

class TalkNotePipeline:
    def __init__(self, session_id: str = "temp_session"):
        logger.info(f"Initializing TalkNotePipeline for session {session_id}")
        self.session_id = session_id
        self.sample_rate = SAMPLE_RATE
        
        # Load faster-whisper model with int8 quantization for speed
        # Uses CTranslate2 backend — ~4x faster than openai-whisper on CPU
        logger.info("Loading Whisper (faster-whisper)...")
        self.asr_model = WhisperModel("base", device="cpu", compute_type="int8")
        
        logger.info("Loading Speaker Encoder...")
        self.embedder = EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb",
            run_opts={"device": DEVICE}
        )
        
        # Session State
        self.audio = None
        self.asr_segments = []
        self.embeddings = []
        self.aligned_segments = []
        self.final_transcript = []
        self.memory_bank = {}
        
    def process_file(self, file_path: str, language: str = None):
        """Main entry point to process a full audio file.
        
        Args:
            file_path: Path to the audio file.
            language: Optional language code (e.g. 'en', 'hi', 'es'). 
                      If None, Whisper auto-detects the language.
        """
        logger.info(f"Processing file: {file_path}")
        
        # Reset session state for each file to prevent duplication
        self.audio = None
        self.asr_segments = []
        self.embeddings = []
        self.aligned_segments = []
        self.final_transcript = []
        self.memory_bank = {}
        
        # 1. Load Audio
        audio, _ = librosa.load(file_path, sr=self.sample_rate, mono=True)
        self.audio = audio
        
        # 2. Run ASR with faster-whisper
        logger.info(f"Running ASR (language={'auto-detect' if language is None else language})...")
        segments_generator, info = self.asr_model.transcribe(
            self.audio, 
            language=language,
            beam_size=5,
            vad_filter=True,          # Skip silence — big speedup for meetings with pauses
            vad_parameters=dict(
                min_silence_duration_ms=500,  # Treat 500ms+ silence as a gap
            )
        )
        
        # Collect segments from the generator into a list
        # faster-whisper returns segment objects, convert to dicts for compatibility
        self.asr_segments = []
        for seg in segments_generator:
            self.asr_segments.append({
                "start": seg.start,
                "end": seg.end,
                "text": seg.text.strip()
            })
        
        logger.info(f"ASR complete: {len(self.asr_segments)} segments, detected language: {info.language} ({info.language_probability:.1%})")
        
        # 3. Extract Embeddings — OPTIMIZED: only at segment boundaries
        logger.info("Extracting Speaker Embeddings (segment-level)...")
        self._extract_embeddings()
        
        # 4. Diarization (Clustering)
        logger.info("Clustering Speakers...")
        self._cluster_speakers()
        
        # 5. Align & Merge
        logger.info("Aligning & Merging...")
        self._align_segments()
        self._merge_segments()
        
        return {
            "transcript": self.final_transcript,
            "speakers": list(self.memory_bank.keys())
        }

    def _extract_embeddings(self):
        """OPTIMIZED: Extract one speaker embedding per ASR segment.
        
        Instead of sliding a window across the entire audio (old approach),
        we extract embeddings only for the time ranges Whisper identified as speech.
        
        Old approach: 30 min audio → ~2,400 embedding calls (1.5s window, 0.75s stride)
        New approach: 30 min audio → ~200-300 embedding calls (one per segment)
        
        This is 10-20x fewer neural net calls AND more accurate, because each
        embedding covers exactly one speech utterance.
        """
        MIN_SEGMENT_SAMPLES = int(self.sample_rate * 0.5)  # Min 0.5s for reliable embedding
        
        audio_tensor = torch.from_numpy(self.audio).to(DEVICE)
        
        for seg in self.asr_segments:
            start_sample = int(seg["start"] * self.sample_rate)
            end_sample = int(seg["end"] * self.sample_rate)
            
            # Skip very short segments (less than 0.5s) — embeddings would be unreliable
            if (end_sample - start_sample) < MIN_SEGMENT_SAMPLES:
                continue
            
            # Clamp to audio boundaries
            start_sample = max(0, start_sample)
            end_sample = min(len(self.audio), end_sample)
            
            window = audio_tensor[start_sample:end_sample]
            
            with torch.no_grad():
                # SpeechBrain expects [batch, time]
                emb = self.embedder.encode_batch(window.unsqueeze(0))
                emb = emb.squeeze(0).squeeze(0).cpu().numpy()
                
            self.embeddings.append({
                "start": seg["start"],
                "end": seg["end"],
                "embedding": emb,
                "segment_index": len(self.embeddings)  # Track which segment this came from
            })

    def _cluster_speakers(self):
        if not self.embeddings: return
        
        X = np.stack([e["embedding"] for e in self.embeddings])
        
        # Estimate number of speakers (simplified)
        n_speakers = self._estimate_num_speakers(X)
        logger.info(f"Estimated speakers: {n_speakers}")
        
        # Fix for short audio files: nearest_neighbors requires n_neighbors <= n_samples
        n_neighbors = min(10, len(X) - 1)
        if n_neighbors < 1:
            n_neighbors = 1
            
        clusterer = SpectralClustering(
            n_clusters=n_speakers,
            affinity='nearest_neighbors',
            n_neighbors=n_neighbors,
            random_state=42
        )
        labels = clusterer.fit_predict(X)
        
        for i, label in enumerate(labels):
            self.embeddings[i]["cluster"] = int(label)
            
            # Initialize memory bank
            spk = f"SPEAKER_{label}"
            if spk not in self.memory_bank:
                self.memory_bank[spk] = self.embeddings[i]["embedding"]

    def _estimate_num_speakers(self, X, k_min=2, k_max=5):
        if len(X) < k_max: return 2
        best_k = 2
        best_score = -1
        
        for k in range(k_min, k_max + 1):
            clusterer = SpectralClustering(n_clusters=k, random_state=42)
            labels = clusterer.fit_predict(X)
            score = silhouette_score(X, labels)
            if score > best_score:
                best_score = score
                best_k = k
        return best_k

    def _align_segments(self):
        """Assign each ASR segment a speaker label from the closest embedding.
        
        Since embeddings now map 1-to-1 with ASR segments (same time boundaries),
        this is much simpler and more accurate than the old approach.
        """
        for seg in self.asr_segments:
            best_spk = "UNKNOWN"
            
            # Find the embedding whose time range best matches this segment
            # With our new approach, there should be a direct match or very close one
            best_emb = None
            best_overlap = 0
            
            for emb in self.embeddings:
                # Calculate temporal overlap
                overlap_start = max(seg["start"], emb["start"])
                overlap_end = min(seg["end"], emb["end"])
                overlap = max(0, overlap_end - overlap_start)
                
                if overlap > best_overlap:
                    best_overlap = overlap
                    best_emb = emb
            
            if best_emb and "cluster" in best_emb:
                best_spk = f"SPEAKER_{best_emb['cluster']}"
            elif self.embeddings:
                # Fallback: nearest temporal embedding
                nearest = min(self.embeddings, key=lambda e: abs(e["start"] - seg["start"]))
                if "cluster" in nearest:
                    best_spk = f"SPEAKER_{nearest['cluster']}"

            self.aligned_segments.append({
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"].strip(),
                "speaker": best_spk
            })

    def _merge_segments(self):
        if not self.aligned_segments: return
        
        merged = []
        current = self.aligned_segments[0].copy()
        
        for next_seg in self.aligned_segments[1:]:
            if next_seg["speaker"] == current["speaker"] and (next_seg["start"] - current["end"] < 2.0):
                current["end"] = next_seg["end"]
                current["text"] += " " + next_seg["text"]
            else:
                merged.append(current)
                current = next_seg.copy()
        merged.append(current)
        self.final_transcript = merged
