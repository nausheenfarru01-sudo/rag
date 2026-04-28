print("Testing imports...")

try:
    import rag.pdf_parser
    print("pdf_parser: OK")
except Exception as e:
    print("pdf_parser ERROR:", e)

try:
    import rag.chunker
    print("chunker: OK")
except Exception as e:
    print("chunker ERROR:", e)

try:
    import rag.vector_store
    print("vector_store: OK")
except Exception as e:
    print("vector_store ERROR:", e)

try:
    import rag.retriever
    print("retriever: OK")
except Exception as e:
    print("retriever ERROR:", e)

try:
    import rag.llm
    print("llm: OK")
except Exception as e:
    print("llm ERROR:", e)

print("Done")