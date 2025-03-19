import React, { useState } from 'react';
import axios from 'axios';

function ImageUploader({ currentFolder, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setMessage('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setMessage('Please select at least one file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files[]', file);
      });
      formData.append('destination', currentFolder);

      const response = await axios.post('/api/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentComplete);
        }
      });

      setMessage(`Successfully uploaded ${response.data.successCount} files.`);
      setFiles([]);
      
      // Inform parent component that upload is complete
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`Error uploading files: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      {!showUploadForm ? (
        <button 
          className="btn btn-primary mb-3" 
          onClick={() => setShowUploadForm(true)}
        >
          Upload Images
        </button>
      ) : (
        <div className="card p-3 mb-3">
          <h5>Upload Images to {currentFolder || 'Root'}</h5>
          <form onSubmit={handleUpload}>
            <div className="mb-3">
              <input 
                type="file" 
                className="form-control" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                disabled={uploading}
              />
              <small className="text-muted">
                Selected files: {files.length}
              </small>
            </div>
            
            {uploading && (
              <div className="progress mb-3">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${uploadProgress}%` }} 
                  aria-valuenow={uploadProgress} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  {uploadProgress}%
                </div>
              </div>
            )}
            
            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                {message}
              </div>
            )}
            
            <div className="d-flex justify-content-between">
              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={uploading || files.length === 0}
              >
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowUploadForm(false)}
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;