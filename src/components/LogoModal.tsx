import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Brain, 
  Image, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Edit3,
  Download
} from 'lucide-react';
import { generateLogo } from '../lib/ai';

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bf1katla';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dyqg8x26j';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoUpdate: (logoUrl: string) => void;
  currentLogoUrl?: string | null;
  jobTitle?: string;
  jobDescription?: string;
}

export const LogoModal: React.FC<LogoModalProps> = ({
  isOpen,
  onClose,
  onLogoUpdate,
  currentLogoUrl,
  jobTitle = '',
  jobDescription = ''
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'upload'>('ai');
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to upload a blob to Cloudinary
  const uploadToCloudinary = async (fileOrBlob: File | Blob, fileName = 'logo.png') => {
    const formData = new FormData();
    formData.append('file', fileOrBlob, fileName);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Cloudinary error: ${response.statusText}`);
    }
    const result = await response.json();
    if (result.secure_url) {
      return result.secure_url;
    } else {
      throw new Error('No URL returned from Cloudinary');
    }
  };

  const handleAIGeneration = async () => {
    if (!aiDescription.trim()) {
      setError('Please provide a description for the logo');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const logoUrl = await generateLogo(jobTitle, aiDescription);
      // Fetch the image as a blob
      const imageResponse = await fetch(logoUrl);
      const imageBlob = await imageResponse.blob();
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(imageBlob, 'ai-logo.png');
      setPreviewUrl(cloudinaryUrl);
      setSuccess('Logo generated and uploaded to Cloudinary!');
      console.log('Cloudinary logo URL:', cloudinaryUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate or upload logo');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file, file.name);
      setPreviewUrl(cloudinaryUrl);
      setSuccess('Image uploaded successfully!');
      console.log('Cloudinary logo URL:', cloudinaryUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (previewUrl) {
      onLogoUpdate(previewUrl);
      onClose();
    }
  };

  const handleClose = () => {
    setActiveTab('ai');
    setAiDescription('');
    setError(null);
    setSuccess(null);
    setPreviewUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Logo</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === 'ai'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="AI Generation"
            >
              <Brain className="w-4 h-4" />
              <span>AI Generation</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Import Image"
            >
              <Upload className="w-4 h-4" />
              <span>Import Image</span>
            </button>
          </div>

          {/* AI Generation Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo description
                </label>
                <textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="Describe the logo you want to generate (e.g. modern logo with blue colors, collaboration symbol, professional style...)"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              <button
                onClick={handleAIGeneration}
                disabled={isGenerating || !aiDescription.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Generate Logo</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex flex-col items-center space-y-3 w-full"
                  title="Select image"
                >
                  {isUploading ? (
                    <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400" />
                  )}
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {isUploading ? 'Uploading...' : 'Click to select an image'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG, GIF, WebP (max 5MB)
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Success</p>
                <p className="text-sm text-green-600">{success}</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Logo preview"
                    className="w-24 h-24 rounded-lg border border-gray-200 bg-white object-contain"
                  />
                  {currentLogoUrl && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      New
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    {currentLogoUrl 
                      ? 'This logo will replace the current one'
                      : 'This will be the new logo for your gig'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Logo */}
          {currentLogoUrl && !previewUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Current Logo</h3>
              <div className="flex items-center space-x-4">
                <img
                  src={currentLogoUrl}
                  alt="Current logo"
                  className="w-24 h-24 rounded-lg border border-gray-200 bg-white object-contain"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Current logo for your gig
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!previewUrl}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}; 