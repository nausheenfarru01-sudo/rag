"""API tests with the embedding model and Gemini replaced by fakes, so they run offline."""

import numpy as np
import pytest
from fastapi.testclient import TestClient

import main
from rag import embedder, llm

VOCAB = ["transformer", "attention", "dataset", "accuracy", "student"]


def fake_embed(texts):
    rows = []
    for text in texts:
        words = [w.strip(".,?!") for w in text.lower().split()]
        v = np.array([words.count(w) for w in VOCAB] + [0.01], dtype="float32")
        rows.append(v / np.linalg.norm(v))
    return np.stack(rows)


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(embedder, "embed", fake_embed)
    monkeypatch.setattr("rag.retriever.embed", fake_embed)
    monkeypatch.setattr(llm, "generate_answer", lambda q, results: f"answer from {len(results)} passages [1]")
    main.store = None
    return TestClient(main.app)


def upload_text(client, name="paper.txt", text="The transformer uses attention. " * 20):
    return client.post("/api/upload", files={"file": (name, text.encode(), "text/plain")})


def test_health(client):
    assert client.get("/api/health").json()["status"] == "ok"


def test_frontend_is_served(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "<html" in response.text.lower()


def test_chat_before_upload_is_rejected(client):
    assert client.post("/api/chat", json={"query": "hi"}).status_code == 400


def test_upload_then_chat_returns_answer_and_sources(client):
    response = upload_text(client)
    assert response.status_code == 200
    assert response.json()["chunks"] >= 1

    data = client.post("/api/chat", json={"query": "How does attention work?"}).json()
    assert data["answer"].startswith("answer from")
    assert data["sources"][0]["document"] == "paper.txt"
    assert data["sources"][0]["page"] == 1


def test_duplicate_upload_is_rejected(client):
    upload_text(client)
    assert upload_text(client).status_code == 409


def test_unsupported_file_type(client):
    response = client.post("/api/upload", files={"file": ("slides.pptx", b"x", "application/octet-stream")})
    assert response.status_code == 400


def test_empty_document(client):
    assert upload_text(client, text="   ").status_code == 422


def test_documents_list_and_clear(client):
    upload_text(client, "a.txt")
    upload_text(client, "b.txt")
    names = [d["name"] for d in client.get("/api/documents").json()["documents"]]
    assert names == ["a.txt", "b.txt"]
    client.delete("/api/documents")
    assert client.get("/api/documents").json()["documents"] == []


def test_pdf_upload(client):
    import fitz

    doc = fitz.open()
    doc.new_page().insert_text((72, 72), "The dataset accuracy improved for every student.")
    response = client.post("/api/upload", files={"file": ("p.pdf", doc.tobytes(), "application/pdf")})
    assert response.status_code == 200
    assert response.json()["pages"] == 1


def test_llm_error_becomes_502(client, monkeypatch):
    def boom(q, results):
        raise llm.LLMError("no key")

    monkeypatch.setattr(llm, "generate_answer", boom)
    upload_text(client)
    response = client.post("/api/chat", json={"query": "attention"})
    assert response.status_code == 502
    assert response.json()["detail"] == "no key"
