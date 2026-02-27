import { useState, useEffect, useRef } from 'react';
import type { Page, Character } from '../types';

interface PlayerPageProps {
  pages: Page[];
  characters: Record<string, Character>;
  audioPaths: string[];
  bookId: string;
  onBack: () => void;
}

export function PlayerPage({ pages, characters, audioPaths, bookId, onBack }: PlayerPageProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentPageData = pages[currentPage];
  const totalPages = pages.length;

  useEffect(() => {
    if (audioPaths[currentPage]) {
      const audio = new Audio(audioPaths[currentPage]);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        // Auto advance to next page
        if (currentPage < totalPages - 1) {
          setTimeout(() => {
            setCurrentPage((prev) => prev + 1);
          }, 500);
        }
      };

      if (isPlaying) {
        audio.play().catch(console.error);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentPage, audioPaths, isPlaying, totalPages]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setIsPlaying(true);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          ← 返回
        </button>
        <span className="text-gray-500 text-sm">
          {currentPage + 1} / {totalPages}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        {/* Scene Description */}
        <p className="text-gray-500 text-lg text-center mb-8 italic">
          {currentPageData?.scene_description}
        </p>

        {/* Narrator Text */}
        {currentPageData?.narrator && (
          <div className="w-full max-w-lg mb-8">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">旁白</p>
              <p className="text-2xl leading-relaxed text-center">
                {currentPageData.narrator}
              </p>
            </div>
          </div>
        )}

        {/* Dialogues */}
        {currentPageData?.dialogues && currentPageData.dialogues.length > 0 && (
          <div className="w-full max-w-lg space-y-4">
            {currentPageData.dialogues.map((dialogue, index) => (
              <div key={index} className="bg-purple-900/20 rounded-xl p-4 border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-400 font-semibold">{dialogue.character}</span>
                  <span className="text-gray-500 text-sm">({dialogue.emotion})</span>
                </div>
                <p className="text-xl">{dialogue.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Player Controls */}
      <div className="p-4 pb-8">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center disabled:opacity-30"
          >
            ⏮
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl hover:bg-purple-700 transition-colors"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center disabled:opacity-30"
          >
            ⏭
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={totalPages - 1}
            value={currentPage}
            onChange={(e) => {
              setCurrentPage(parseInt(e.target.value));
              setIsPlaying(true);
            }}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Page Thumbnails */}
        <div className="mt-4 flex justify-center gap-2 overflow-x-auto py-2">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentPage(index);
                setIsPlaying(true);
              }}
              className={`w-8 h-8 rounded-full text-xs flex-shrink-0 transition-colors ${
                index === currentPage
                  ? 'bg-purple-600'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
