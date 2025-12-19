import React, { useState } from 'react';
import { uploadPDFToCloudinary, uploadThumbnailToCloudinary } from './cloudinaryUploads'; // Adjust path if needed

const Test: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isImage = (file: File | null) => file?.type.startsWith('image/') ?? false;
  const isPDF = (file: File | null) => file?.type === 'application/pdf';

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUrl(null);

    try {
      let uploadedUrl: string;

      if (isImage(file)) {
        uploadedUrl = await uploadThumbnailToCloudinary(file);
      } else if (isPDF(file)) {
        uploadedUrl = await uploadPDFToCloudinary(file);
      } else {
        throw new Error('Only images and PDFs are supported.');
      }

      setUrl(uploadedUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Cloudinary File Uploader</h1>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 w-full border border-gray-300 p-2 rounded"
        />

        {file && (
          <div className="mb-4 text-sm text-gray-700">
            <strong>Selected File:</strong> {file.name}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className={`w-full px-4 py-2 rounded ${
            uploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition`}
        >
          {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
        </button>

        {error && (
          <div className="mt-4 text-red-600 text-sm text-center">
            <strong>Error:</strong> {error}
          </div>
        )}

        {url && (
          <div className="mt-6 text-center">
            <p className="text-green-600 font-medium mb-2">Uploaded Successfully!</p>

            {/* Image Preview */}
            {isImage(file) && (
              <img
                src={url}
                alt="Uploaded"
                className="max-w-full max-h-80 mx-auto rounded shadow mb-4"
              />
            )}

            {/* Open in New Tab Button */}
            <div className="flex justify-center gap-4">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  isImage(file)
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white px-4 py-2 rounded transition`}
              >
                🌐 Open in New Tab
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Test;
  