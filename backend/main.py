import os
import json
import uuid
import aiofiles
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from analyzer import analyze_images
from tts_engine import synthesize_speech
from storage import save_book, get_books, get_book

app = FastAPI(title="Picture Book Reader API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure data directory exists
DATA_DIR = Path("data/books")
DATA_DIR.mkdir(parents=True, exist_ok=True)


class AnalysisResult(BaseModel):
    pages: List[dict]
    characters: dict


class SynthesisRequest(BaseModel):
    pages: List[dict]
    characters: dict
    book_id: Optional[str] = None


class SaveBookRequest(BaseModel):
    book_id: str
    title: str
    pages: List[dict]
    characters: dict
    audio_paths: List[str]


@app.post("/api/analyze")
async def analyze_endpoint(files: List[UploadFile] = File(...)):
    """Analyze images and return structured JSON with narrator, characters, and emotions."""
    try:
        # Save uploaded files temporarily
        temp_dir = Path(f"data/temp/{uuid.uuid4()}")
        temp_dir.mkdir(parents=True, exist_ok=True)

        image_paths = []
        for i, file in enumerate(files):
            ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
            file_path = temp_dir / f"page_{i}.{ext}"

            async with aiofiles.open(file_path, "wb") as f:
                content = await file.read()
                await f.write(content)

            image_paths.append(str(file_path))

        # Analyze images
        result = await analyze_images(image_paths)

        # Cleanup temp files
        for path in image_paths:
            os.remove(path)
        temp_dir.rmdir()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/synthesize")
async def synthesize_endpoint(request: SynthesisRequest):
    """Generate MP3 files from structured JSON using edge-tts."""
    try:
        book_id = request.book_id or str(uuid.uuid4())
        audio_dir = DATA_DIR / book_id / "audio"
        audio_dir.mkdir(parents=True, exist_ok=True)

        audio_paths = []

        for i, page in enumerate(request.pages):
            audio_path = await synthesize_speech(
                page=page,
                characters=request.characters,
                output_dir=str(audio_dir),
                page_index=i
            )
            audio_paths.append(audio_path)

        return {
            "book_id": book_id,
            "audio_paths": audio_paths
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/books")
async def list_books():
    """List all saved books."""
    try:
        books = get_books()
        return books
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/books/{book_id}")
async def get_book_endpoint(book_id: str):
    """Get a specific book by ID."""
    try:
        book = get_book(book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        return book
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/books/save")
async def save_book_endpoint(request: SaveBookRequest):
    """Save book result (images + JSON + audio)."""
    try:
        # Save images
        book_dir = DATA_DIR / request.book_id
        book_dir.mkdir(parents=True, exist_ok=True)

        # Save content.json
        content = {
            "title": request.title,
            "book_id": request.book_id,
            "pages": request.pages,
            "characters": request.characters,
            "audio_paths": request.audio_paths
        }

        async with aiofiles.open(book_dir / "content.json", "w", encoding="utf-8") as f:
            await f.write(json.dumps(content, ensure_ascii=False, indent=2))

        return {"status": "success", "book_id": request.book_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/audio/{book_id}/{filename}")
async def get_audio(book_id: str, filename: str):
    """Serve audio file."""
    audio_path = DATA_DIR / book_id / "audio" / filename

    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(audio_path, media_type="audio/mpeg")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
