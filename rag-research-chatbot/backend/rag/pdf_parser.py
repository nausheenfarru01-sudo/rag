"""Extract text from uploaded documents, keeping track of page numbers."""
import fitz  # PyMuPDF

SUPPORTED_EXTENSIONS = (".pdf", ".txt", ".md")


class UnsupportedFileError(ValueError):
    pass


def extract_pages(filename: str, data: bytes) -> list[tuple[int, str]]:
    """Return a list of (page_number, text) pairs. Text files count as a single page."""
    name = filename.lower()
    if name.endswith(".pdf"):
        try:
            with fitz.open(stream=data, filetype="pdf") as doc:
                return [(i + 1, page.get_text()) for i, page in enumerate(doc)]
        except (fitz.FileDataError, RuntimeError) as exc:
            raise UnsupportedFileError("The PDF could not be read. Is it corrupted or password-protected?") from exc
    if name.endswith((".txt", ".md")):
        return [(1, data.decode("utf-8", errors="replace"))]
    raise UnsupportedFileError(f"Unsupported file type. Upload one of: {', '.join(SUPPORTED_EXTENSIONS)}")
