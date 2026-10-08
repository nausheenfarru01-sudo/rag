# RAG Research Paper Chatbot

[![tests](https://github.com/nausheenfarru01-sudo/rag/actions/workflows/tests.yml/badge.svg)](https://github.com/nausheenfarru01-sudo/rag/actions/workflows/tests.yml)

Ask questions about research papers and get answers grounded **only** in those papers, with page-level citations.
Upload one or more PDFs, and the app retrieves the most relevant passages using semantic search and asks Google Gemini to answer from them.

## Features

- **Semantic search:** chunks are embedded with Sentence-Transformers (`all-MiniLM-L6-v2`) and searched with a FAISS index (cosine similarity).
- **Grounded answers with citations:** Gemini 2.5 Flash answers only from the retrieved passages and cites them as `[1]`, `[2]`. Each answer shows its sources with document name, page number and match score.
- **Multiple documents:** upload several PDF, TXT or Markdown files and ask questions across all of them.
- **Robust API:** input validation, upload size limits, clear error messages, and retries with exponential backoff when Gemini is busy.
- **Tested:** 27 pytest tests covering chunking, vector search, the Gemini client and every API endpoint. They run offline in CI with fakes for the model and LLM.

## How it works

```
PDF ──► PyMuPDF text extraction (per page)
    ──► overlapping word chunks (300 words, 60 overlap)
    ──► Sentence-Transformer embeddings ──► FAISS index

Question ──► embedding ──► top-k similar chunks ──► Gemini prompt with numbered context
         ──► answer with [n] citations + sources
```

## Tech stack

Python · FastAPI · PyMuPDF · Sentence-Transformers · FAISS · Google Gemini API · HTML/CSS/JavaScript · pytest · GitHub Actions

## Getting started

Requires Python 3.10+.

```bash
git clone https://github.com/nausheenfarru01-sudo/rag.git
cd rag/rag-research-chatbot/backend

python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # Windows: copy .env.example .env
# then put your Gemini API key in .env (free key: https://aistudio.google.com/apikey)

uvicorn main:app --reload
```

Open http://127.0.0.1:8000, upload a paper and start asking questions.
The first upload downloads the embedding model (about 90 MB), which takes a minute once.

Interactive API docs are at http://127.0.0.1:8000/docs.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Server status and whether the Gemini key is configured |
| `POST` | `/api/upload` | Upload a PDF/TXT/MD file (multipart field `file`) and index it |
| `GET` | `/api/documents` | List indexed documents and their chunk counts |
| `DELETE` | `/api/documents` | Remove all documents |
| `POST` | `/api/chat` | `{"query": "...", "top_k": 4}` → `{"answer": "...", "sources": [...]}` |

## Configuration

All settings live in `backend/.env` (see `.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | — | Required for answers |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model name |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Sentence-Transformers model |
| `CHUNK_SIZE` / `CHUNK_OVERLAP` | `300` / `60` | Chunk length and overlap, in words |
| `TOP_K` | `4` | Passages retrieved per question |
| `MAX_UPLOAD_MB` | `20` | Upload size limit |

## Running tests

```bash
pip install -r requirements-dev.txt
pytest
```

## Project structure

```
rag-research-chatbot/
├── backend/
│   ├── main.py              # FastAPI app and routes
│   ├── rag/
│   │   ├── config.py        # settings from .env
│   │   ├── pdf_parser.py    # PDF/TXT text extraction per page
│   │   ├── chunker.py       # overlapping word chunks
│   │   ├── embedder.py      # Sentence-Transformers embeddings
│   │   ├── vector_store.py  # FAISS index
│   │   ├── retriever.py     # top-k semantic retrieval
│   │   └── llm.py           # Gemini client with retries
│   └── tests/
└── frontend/
    └── index.html           # chat UI, served by FastAPI at /
```

## Limitations and next steps

- Documents are kept in memory, so they are cleared when the server restarts. Persisting the FAISS index to disk is the next step.
- Scanned PDFs (images without text) need OCR first.
