import numpy as np

class VectorStore:
    def __init__(self, dim):
        self.dim = dim
        self.embeddings = []
        self.texts = []

    def add(self, embeddings, texts):
        self.embeddings.extend(embeddings)
        self.texts.extend(texts)

    def search(self, query_embedding, top_k=3):
        # simple cosine similarity
        sims = []
        for i, emb in enumerate(self.embeddings):
            emb = np.array(emb)
            query = np.array(query_embedding)

            score = np.dot(emb, query) / (
                np.linalg.norm(emb) * np.linalg.norm(query) + 1e-9
            )
            sims.append((score, self.texts[i]))

        sims.sort(reverse=True, key=lambda x: x[0])
        return [text for _, text in sims[:top_k]]