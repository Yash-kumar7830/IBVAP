// src/components/VideoPanel.jsx
import { useState } from 'react';
import VideoPlayer from './VideoPlayer';

export default function VideoPanel({ camera, showOriginal = true, showAI = true, detections = [] }) {
  const [viewMode, setViewMode] = useState('both');

  const getViewClass = () => {
    if (viewMode === 'original') return 'grid-cols-1';
    if (viewMode === 'ai') return 'grid-cols-1';
    return 'grid-cols-2';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg">{camera.name}</h3>
          <p className="text-sm text-gray-500">{camera.location}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'original' ? 'bg-blue-600 text-white' : 'border'
            }`}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ai')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'ai' ? 'bg-blue-600 text-white' : 'border'
            }`}
          >
            AI Annotated
          </button>
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'both' ? 'bg-blue-600 text-white' : 'border'
            }`}
          >
            Both
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${getViewClass()}`}>
        {showOriginal && (viewMode === 'original' || viewMode === 'both') && (
          <div>
            <div className="text-sm font-semibold mb-2 text-gray-700">
              Original CCTV Feed
            </div>
            <VideoPlayer streamUrl={camera.originalStream} />
          </div>
        )}

        {showAI && (viewMode === 'ai' || viewMode === 'both') && (
          <div>
            <div className="text-sm font-semibold mb-2 text-gray-700">
              AI Annotated Feed
            </div>
            <VideoPlayer streamUrl={camera.aiStream || camera.originalStream} detections={detections} />
            <div className="mt-2 flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-500 rounded"></span>
                Person
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-500 rounded"></span>
                Vehicle
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-yellow-500 rounded"></span>
                Restricted Zone
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}