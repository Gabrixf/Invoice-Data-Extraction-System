import { useState } from 'react';
import { validateFiles, formatFileSize } from '../utils/validation';

export default function FileUpload({ onFilesSelected, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = (files) => {
    console.log('FileUpload.processFiles called with:', files.length, 'files');
    const { errors, warnings, validFiles } = validateFiles(files);
    console.log('Validation result:', { errors, warnings, validFilesCount: validFiles.length });

    setValidationErrors(errors);
    setValidationWarnings(warnings);
    setSelectedFiles(Array.from(files).map(f => ({
      name: f.name,
      size: formatFileSize(f.size)
    })));

    if (validFiles.length > 0) {
      console.log('Calling onFilesSelected with', validFiles.length, 'valid files');
      setFileCount(validFiles.length);
      onFilesSelected(validFiles);
    } else {
      console.log('No valid files to process');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(Array.from(e.target.files));
    }
  };

  const clearMessages = () => {
    setValidationErrors([]);
    setValidationWarnings([]);
    setSelectedFiles([]);
    setFileCount(0);
  };

  return (
    <div className="w-full">
      <div
        className={`relative w-full px-6 py-10 border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleChange}
          disabled={isLoading}
          className="hidden"
          id="file-input"
        />

        <label htmlFor="file-input" className="flex flex-col items-center cursor-pointer">
          <svg
            className="w-12 h-12 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          <p className="text-lg font-semibold text-gray-700 mb-1">
            Drop PDF files here or click to select
          </p>
          <p className="text-sm text-gray-500">
            Maximum 20 files, 50MB each. PDF format required.
          </p>

          {fileCount > 0 && (
            <p className="mt-4 text-sm text-blue-600 font-medium">
              {fileCount} file(s) selected
            </p>
          )}
        </label>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Selected Files ({selectedFiles.length})</h3>
          <ul className="space-y-1">
            {selectedFiles.map((file, index) => (
              <li key={index} className="text-sm text-blue-800 flex justify-between">
                <span>{file.name}</span>
                <span className="text-blue-600">{file.size}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {validationErrors.length} Error{validationErrors.length > 1 ? 's' : ''}
              </h3>
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-800">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
            {selectedFiles.length > 0 && (
              <button
                onClick={clearMessages}
                className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && validationErrors.length === 0 && (
        <div className="mt-4 bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationWarnings.length} Warning{validationWarnings.length > 1 ? 's' : ''}
          </h3>
          <ul className="space-y-1">
            {validationWarnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-800">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
