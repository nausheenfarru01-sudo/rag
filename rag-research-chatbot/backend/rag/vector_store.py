"""In-memory FAISS index over chunk embeddings (cosine similarity via inner product)."""
import threading
from dataclasses import dataclass

import faiss
import numpy as np

from .chunker import Chunk


@dataclass
class SearchResult:
    chunk: Chunk
    score: float


class VectorStore:
    def __init__(self, dim: int):
        self.dim = dim
        self._index = faiss.IndexFlatIP(dim)
        self._chunks: list[Chunk] = []
        self._vectors = np.empty((0, dim), dtype="float32")
        self._lock = threading.Lock()

    def __len__(self) -> int:
        return len(self._chunks)

    def add(self, embeddings: np.ndarray, chunks: list[Chunk]) -> None:
        if len(embeddings) != len(chunks):
            raise ValueError("embeddings and chunks must have the same length")
        if len(chunks) == 0:
            return
        vectors = np.asarray(embeddings, dtype="float32")
        with self._lock:
            self._index.add(vectors)
            self._vectors = np.vstack([self._vectors, vectors])
            self._chunks.extend(chunks)

    def search(self, query_embedding: np.ndarray, top_k: int = 4) -> list[SearchResult]:
        with self._lock:
            if not self._chunks:
                return []
            query = np.asarray(query_embedding, dtype="float32").reshape(1, -1)
            scores, ids = self._index.search(query, min(top_k, len(self._chunks)))
            return [SearchResult(self._chunks[i], float(s)) for s, i in zip(scores[0], ids[0]) if i != -1]

    def documents(self) -> dict[str, int]:
        """Document name -> number of chunks, in upload order."""
        counts: dict[str, int] = {}
        with self._lock:
            for chunk in self._chunks:
                counts[chunk.document] = counts.get(chunk.document, 0) + 1
        return counts

    def remove(self, document: str) -> int:
        """Drop every chunk of one document and rebuild the index. Returns how many were removed."""
        with self._lock:
            keep = [i for i, c in enumerate(self._chunks) if c.document != document]
            removed = len(self._chunks) - len(keep)
            if removed:
                self._chunks = [self._chunks[i] for i in keep]
                self._vectors = self._vectors[keep]
                self._index.reset()
                if len(keep):
                    self._index.add(self._vectors)
            return removed

    def clear(self) -> None:
        with self._lock:
            self._index.reset()
            self._chunks.clear()
            self._vectors = np.empty((0, self.dim), dtype="float32")
