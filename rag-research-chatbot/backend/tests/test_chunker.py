import pytest

from rag.chunker import chunk_pages, chunk_text


def test_short_text_is_one_chunk():
    assert chunk_text("a b c", size=10, overlap=2) == ["a b c"]


def test_chunks_overlap():
    words = " ".join(str(i) for i in range(10))
    chunks = chunk_text(words, size=4, overlap=2)
    assert chunks[0] == "0 1 2 3"
    assert chunks[1] == "2 3 4 5"
    assert chunks[-1].endswith("9")


def test_no_trailing_duplicate_chunk():
    words = " ".join(str(i) for i in range(8))
    assert chunk_text(words, size=4, overlap=0) == ["0 1 2 3", "4 5 6 7"]


def test_empty_text():
    assert chunk_text("   ", size=4, overlap=1) == []


@pytest.mark.parametrize("size,overlap", [(0, 0), (4, 4), (4, -1)])
def test_invalid_arguments(size, overlap):
    with pytest.raises(ValueError):
        chunk_text("a b c", size=size, overlap=overlap)


def test_chunk_pages_keeps_page_numbers():
    chunks = chunk_pages([(1, "alpha beta"), (2, "gamma")], "paper.pdf", size=5, overlap=1)
    assert [(c.page, c.text) for c in chunks] == [(1, "alpha beta"), (2, "gamma")]
    assert all(c.document == "paper.pdf" for c in chunks)
