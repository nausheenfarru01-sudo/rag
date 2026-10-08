import numpy as np

from rag.chunker import Chunk
from rag.vector_store import VectorStore


def _unit(v):
    v = np.asarray(v, dtype="float32")
    return v / np.linalg.norm(v)


def test_search_returns_most_similar_first():
    store = VectorStore(2)
    chunks = [Chunk("east", "d", 1), Chunk("north", "d", 2)]
    store.add(np.stack([_unit([1, 0]), _unit([0, 1])]), chunks)

    results = store.search(_unit([0.9, 0.1]), top_k=2)
    assert [r.chunk.text for r in results] == ["east", "north"]
    assert results[0].score > results[1].score


def test_empty_store_returns_nothing():
    assert VectorStore(3).search(_unit([1, 0, 0])) == []


def test_documents_and_clear():
    store = VectorStore(2)
    store.add(np.stack([_unit([1, 0]), _unit([0, 1])]), [Chunk("a", "x.pdf", 1), Chunk("b", "x.pdf", 2)])
    assert store.documents() == {"x.pdf": 2}
    store.clear()
    assert len(store) == 0
