import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';

function FileUpload({ onFileSelect, uploadedFile, isAnalyzing }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
  'text/plain': ['.txt'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
},
maxSize: 16 * 1024 * 1024, // 16MB limit to match OCR validation

    multiple: false,
    disabled: isAnalyzing
  });

  return (
    <div className="upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploadedFile ? 'has-file' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploadedFile ? (
          <div className="uploaded-file">
            <div className="file-icon">
              <FileText size={48} />
            </div>
            <h2>{uploadedFile.name}</h2>
            <p>File size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">
              <Upload size={48} />
            </div>
            <h2>Upload Legal Document</h2>
            <p>Drag & drop or click to select</p>
            
            <p className="file-types">Supports: TXT, PDF, DOCX, PNG, JPG (Max 16MB)</p>

            <p className="file-types" style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#9ca3af' }}>
              📝 Tip: For best results, use TXT files or clear images
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;