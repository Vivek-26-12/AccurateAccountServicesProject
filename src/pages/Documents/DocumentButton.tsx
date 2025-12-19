import React, { useRef, useState } from 'react';
import { FileText, Upload, Pencil, Download, Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { uploadPDFToCloudinary, uploadThumbnailToCloudinary } from '../../cloudinaryUploads';

interface DocumentButtonProps {
  name: string;
  doc_id: number;
  doc_data: string | null;
  folder_id?: number | null;
  documentType: 'important' | 'other';
  onUploadSuccess: (docId: number, fileUrl: string, type: 'important' | 'other') => void;
  onUploadError: (error: Error) => void;
  onDelete?: () => void;
  onNullify?: () => void;
}

export function DocumentButton({
  name,
  doc_id,
  doc_data,
  folder_id = null,
  documentType = 'other',
  onUploadSuccess,
  onUploadError,
  onDelete,
  onNullify
}: DocumentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const hasData = !!doc_data;

  const isImage = (file: File | null) => file?.type.startsWith('image/') ?? false;
  const isPDF = (file: File | null) => file?.type === 'application/pdf';

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !doc_id) return;

    setIsUploading(true);

    try {
      let uploadedUrl = '';

      if (isImage(file)) {
        uploadedUrl = await uploadThumbnailToCloudinary(file);
      } else if (isPDF(file)) {
        uploadedUrl = await uploadPDFToCloudinary(file);
      } else {
        throw new Error('Only PDF or Image files are supported.');
      }

      const uploadEndpoint =
        documentType === 'important'
          ? 'http://localhost:3000/uploadimportant'
          : 'http://localhost:3000/other/update';

      const requestData = documentType === 'important'
        ? { doc_id, fileUrl: uploadedUrl }
        : { doc_id, fileUrl: uploadedUrl, folder_id };

      const response = await axios.post(uploadEndpoint, requestData, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        onUploadSuccess(doc_id, uploadedUrl, documentType);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      onUploadError(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc_data) {
      window.open(doc_data, '_blank');
    }
  };

  const handleFileOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc_data) {
      window.open(doc_data, '_blank');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    setShowDeletePopup(false);
    if (documentType === 'important' && onNullify) {
      onNullify();
    } else if (documentType === 'other' && onDelete) {
      onDelete();
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
  };

  return (
    <div className="w-full relative">
      <button
        onClick={hasData ? handleFileOpen : () => !isUploading && fileInputRef.current?.click()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isUploading}
        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
          hasData
            ? 'bg-green-50 border border-green-200 hover:bg-green-100 hover:shadow-sm'
            : 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 hover:from-red-100 hover:to-orange-100 hover:shadow-sm'
        } ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center flex-grow">
          <div
            className={`p-2 rounded-lg mr-3 ${
              hasData ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
          </div>
          <span className="text-gray-700 font-medium">{name}</span>
        </div>

        {hasData ? (
          <div className="flex items-center space-x-2">
            {isHovered && (
              <div
                onClick={handleDownloadClick}
                className="text-sm text-gray-500 flex items-center hover:text-gray-700 cursor-pointer"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </div>
            )}
            <div className="flex items-center">
              <button
                onClick={handleDeleteClick}
                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                title="Delete or remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div
                className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Pencil className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100 rounded-lg shadow-sm">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            ) : (
              <Upload className="w-4 h-4 text-red-600" />
            )}
          </div>
        )}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,image/*"
      />

      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-sm text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Remove this document?</h3>
            <p className="text-sm text-gray-600">
              This will remove the uploaded file for this document. Continue?
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Yes, Remove
              </button>
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
