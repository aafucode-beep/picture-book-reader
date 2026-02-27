export interface Page {
  page_number: number;
  scene_description: string;
  narrator: string;
  dialogues: Dialogue[];
}

export interface Dialogue {
  character: string;
  text: string;
  emotion: string;
}

export interface Character {
  gender: 'male' | 'female';
  age: 'child' | 'adult';
  voice: string;
}

export interface Book {
  book_id: string;
  title: string;
  pages: Page[];
  characters: Record<string, Character>;
  audio_paths: string[];
}

export interface BookListItem {
  book_id: string;
  title: string;
  page_count: number;
  created_at: number;
}
