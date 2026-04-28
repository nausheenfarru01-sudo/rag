def retrieve(query, vector_store, top_k=3):
    # 🔥 Simple keyword-based retrieval (since no embeddings)

    results = []

    query_words = set(query.lower().split())

    for text in vector_store.texts:
        score = sum(1 for word in query_words if word in text.lower())
        if score > 0:
            results.append((score, text))

    # sort by score
    results.sort(reverse=True, key=lambda x: x[0])

    return [text for _, text in results[:top_k]]