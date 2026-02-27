import { useState, useEffect } from 'react';
import type { BookListItem } from '../types';
import { getBooks } from '../api';

interface LibraryPageProps {
  onSelectBook: (bookId: string) => void;
  onCreateNew: () => void;
}

export function LibraryPage({ onSelectBook, onCreateNew }: LibraryPageProps) {
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await getBooks();
      setBooks(data);
      setError(null);
    } catch (err) {
      setError('加载书籍失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-6">我的绘本</h1>

      <button
        onClick={onCreateNew}
        className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-xl text-lg font-semibold transition-colors mb-6 flex items-center justify-center gap-2"
      >
        <span>+</span> 创建新绘本
      </button>

      {loading && (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      )}

      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}

      {!loading && books.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-6xl mb-4">📚</div>
          <p>还没有绘本</p>
          <p className="text-sm">点击上方按钮创建第一个绘本</p>
        </div>
      )}

      <div className="space-y-3">
        {books.map((book) => (
          <button
            key={book.book_id}
            onClick={() => onSelectBook(book.book_id)}
            className="w-full bg-gray-900 hover:bg-gray-800 p-4 rounded-xl flex items-center gap-4 transition-colors text-left"
          >
            <div className="w-16 h-16 bg-purple-900/50 rounded-lg flex items-center justify-center text-3xl">
              📖
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p className="text-gray-500 text-sm">
                {book.page_count} 页 · {formatDate(book.created_at)}
              </p>
            </div>
            <div className="text-gray-500">→</div>
          </button>
        ))}
      </div>
    </div>
  );
}
