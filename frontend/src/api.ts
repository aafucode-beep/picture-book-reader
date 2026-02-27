import type { Book, BookListItem, Page, Character } from './types';

const API_BASE = 'http://localhost:8000/api';

export async function analyzeImages(files: File[]): Promise<{ pages: Page[]; characters: Record<string, Character> }> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to analyze images');
  }

  return response.json();
}

export async function synthesizeSpeech(
  pages: Page[],
  characters: Record<string, Character>,
  bookId?: string
): Promise<{ book_id: string; audio_paths: string[] }> {
  const response = await fetch(`${API_BASE}/synthesize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pages,
      characters,
      book_id: bookId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to synthesize speech');
  }

  return response.json();
}

export async function getBooks(): Promise<BookListItem[]> {
  const response = await fetch(`${API_BASE}/books`);

  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  return response.json();
}

export async function getBook(bookId: string): Promise<Book> {
  const response = await fetch(`${API_BASE}/books/${bookId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch book');
  }

  return response.json();
}

export async function saveBook(
  bookId: string,
  title: string,
  pages: Page[],
  characters: Record<string, Character>,
  audioPaths: string[]
): Promise<{ status: string; book_id: string }> {
  const response = await fetch(`${API_BASE}/books/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      book_id: bookId,
      title,
      pages,
      characters,
      audio_paths: audioPaths,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save book');
  }

  return response.json();
}
