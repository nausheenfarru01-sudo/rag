"""Split page text into overlapping word windows."""
from dataclasses import dataclass


@dataclass
class Chunk:
    text: str
    document: str
    page: int


def chunk_text(text: str, size: int = 300, overlap: int = 60) -> list[str]:
    if size <= 0:
        raise ValueError("size must be positive")
    if not 0 <= overlap < size:
        raise ValueError("overlap must be between 0 and size - 1")

    words = text.split()
    chunks = []
    step = size - overlap
    for start in range(0, len(words), step):
        chunks.append(" ".join(words[start:start + size]))
        if start + size >= len(words):
            break
    return chunks


def chunk_pages(pages: list[tuple[int, str]], document: str, size: int, overlap: int) -> list[Chunk]:
    return [
        Chunk(text=piece, document=document, page=page)
        for page, text in pages
        for piece in chunk_text(text, size, overlap)
    ]
