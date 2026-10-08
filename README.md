# ResearchMind: RAG Research Paper Chatbot

[![tests](https://github.com/nausheenfarru01-sudo/rag/actions/workflows/tests.yml/badge.svg)](https://github.com/nausheenfarru01-sudo/rag/actions/workflows/tests.yml)

Ask questions about research papers and get answers grounded **only** in those papers, with page-level citations.
Upload one or more PDFs, and the app retrieves the most relevant passages using semantic search and asks Google Gemini to answer from them.

## Features

**Retrieval and answers**
- **Semantic search:** chunks are embedded with Sentence-Transformers (`all-MiniLM-L6-v2`) and searched with a FAISS index (cosine similarity).
- **Grounded answers with citations:** Gemini 2.5 Flash answers only from the retrieved passages and cites them as `[1]`, `[2]`.
- **Follow-up questions:** recent conversation turns are sent along, so "explain that more simply" works.
- **A library of papers:** upload several PDF, TXT or Markdown files, see pages, chunks and size for each, and remove any one of them (the FAISS index is rebuilt).

**Interface**
- **Three-panel layout:**
  - a sidebar with saved conversations (searchable) and the paper library
  - the chat in the middle
  - a Sources panel showing every passage used, with page number, match score and your question's keywords highlighted
- **Clickable citations:** click `[2]` in an answer to jump to that passage.
- **Rich answers:** headings, lists, bold and code render properly, with copy and regenerate buttons and response time.
- **Live progress:** "Searching → Reading → Writing" steps while an answer is generated, and a Stop button to cancel.
- **Getting started:** suggested questions (summarize, methodology, limitations, explain simply) and a big drop zone.
- **Uploads:** drag papers anywhere onto the window.
- **Status:** a live pill shows whether the backend is up and the Gemini key is configured.
- **Settings:** light and dark themes, accent colours, and how many passages to retrieve per answer.
- **Keyboard shortcuts:** `Ctrl+K` new chat, `/` focus, `Ctrl+U` upload, `Ctrl+.` sources panel, `Esc` stop, `?` help.
- **Responsive:** on mobile the sidebar and sources panel become slide-out drawers.
- **No build step:** plain HTML, CSS and JavaScript served by FastAPI.

**Engineering**
- **Robust API:** input validation, upload size limits, clear errors, and retries with exponential backoff when Gemini is busy.
- **Tested:** 34 pytest tests covering chunking, the vector store (including document removal), the Gemini client (retries, history) and every API endpoint. They run offline in CI with fakes for the model and LLM.

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
| `GET` | `/api/documents` | List documents with pages, chunks, words, size and upload time |
| `DELETE` | `/api/documents/{name}` | Remove one document and rebuild the index |
| `DELETE` | `/api/documents` | Remove all documents |
| `POST` | `/api/chat` | `{"query": "...", "top_k": 4, "history": [{"role": "user", "content": "..."}]}` → `{"answer", "sources", "elapsed_ms"}` |

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
└── frontend/                # served by FastAPI at / and /static
    ├── index.html           # layout: sidebar, chat, sources panel
    ├── styles.css           # design tokens, light/dark themes, responsive layout
    └── app.js               # conversations, Markdown, citations, uploads, shortcuts
```

## Limitations and next steps

- Documents are kept in memory on the server, so they are cleared when it restarts (conversations are saved in the browser). Persisting the FAISS index to disk is the next step.
- Scanned PDFs (images without text) need OCR first.
