import React, { useState } from 'react';
import axios from 'axios';

function FolderCreator({ currentFolder, onFolderCreated }) {
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setMessage('Please enter a folder name.');
      return;
    }

    setCreating(true);
    setMessage('');

    try {
      const response = await axios.post('/api/create-folder', {
        parentFolder: currentFolder,
        folderName: folderName.trim()
      });

      setMessage(`Folder "${folderName}" created successfully.`);
      setFolderName('');
      
      // Inform parent component that folder creation is complete
      if (onFolderCreated) {
        onFolderCreated();
      }
    } catch (error) {
      console.error('Folder creation error:', error);
      setMessage(`Error creating folder: ${error.response?.data?.error || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="folder-creator-container">
      {!showForm ? (
        <button 
          className="btn btn-outline-primary mb-3" 
          onClick={() => setShowForm(true)}
        >
          Create New Folder
        </button>
      ) : (
        <div className="card p-3 mb-3">
          <h5>Create New Folder in {currentFolder || 'Root'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter folder name" 
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                disabled={creating}
              />
            </div>
            
            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                {message}
              </div>
            )}
            
            <div className="d-flex justify-content-between">
              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={creating || !folderName.trim()}
              >
                {creating ? 'Creating...' : 'Create Folder'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowForm(false)}
                disabled={creating}
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

export default FolderCreator;