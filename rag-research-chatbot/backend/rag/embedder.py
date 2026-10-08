"""Sentence embeddings, loaded lazily so the API starts fast."""
from functools import lru_cache

import numpy as np

from .config import settings


@lru_cache(maxsize=1)
def _model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(settings.embedding_model)


def embed(texts: list[str]) -> np.ndarray:
    """Return L2-normalised float32 embeddings, one row per text."""
    vectors = _model().encode(texts, batch_size=32, convert_to_numpy=True, normalize_embeddings=True)
    return np.asarray(vectors, dtype="float32")
