"""Answer generation with Google Gemini, grounded in retrieved context."""
import logging
import time

import requests

from .config import settings
from .vector_store import SearchResult

log = logging.getLogger(__name__)

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
RETRYABLE_STATUS = {429, 500, 502, 503, 504}

PROMPT = """You are a research assistant helping a student understand academic papers.
Answer the question using ONLY the numbered context passages below.
Cite the passages you use like [1] or [2]. If the context does not contain the answer,
say "I couldn't find that in the uploaded documents." Do not make anything up.

Context:
{context}

Question: {question}
"""


class LLMError(RuntimeError):
    pass


def build_context(results: list[SearchResult]) -> str:
    return "\n\n".join(
        f"[{i}] ({r.chunk.document}, page {r.chunk.page})\n{r.chunk.text}" for i, r in enumerate(results, 1)
    )


def generate_answer(question: str, results: list[SearchResult], retries: int = 3) -> str:
    if not settings.gemini_api_key:
        raise LLMError("GEMINI_API_KEY is not set. Add it to backend/.env and restart the server.")

    payload = {
        "contents": [{"parts": [{"text": PROMPT.format(context=build_context(results), question=question)}]}],
        "generationConfig": {"temperature": 0.2},
    }
    url = API_URL.format(model=settings.gemini_model)
    headers = {"x-goog-api-key": settings.gemini_api_key}

    for attempt in range(1, retries + 1):
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=60)
        except requests.RequestException as exc:
            log.warning("Gemini request failed (attempt %d/%d): %s", attempt, retries, exc)
        else:
            if response.ok:
                try:
                    return response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                except (KeyError, IndexError, ValueError) as exc:
                    raise LLMError("Gemini returned an empty or blocked response.") from exc
            if response.status_code not in RETRYABLE_STATUS:
                message = response.json().get("error", {}).get("message", response.text)
                raise LLMError(f"Gemini error {response.status_code}: {message}")
            log.warning("Gemini busy (HTTP %d), attempt %d/%d", response.status_code, attempt, retries)
        if attempt < retries:
            time.sleep(2 ** attempt)

    raise LLMError("Gemini is busy right now. Please try again in a minute.")
