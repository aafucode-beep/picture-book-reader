import { useState, useEffect } from 'react';

interface ProcessingPageProps {
  onComplete: () => void;
}

export function ProcessingPage({ onComplete }: ProcessingPageProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    '正在分析图片内容...',
    '正在识别角色和情感...',
    '正在生成旁白和对话...',
    '正在合成语音...',
    '即将完成...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const stepIndex = Math.floor((progress / 100) * steps.length);
    setCurrentStep(Math.min(stepIndex, steps.length - 1));
  }, [progress, steps.length]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4 flex flex-col items-center justify-center">
      <div className="text-8xl mb-8 animate-pulse">🎨</div>

      <h2 className="text-2xl font-bold mb-2">AI 正在创作中</h2>
      <p className="text-gray-400 mb-8">{steps[currentStep]}</p>

      <div className="w-full max-w-md">
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-center mt-4 text-gray-500">{Math.round(progress)}%</p>
      </div>

      <div className="mt-8 flex gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index <= currentStep ? 'bg-purple-500' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
