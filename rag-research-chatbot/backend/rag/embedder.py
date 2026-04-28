model = None

def get_model():
    global model
    if model is None:
        from sentence_transformers import SentenceTransformer
        print("🔄 Loading embedding model...")
        model = SentenceTransformer("all-MiniLM-L6-v2")
        print("✅ Model loaded")
    return model

def embed_text(texts):
    model = get_model()
    return model.encode(texts)