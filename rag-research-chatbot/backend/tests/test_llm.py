import dataclasses

import pytest

from rag import llm
from rag.chunker import Chunk
from rag.vector_store import SearchResult

RESULTS = [SearchResult(Chunk("Attention is all you need.", "paper.pdf", 3), 0.8)]


class FakeResponse:
    def __init__(self, status, body):
        self.status_code = status
        self.ok = status == 200
        self._body = body
        self.text = str(body)

    def json(self):
        return self._body


@pytest.fixture(autouse=True)
def with_key(monkeypatch):
    monkeypatch.setattr(llm, "settings", dataclasses.replace(llm.settings, gemini_api_key="test-key"))
    monkeypatch.setattr(llm.time, "sleep", lambda s: None)


def ok(text):
    return FakeResponse(200, {"candidates": [{"content": {"parts": [{"text": text}]}}]})


def test_context_is_numbered_with_pages():
    assert llm.build_context(RESULTS) == "[1] (paper.pdf, page 3)\nAttention is all you need."


def test_success(monkeypatch):
    calls = []
    monkeypatch.setattr(llm.requests, "post", lambda url, **kw: calls.append(kw) or ok(" The answer [1] "))
    assert llm.generate_answer("q", RESULTS) == "The answer [1]"
    assert calls[0]["headers"]["x-goog-api-key"] == "test-key"


def test_retries_when_busy(monkeypatch):
    responses = iter([FakeResponse(503, {}), ok("done")])
    monkeypatch.setattr(llm.requests, "post", lambda url, **kw: next(responses))
    assert llm.generate_answer("q", RESULTS) == "done"


def test_gives_up_after_retries(monkeypatch):
    monkeypatch.setattr(llm.requests, "post", lambda url, **kw: FakeResponse(503, {}))
    with pytest.raises(llm.LLMError, match="busy"):
        llm.generate_answer("q", RESULTS)


def test_client_error_is_not_retried(monkeypatch):
    calls = []
    bad = FakeResponse(400, {"error": {"message": "API key not valid"}})
    monkeypatch.setattr(llm.requests, "post", lambda url, **kw: calls.append(1) or bad)
    with pytest.raises(llm.LLMError, match="API key not valid"):
        llm.generate_answer("q", RESULTS)
    assert len(calls) == 1


def test_missing_key(monkeypatch):
    monkeypatch.setattr(llm, "settings", dataclasses.replace(llm.settings, gemini_api_key=""))
    with pytest.raises(llm.LLMError, match="GEMINI_API_KEY"):
        llm.generate_answer("q", RESULTS)


def test_history_is_included_in_prompt(monkeypatch):
    sent = []
    monkeypatch.setattr(llm.requests, "post", lambda url, **kw: sent.append(kw["json"]) or ok("ok"))
    history = [{"role": "user", "content": "What is attention?"}, {"role": "assistant", "content": "A mechanism."}]
    llm.generate_answer("Simpler please", RESULTS, history)
    prompt = sent[0]["contents"][0]["parts"][0]["text"]
    assert "Student: What is attention?" in prompt
    assert "Assistant: A mechanism." in prompt


def test_history_is_trimmed():
    history = [{"role": "user", "content": f"q{i}"} for i in range(10)]
    text = llm.build_history(history)
    assert "q3" not in text and "q4" in text and "q9" in text
