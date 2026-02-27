import json
import os
from pathlib import Path
from typing import List, Dict, Optional


DATA_DIR = Path("data/books")


def get_books() -> List[Dict]:
    """List all saved books."""
    books = []

    if not DATA_DIR.exists():
        return books

    for book_path in DATA_DIR.iterdir():
        if not book_path.is_dir():
            continue

        content_file = book_path / "content.json"
        if not content_file.exists():
            continue

        try:
            with open(content_file, "r", encoding="utf-8") as f:
                content = json.load(f)

            books.append({
                "book_id": content.get("book_id", book_path.name),
                "title": content.get("title", "Untitled"),
                "page_count": len(content.get("pages", [])),
                "created_at": book_path.stat().st_ctime
            })
        except Exception as e:
            print(f"Error reading book {book_path.name}: {e}")
            continue

    # Sort by creation time (newest first)
    books.sort(key=lambda x: x.get("created_at", 0), reverse=True)

    return books


def get_book(book_id: str) -> Optional[Dict]:
    """Get a specific book by ID."""
    book_path = DATA_DIR / book_id
    content_file = book_path / "content.json"

    if not content_file.exists():
        return None

    try:
        with open(content_file, "r", encoding="utf-8") as f:
            content = json.load(f)

        # Add full audio paths
        for i, audio_path in enumerate(content.get("audio_paths", [])):
            if not audio_path.startswith("http") and not os.path.isabs(audio_path):
                content["audio_paths"][i] = f"/api/audio/{book_id}/{os.path.basename(audio_path)}"

        return content
    except Exception as e:
        print(f"Error reading book {book_id}: {e}")
        return None


def save_book(book_id: str, title: str, pages: List[Dict], characters: Dict, audio_paths: List[str]) -> bool:
    """Save a book to storage."""
    book_dir = DATA_DIR / book_id
    book_dir.mkdir(parents=True, exist_ok=True)

    content = {
        "book_id": book_id,
        "title": title,
        "pages": pages,
        "characters": characters,
        "audio_paths": audio_paths
    }

    try:
        with open(book_dir / "content.json", "w", encoding="utf-8") as f:
            json.dump(content, f, ensure_ascii=False, indent=2)

        return True
    except Exception as e:
        print(f"Error saving book {book_id}: {e}")
        return False
