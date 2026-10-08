"""FastAPI server for the RAG Research Paper Chatbot."""
import logging
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from rag import embedder, llm, retriever
from rag.chunker import chunk_pages
from rag.config import settings
from rag.pdf_parser import UnsupportedFileError, extract_pages
from rag.vector_store import VectorStore

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("rag")

FRONTEND = Path(__file__).resolve().parent.parent / "frontend" / "index.html"

app = FastAPI(title="RAG Research Paper Chatbot", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

store: VectorStore | None = None


class ChatRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    top_k: int = Field(default=settings.top_k, ge=1, le=10)


class Source(BaseModel):
    document: str
    page: int
    score: float
    text: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]


@app.get("/", include_in_schema=False)
def index():
    return FileResponse(FRONTEND)


@app.get("/api/health")
def health():
    return {"status": "ok", "llm_configured": bool(settings.gemini_api_key)}


@app.get("/api/documents")
def list_documents():
    docs = store.documents() if store else {}
    return {"documents": [{"name": name, "chunks": n} for name, n in docs.items()]}


@app.delete("/api/documents")
def clear_documents():
    if store:
        store.clear()
    return {"message": "All documents removed"}


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    global store

    data = await file.read()
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(413, f"File is larger than {settings.max_upload_mb} MB")

    name = file.filename or "document"
    if store and name in store.documents():
        raise HTTPException(409, f"'{name}' is already uploaded")

    try:
        pages = extract_pages(name, data)
    except UnsupportedFileError as exc:
        raise HTTPException(400, str(exc)) from exc

    chunks = chunk_pages(pages, name, settings.chunk_size, settings.chunk_overlap)
    if not chunks:
        raise HTTPException(422, "No text found. Scanned PDFs need OCR before upload.")

    vectors = embedder.embed([c.text for c in chunks])
    if store is None:
        store = VectorStore(vectors.shape[1])
    store.add(vectors, chunks)

    log.info("Indexed %s: %d pages, %d chunks", name, len(pages), len(chunks))
    return {"message": f"Indexed {name}", "document": name, "pages": len(pages), "chunks": len(chunks)}


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not store or len(store) == 0:
        raise HTTPException(400, "Upload a document first")

    results = retriever.retrieve(request.query, store, request.top_k)
    sources = [
        Source(document=r.chunk.document, page=r.chunk.page, score=round(r.score, 3), text=r.chunk.text)
        for r in results
    ]
    if not results:
        return ChatResponse(answer="I couldn't find anything related to that in the uploaded documents.", sources=[])

    try:
        answer = llm.generate_answer(request.query, results)
    except llm.LLMError as exc:
        raise HTTPException(502, str(exc)) from exc
    return ChatResponse(answer=answer, sources=sources)
