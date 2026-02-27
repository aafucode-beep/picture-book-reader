import { useState, useCallback } from 'react';
import { UploadPage } from './components/UploadPage';
import { ProcessingPage } from './components/ProcessingPage';
import { PlayerPage } from './components/PlayerPage';
import { LibraryPage } from './components/LibraryPage';
import type { Page, Character, Book } from './types';
import { analyzeImages, synthesizeSpeech, getBook, saveBook } from './api';

type AppState = 'library' | 'upload' | 'processing' | 'player';

function App() {
  const [appState, setAppState] = useState<AppState>('library');
  const [files, setFiles] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<{
    pages: Page[];
    characters: Record<string, Character>;
  } | null>(null);
  const [audioPaths, setAudioPaths] = useState<string[]>([]);
  const [bookId, setBookId] = useState<string>('');
  const [bookData, setBookData] = useState<Book | null>(null);

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setAppState('processing');

    try {
      // Step 1: Analyze images
      const analysis = await analyzeImages(selectedFiles);
      setAnalysisResult(analysis);

      // Step 2: Synthesize speech
      const synthesis = await synthesizeSpeech(
        analysis.pages,
        analysis.characters
      );

      setBookId(synthesis.book_id);
      setAudioPaths(synthesis.audio_paths);

      // Step 3: Save book
      await saveBook(
        synthesis.book_id,
        '我的绘本',
        analysis.pages,
        analysis.characters,
        synthesis.audio_paths
      );
    } catch (error) {
      console.error('Error processing:', error);
      setAppState('upload');
    }
  }, []);

  const handleProcessingComplete = useCallback(() => {
    if (analysisResult) {
      setAppState('player');
    }
  }, [analysisResult]);

  const handleSelectBook = useCallback(async (selectedBookId: string) => {
    try {
      const book = await getBook(selectedBookId);
      setBookData(book);
      setBookId(book.book_id);
      setAnalysisResult({
        pages: book.pages,
        characters: book.characters,
      });
      setAudioPaths(book.audio_paths);
      setAppState('player');
    } catch (error) {
      console.error('Error loading book:', error);
    }
  }, []);

  const handleCreateNew = useCallback(() => {
    setAppState('upload');
  }, []);

  const handleBackToLibrary = useCallback(() => {
    setAppState('library');
    setFiles([]);
    setAnalysisResult(null);
    setAudioPaths([]);
    setBookId('');
    setBookData(null);
  }, []);

  return (
    <>
      {appState === 'library' && (
        <LibraryPage
          onSelectBook={handleSelectBook}
          onCreateNew={handleCreateNew}
        />
      )}

      {appState === 'upload' && (
        <UploadPage onFilesSelected={handleFilesSelected} />
      )}

      {appState === 'processing' && (
        <ProcessingPage onComplete={handleProcessingComplete} />
      )}

      {appState === 'player' && analysisResult && (
        <PlayerPage
          pages={analysisResult.pages}
          characters={analysisResult.characters}
          audioPaths={audioPaths}
          bookId={bookId}
          onBack={handleBackToLibrary}
        />
      )}
    </>
  );
}

export default App;
