import { useState, useRef, useCallback } from 'react';
import type { DragEvent, ChangeEvent } from 'react';

interface UploadPageProps {
  onFilesSelected: (files: File[]) => void;
}

export function UploadPage({ onFilesSelected }: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFiles = (files: File[]) => {
    // Sort files by name to maintain order
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setSelectedFiles(sortedFiles);

    // Create preview URLs
    const urls = sortedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleCameraChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles([...selectedFiles, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);

    // Revoke old URL
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleContinue = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4 flex flex-col">
      <h1 className="text-2xl font-bold text-center mb-6">上传绘本</h1>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-6xl mb-4">📖</div>
        <p className="text-gray-400 mb-4">拖拽图片到这里或点击选择</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-full transition-colors"
        >
          选择图片
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleCameraCapture}
          className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-full transition-colors flex items-center gap-2"
        >
          <span>📷</span> 拍照上传
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={handleCameraChange}
        />
      </div>

      {previewUrls.length > 0 && (
        <div className="mt-6 flex-1">
          <h2 className="text-lg font-semibold mb-3">
            已选择 {selectedFiles.length} 张图片
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={url}
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                  ×
                </button>
                <span className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded text-xs">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <button
          onClick={handleContinue}
          className="mt-auto bg-purple-600 hover:bg-purple-700 py-4 rounded-xl text-lg font-semibold transition-colors"
        >
          开始制作
        </button>
      )}
    </div>
  );
}
