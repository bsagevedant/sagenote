import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface AttachmentUploaderProps {
  onUpload: (files: File[]) => void;
}

export default function AttachmentUploader({ onUpload }: AttachmentUploaderProps) {
  const { theme } = useTheme();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive 
          ? (theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50')
          : (theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400')
        }`}
    >
      <input {...getInputProps()} />
      <Upload className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
        {isDragActive
          ? 'Drop files here...'
          : 'Drag & drop files here, or click to select files'}
      </p>
    </div>
  );
}