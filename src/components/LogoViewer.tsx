import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface LogoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  logoUrl: string;
}

export const LogoViewer: React.FC<LogoViewerProps> = ({
  isOpen,
  onClose,
  logoUrl
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = logoUrl;
    link.download = 'logo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.2));
  const handleRotate = () => setRotation(r => (r + 90) % 360);
  const handleReset = () => { setZoom(1); setRotation(0); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Logo Preview</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download logo"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
          {/* Logo Display */}
          <div className="relative group">
            <img
              src={logoUrl}
              alt="Logo preview"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s',
                maxWidth: '100%',
                maxHeight: '50vh',
                background: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.10)',
                padding: 32,
                border: '1px solid #e5e7eb',
              }}
              className="object-contain"
            />
            {/* Overlay with controls */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                <button
                  className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                  title="Zoom in"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                  title="Zoom out"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                  title="Rotate"
                  onClick={handleRotate}
                >
                  <RotateCw className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
            title="Reset zoom and rotation"
          >
            Reset
          </button>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Click the download icon to save the logo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Format: PNG | Size: 1024x1024px
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 