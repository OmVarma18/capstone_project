import os
import torch
import logging
import numpy as np
import librosa
import whisper
from speechbrain.inference.speaker import EncoderClassifier
from sklearn.cluster import SpectralClustering
from sklearn.metrics import silhouette_score
from collections import defaultdict

# Configure Logging
logger = logging.getLogger(__name__)

SAMPLE_RATE = 16000
DEVICE = "cpu" # Force CPU for compatibility, change to "cuda" if GPU is available

class TalkNotePipeline:
    def __init__(self, session_id: str = "temp_session"):
        logger.info(f"Initializing TalkNotePipeline for session {session_id}")
        self.session_id = session_id
        self.sample_rate = SAMPLE_RATE
        
        # Load models (Lazily or Global for performance in prod)
        # For this implementation, we load them here. 
        # In production, move these outside the class to load only once.
        logger.info("Loading Whisper...")
        self.asr_model = whisper.load_model("base", device=DEVICE)
        
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
        
    def process_file(self, file_path: str):
        """Main entry point to process a full audio file."""
        logger.info(f"Processing file: {file_path}")
        
        # 1. Load Audio
        audio, _ = librosa.load(file_path, sr=self.sample_rate, mono=True)
        self.audio = audio
        
        # 2. Run ASR
        logger.info("Running ASR...")
        result = self.asr_model.transcribe(self.audio, verbose=False)
        self.asr_segments = result.get("segments", [])
        
        # 3. Extract Embeddings (simplified block processing)
        logger.info("Extracting Embeddings...")
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
        # Simplified sliding window
        window_len = int(self.sample_rate * 1.5) # 1.5s window
        stride = int(self.sample_rate * 0.75)    # 0.75s stride
        
        audio_tensor = torch.from_numpy(self.audio).to(DEVICE)
        
        for start in range(0, max(1, len(self.audio) - window_len), stride):
            window = audio_tensor[start:start+window_len]
            # Ensure correct shape for speechbrain [batch, time]
            if len(window) < window_len: continue
            
            with torch.no_grad():
                # SpeechBrain expects [batch, time]
                emb = self.embedder.encode_batch(window.unsqueeze(0))
                emb = emb.squeeze(0).squeeze(0).cpu().numpy()
                
            self.embeddings.append({
                "start": start / self.sample_rate,
                "end": (start + window_len) / self.sample_rate,
                "embedding": emb
            })

    def _cluster_speakers(self):
        if not self.embeddings: return
        
        X = np.stack([e["embedding"] for e in self.embeddings])
        
        # Estimate number of speakers (simplified)
        n_speakers = self._estimate_num_speakers(X)
        logger.info(f"Estimated speakers: {n_speakers}")
        
        clusterer = SpectralClustering(
            n_clusters=n_speakers,
            affinity="nearest_neighbors",
            assign_labels="kmeans",
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
        for seg in self.asr_segments:
            # Find closest speaker embedding in time
            seg_mid = (seg["start"] + seg["end"]) / 2
            
            # Get embeddings that overlap with this segment
            # Simplified: just find nearest embedding in time
             # Or better: average embedding of the segment window
            
            best_spk = "UNKNOWN"
            best_sim = -1
            
            # Simple matching: find speaker with highest cosine sim in overlap
            # (Skipping complex overlap logic for MVP, assuming closest embedding)
            
            # Find embeddings within segment timeframe
            relevant_embs = [
                e for e in self.embeddings 
                if e["start"] >= seg["start"] and e["end"] <= seg["end"]
            ]
            
            if relevant_embs:
                # Majority vote or average
                counts = defaultdict(int)
                for e in relevant_embs:
                    counts[e["cluster"]] += 1
                top_cluster = max(counts, key=counts.get)
                best_spk = f"SPEAKER_{top_cluster}"
            else:
                 # Fallback: nearest temporal embedding
                 if self.embeddings:
                     nearest = min(self.embeddings, key=lambda e: abs(e["start"] - seg["start"]))
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
        current = self.aligned_segments[0]
        
        for next_seg in self.aligned_segments[1:]:
            if next_seg["speaker"] == current["speaker"] and (next_seg["start"] - current["end"] < 2.0):
                current["end"] = next_seg["end"]
                current["text"] += " " + next_seg["text"]
            else:
                merged.append(current)
                current = next_seg
        merged.append(current)
        self.final_transcript = merged
