"""Find the chunks most relevant to a question."""
from .embedder import embed
from .vector_store import SearchResult, VectorStore

# Results scoring below this cosine similarity are treated as unrelated to the question.
MIN_SCORE = 0.15


def retrieve(query: str, store: VectorStore, top_k: int = 4) -> list[SearchResult]:
    query_vector = embed([query])[0]
    return [r for r in store.search(query_vector, top_k) if r.score >= MIN_SCORE]
