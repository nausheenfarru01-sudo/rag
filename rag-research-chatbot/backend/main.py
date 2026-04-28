from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag.pdf_parser import extract_text
from rag.chunker import chunk_text
#from rag.embedder import embed_text
from rag.vector_store import VectorStore
from rag.retriever import retrieve
from rag.llm import generate_answer

app = FastAPI()

# ✅ Allow frontend access later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vector_store = None

# ✅ Request model for chat
class QueryRequest(BaseModel):
    query: str


# ------------------ UPLOAD ------------------ #
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global vector_store

    print("📄 Uploading file...")

    text = extract_text(file.file)

    if not text.strip():
        return {"error": "Could not extract text from PDF"}

    chunks = chunk_text(text)
    print(f"✅ Chunks created: {len(chunks)}")

    # 🔥 TEMP dummy embeddings (for testing)
    embeddings = [[0.0] * 384 for _ in chunks]

    vector_store = VectorStore(384)
    vector_store.add(embeddings, chunks)

    print("🔥 Index created successfully")

    return {"message": "Paper indexed successfully", "chunks": len(chunks)}


# ------------------ CHAT ------------------ #
@app.post("/chat")
async def chat(request: QueryRequest):
    global vector_store

    if vector_store is None:
        return {"error": "Upload paper first"}

    query = request.query
    print(f"💬 Query: {query}")

    results = retrieve(query, vector_store)

    if not results:
        return {"error": "No relevant content found"}

    print("🔍 Retrieved chunks:", results[:2])

    context = "\n\n".join(results)

    answer = generate_answer(query, context)

    return {
        "answer": answer,
        "sources": results[:2]  # optional preview
    }