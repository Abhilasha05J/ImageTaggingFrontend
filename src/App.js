import React, { useState, useEffect, useCallback } from 'react';
import { 
  Button, Container, Paper, Typography, Radio, RadioGroup, 
  FormControlLabel, LinearProgress, Box, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  IconButton, Tooltip, Link, CircularProgress, Card, CardActionArea, Breadcrumbs
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import FolderIcon from '@mui/icons-material/Folder';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { 
  TextField, FormControl, InputLabel, Select, MenuItem, 
  Switch, Checkbox, Divider 
} from '@mui/material';

import { 
  Add as AddIcon, Delete as DeleteIcon 
} from '@mui/icons-material';


function App() {
  // State management
  const [folderPath, setFolderPath] = useState('');
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categorizedImages, setCategorizedImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  

  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
const [autoAdvance, setAutoAdvance] = useState(false);
const [exportDialogOpen, setExportDialogOpen] = useState(false);
const [exportFormat, setExportFormat] = useState('');
const [includeTimestamp, setIncludeTimestamp] = useState(false);
const [includeFullPath, setIncludeFullPath] = useState(false);
const [notification, setNotification] = useState('');

  // Directory browser state
  const [dirDialogOpen, setDirDialogOpen] = useState(false);
  const [availableDirs, setAvailableDirs] = useState([]);
  const [currentDir, setCurrentDir] = useState('');
  const [subdirectories, setSubdirectories] = useState([]);
  const [dirHistory, setDirHistory] = useState([]);
  const [dirLoading, setDirLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  // Upload state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Categories
  const categories = ['Normal', 'Initial Stage', 'Option3', 'Skip'];
  
  // API URL configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 
    (window.location.hostname.includes("localhost")
      ? "http://localhost:8080"
      : "https://imagetaggingbackend.onrender.com/");

  const DEFAULT_UNCATEGORIZED_PATH = 'Uncategorized_Images/';

  const isAllCategorized = images.length > 0 && images.every(image => categorizedImages[image.filename || image]);
  
  // Load uncategorized images by default when app loads
  useEffect(() => {
    fetchImages(DEFAULT_UNCATEGORIZED_PATH);
  }, []);

  // Load initial directories when dialog opens
  useEffect(() => {
    if (dirDialogOpen) {
      fetchInitialDirectories();
    }
  }, [dirDialogOpen]);

  // Update breadcrumbs when directory changes
  useEffect(() => {
    if (currentDir) {
      const pathParts = currentDir.split('/').filter(part => part);
      
      const breadcrumbItems = [
        { name: 'Root', path: '' },
        ...pathParts.map((part, index) => {
          const path = pathParts.slice(0, index + 1).join('/') + '/';
          return { name: part, path: path };
        })
      ];
      
      setBreadcrumbs(breadcrumbItems);
    } else {
      setBreadcrumbs([{ name: 'Root', path: '' }]);
    }
  }, [currentDir]);

  const fetchInitialDirectories = async () => {
    setDirLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/list-directories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch directories');
      }
      
      const data = await response.json();
      setAvailableDirs(data.directories);
      setSubdirectories([]);
      setCurrentDir('');
      setDirHistory([]);
      setBreadcrumbs([{ name: 'Root', path: '' }]);
    } catch (err) {
      setError('Error loading directories: ' + err.message);
      setShowSnackbar(true);
    } finally {
      setDirLoading(false);
    }
  };

  const fetchSubdirectories = async (dirPath) => {
    setDirLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/list-subdirectories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directory: dirPath }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subdirectories');
      }
      
      const data = await response.json();
      setSubdirectories(data.subdirectories);
      setCurrentDir(dirPath);
      setDirHistory(prev => [...prev, dirPath]);
    } catch (err) {
      setError('Error loading subdirectories: ' + err.message);
      setShowSnackbar(true);
    } finally {
      setDirLoading(false);
    }
  };

  const handleNavigateBack = () => {
    if (dirHistory.length > 1) {
      // Remove current directory from history
      const newHistory = [...dirHistory];
      newHistory.pop();
      
      // Get previous directory
      const previousDir = newHistory[newHistory.length - 1];
      
      // Fetch subdirectories of previous directory
      fetchSubdirectories(previousDir);
      
      // Update history (will be updated by fetchSubdirectories)
      setDirHistory(newHistory);
    } else {
      // Go back to root directories list
      setSubdirectories([]);
      setCurrentDir('');
      setDirHistory([]);
      setBreadcrumbs([{ name: 'Root', path: '' }]);
    }
  };

  const handleNextWithWarning = useCallback(() => {
    const currentImage = images[currentIndex];
    const imageFilename = currentImage.filename || currentImage;
    
    if (!categorizedImages[imageFilename]) {
      setError('Please select a category before moving to the next image');
      setShowSnackbar(true);
    } else {
      handleNext();
    }
  }, [categorizedImages, currentIndex, images]);

  const handleBrowseFolder = () => {
    setDirDialogOpen(true);
  };

  const handleSelectDirectory = (dirPath) => {
    fetchSubdirectories(dirPath);
  };

  const handleBreadcrumbClick = (path) => {
    fetchSubdirectories(path);
  };

  const handleDialogClose = () => {
    setDirDialogOpen(false);
  };
  const handleRemoveCategory = () => {
    console.log("Remove category clicked");
  };
  
  const handleAddCategory = () => {
    console.log("Add category clicked");
  };
  
  const handleSaveSettings = () => {
    console.log("Settings saved");
  };
  
  const handleExport = () => {
    console.log("Export initiated");
  };
  
  const handleSelectFolder = async () => {
    if (!currentDir && currentDir !== '') {
      setError('Please select a folder first');
      setShowSnackbar(true);
      return;
    }
    
    setDirDialogOpen(false);
    await fetchImages(currentDir);
  };

  const fetchImages = async (path) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/list-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderPath: path }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      console.log("Fetched images:", data);
      if (!data.images || data.images.length === 0) {
        setError('No images found in the selected folder');
        setShowSnackbar(true);
        return;
      }
      setFolderPath(data.folderPath);
      setImages(data.images); // Store full image objects from API
      setCurrentIndex(0);
      setCategorizedImages({});
      setZoomLevel(1); // Reset zoom level when loading new images
      
      if (data.images.length === 0) {
        setError('No images found in the selected folder');
        setShowSnackbar(true);
      }
    } catch (err) {
      setError('Error loading images: ' + err.message);
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event) => {
    const currentImage = images[currentIndex];
    const imageFilename = currentImage.filename || currentImage;
    
    setCategorizedImages(prev => ({
      ...prev,
      [imageFilename]: event.target.value
    }));
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
      
      // Get the next image
      const nextImage = images[currentIndex + 1];
      const nextImageFilename = nextImage.filename || nextImage;
  
      // Reset category selection for the new image
      setCategorizedImages(prevState => ({
        ...prevState,
        [nextImageFilename]: prevState[nextImageFilename] || ""  
      }));
  
      setZoomLevel(1);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
      
      // Get the previous image
      const prevImage = images[currentIndex - 1];
      const prevImageFilename = prevImage.filename || prevImage;
  
      // Reset category selection for the previous image
      setCategorizedImages(prevState => ({
        ...prevState,
        [prevImageFilename]: prevState[prevImageFilename] || ""
      }));
  
      setZoomLevel(1);
    }
  };
  
  const handleSaveAll = async () => {
    if (Object.keys(categorizedImages).length === 0) {
      setError('No images have been categorized yet');
      setShowSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      // Transform categorizedImages to match backend's expected format
      const categorizedList = Object.entries(categorizedImages).map(([filename, category]) => ({
        filename,
        category
      }));

      const response = await fetch(`${API_BASE_URL}/api/save-categorized`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceFolder: folderPath,
          categorizedImages: categorizedList
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save categorized images');
      }
      
      const result = await response.json();
      setSuccessMessage(`Successfully saved ${result.categorizedCount} images to ${result.destinationFolder}`);
      setShowSnackbar(true);
      
      // After successful save, refresh the images from the current folder
      // This will remove the already categorized images
      await fetchImages(folderPath);
    } catch (err) {
      setError('Error saving categorized images: ' + err.message);
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // File upload handlers
  const handleUploadClick = () => {
    setUploadDialogOpen(true);
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to upload');
      setShowSnackbar(true);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      // Using XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setSuccessMessage(`Successfully uploaded ${selectedFiles.length} files to uncategorized folder`);
          setShowSnackbar(true);
          setUploadDialogOpen(false);
          // Refresh images from uncategorized folder
          await fetchImages(DEFAULT_UNCATEGORIZED_PATH);
        } else {
          throw new Error('Upload failed');
        }
        setIsUploading(false);
      });
      
      xhr.addEventListener('error', () => {
        setError('Error during file upload');
        setShowSnackbar(true);
        setIsUploading(false);
      });
      
      // Fix: Update endpoint to match the backend
      xhr.open('POST', `${API_BASE_URL}/api/upload-images`);
      xhr.send(formData);
    } catch (err) {
      setError('Error uploading files: ' + err.message);
      setShowSnackbar(true);
      setIsUploading(false);
    }
  };

  const closeSnackbar = () => {
    setShowSnackbar(false);
    setError('');
    setSuccessMessage('');
  };
  
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 3.0)); // Increase zoom level up to 300%
  };

  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.2)); // Decrease zoom level, minimum 20%
  };
  
  // Render directory cards in a grid layout
  const renderDirectoryGrid = (directories) => {
    return (
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {directories.map((dir) => (
          <Grid item xs={6} sm={4} md={3} key={dir.path}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea 
                onClick={() => handleSelectDirectory(dir.path)}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 2,
                  height: '100%'
                }}
              >
                <FolderIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
                <Typography 
                  variant="body2" 
                  align="center" 
                  noWrap 
                  title={dir.name}
                  sx={{ width: '100%' }}
                >
                  {dir.name}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Fix: Updated to handle both simple filenames and image objects
  const getCurrentImageFilename = () => {
    if (images.length === 0 || currentIndex >= images.length) return null;
    const currentImage = images[currentIndex];
    return currentImage.filename || currentImage;
  };
  
  // Fix: Updated to handle both simple filenames and image objects
  const getCurrentImageKey = () => {
    if (images.length === 0 || currentIndex >= images.length) return null;
    const currentImage = images[currentIndex];
    return currentImage.key || currentImage;
  };

  // Generate image URL based on the Flask backend's URL structure
  const getImageUrl = useCallback((folderPath, filename) => {
    if (images.length === 0 || currentIndex >= images.length) return '';
    const currentImage = images[currentIndex];
  return `${API_BASE_URL}/api/image/${encodeURIComponent(currentImage.key)}`;
}, [API_BASE_URL, images, currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
        const categoryIndex = parseInt(e.key) - 1;
        if (categoryIndex >= 0 && categoryIndex < categories.length) {
          const currentFilename = getCurrentImageFilename();
          if (currentFilename) {
            setCategorizedImages(prev => ({
              ...prev,
              [currentFilename]: categories[categoryIndex]
            }));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrevious, categories, currentIndex, images, getCurrentImageFilename]);

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Name
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<FolderOpenIcon />}
            onClick={handleBrowseFolder}
            sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            Browse Folder
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<CloudUploadIcon />}
            onClick={handleUploadClick}
            sx={{ backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}
          >
            Upload Files
          </Button>
        </Box>
        
        {folderPath && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current Folder: {folderPath}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={images.length > 0 ? (currentIndex + 1) / images.length * 100 : 0} 
              sx={{ mt: 1, height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" align="right" color="text.secondary">
              {images.length > 0 ? `${currentIndex + 1} / ${images.length}` : '0 / 0'}
            </Typography>
          </Box>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : images.length > 0 ? (
          <>
            {/* Image Display with Side Navigation Buttons */}
            <Box sx={{ my: 3, position: 'relative', height: '400px' }}>
              {/* Left Navigation Button */}
              <IconButton
                sx={{
                  position: 'absolute',
                  left: '-12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                  ...(currentIndex > 0 && {
                    boxShadow: '0 0 8px #1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' },
                  })
                }}
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ArrowBackIcon />
              </IconButton>
              
              {/* Image Container */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 1, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  position: 'relative'
                }}
              >
                {getCurrentImageFilename() && (
                  <img 
                    src={getImageUrl(folderPath, getCurrentImageFilename())}
                    alt={`Image ${currentIndex + 1}`}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain',
                      transform: `scale(${zoomLevel})`,
                      transition: 'transform 0.2s ease'
                    }}
                  />
                )}
                
                {/* Zoom Controls */}
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 8, 
                  right: 8, 
                  display: 'flex',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  borderRadius: 1,
                  padding: '2px'
                }}>
                  <Tooltip title="Zoom Out">
                    <IconButton 
                      size="small" 
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 0.2}
                    >
                      <ZoomOutIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="body2" sx={{ alignSelf: 'center', mx: 1 }}>
                    {Math.round(zoomLevel * 100)}%
                  </Typography>
                  <Tooltip title="Zoom In">
                    <IconButton 
                      size="small" 
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 3.0}
                    >
                      <ZoomInIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
              
              {/* Right Navigation Button */}
              <IconButton
                sx={{
                  position: 'absolute',
                  right: '-12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                  ...(currentIndex !== images.length - 1 && categorizedImages[getCurrentImageFilename()] && {
                    boxShadow: '0 0 8px #1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' },
                  })
                }}
                onClick={handleNext}
                disabled={currentIndex === images.length - 1 || !categorizedImages[getCurrentImageFilename()]}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Category:
              </Typography>
              <RadioGroup 
                value={categorizedImages[getCurrentImageFilename()] || ''}
                onChange={handleCategoryChange}
                row
                sx={{ justifyContent: 'space-between' }}
              >
                {categories.map((category, index) => (
                  <FormControlLabel 
                    key={category} 
                    value={category} 
                    control={<Radio />} 
                    label={`${index + 1}. ${category}`}
                  />
                ))}
              </RadioGroup>
              
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSaveAll}
                disabled={!isAllCategorized}
              >
                Save
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No images found. Please select a folder or upload images.
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* File Explorer Dialog */}
      <Dialog 
        open={dirDialogOpen} 
        onClose={handleDialogClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <Tooltip title="Go Back">
              <span>
                <IconButton 
                  edge="start" 
                  onClick={handleNavigateBack} 
                  sx={{ mr: 1 }}
                  disabled={dirHistory.length === 0}
                >
                  <ChevronLeftIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Home">
              <IconButton edge="start" onClick={fetchInitialDirectories} sx={{ mr: 2 }}>
                <HomeIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              File Explorer
            </Typography>
          </Box>
          
          {/* Breadcrumbs */}
          <Box sx={{ mt: 1 }}>
            <Breadcrumbs separator="›" aria-label="breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <Link
                  key={index}
                  component="button"
                  variant="body2"
                  color={index === breadcrumbs.length - 1 ? "text.primary" : "inherit"}
                  underline={index === breadcrumbs.length - 1 ? "none" : "hover"}
                  onClick={() => handleBreadcrumbClick(crumb.path)}
                  sx={{ 
                    cursor: 'pointer',
                    fontWeight: index === breadcrumbs.length - 1 ? 'bold' : 'normal'
                  }}
                >
                  {crumb.name}
                </Link>
              ))}
            </Breadcrumbs>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 2 }}>
          {dirLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {!currentDir && availableDirs.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ pl: 1 }}>
                     Folder Contents
                  </Typography>
                  {renderDirectoryGrid(availableDirs)}
                </>
              )}
              
              {currentDir && (
                <>
                  {subdirectories.length > 0 ? (
                    renderDirectoryGrid(subdirectories)
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                      <Alert severity="info" sx={{ width: '100%' }}>
                        No subdirectories found in this location
                      </Alert>
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSelectFolder} 
            variant="contained"
          >
            Open
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => !isUploading && setUploadDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Upload Files to Uncategorized Folder</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <input
              type="file"
              multiple
              onChange={handleFileSelection}
              disabled={isUploading}
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-input"
            />
            <label htmlFor="upload-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={isUploading}
                fullWidth
                sx={{ mb: 2, height: 56 }}
              >
                Select Images
              </Button>
            </label>
            
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {selectedFiles.length} file(s) selected
                </Typography>
                {isUploading && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="caption" align="center" display="block">
                      {uploadProgress}% Uploaded
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setUploadDialogOpen(false)} 
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
           onClick={handleUploadSubmit}
           variant="contained"
           color="primary"
           disabled={isUploading || selectedFiles.length === 0}
           startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
         >
           Upload
         </Button>
       </DialogActions>
     </Dialog>
     
     {/* Settings Dialog */}
     <Dialog
       open={settingsDialogOpen}
       onClose={() => setSettingsDialogOpen(false)}
       fullWidth
       maxWidth="sm"
     >
       <DialogTitle>Settings</DialogTitle>
       <DialogContent>
         <Box sx={{ p: 2 }}>
           <Typography variant="subtitle1" gutterBottom>
             Categories
           </Typography>
           <Box sx={{ mb: 3 }}>
             {categories.map((category, index) => (
               <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                 <TextField
                   fullWidth
                   size="small"
                   label={`Category ${index + 1}`}
                   value={category}
                   onChange={(e) => handleCategoryChange(index, e.target.value)}
                   margin="dense"
                 />
                 <IconButton onClick={() => handleRemoveCategory(index)} disabled={categories.length <= 1}>
                   <DeleteIcon />
                 </IconButton>
               </Box>
             ))}
             <Button
               variant="outlined"
               startIcon={<AddIcon />}
               onClick={handleAddCategory}
               disabled={categories.length >= 10}
               sx={{ mt: 1 }}
             >
               Add Category
             </Button>
           </Box>
           
           <Divider sx={{ my: 2 }} />
           
           <Typography variant="subtitle1" gutterBottom>
             Display Options
           </Typography>
           <FormControlLabel
             control={
               <Switch
                 checked={autoAdvance}
                 onChange={(e) => setAutoAdvance(e.target.checked)}
               />
             }
             label="Auto-advance to next image after categorization"
           />
         </Box>
       </DialogContent>
       <DialogActions sx={{ p: 2 }}>
         <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
         <Button onClick={handleSaveSettings} variant="contained" color="primary">
           Save Settings
         </Button>
       </DialogActions>
     </Dialog>
     
     {/* Export Dialog */}
     <Dialog
       open={exportDialogOpen}
       onClose={() => setExportDialogOpen(false)}
       fullWidth
       maxWidth="sm"
     >
       <DialogTitle>Export Categorized Images</DialogTitle>
       <DialogContent>
         <Box sx={{ p: 2 }}>
           <FormControl fullWidth margin="normal">
             <InputLabel>Export Format</InputLabel>
             <Select
               value={exportFormat}
               onChange={(e) => setExportFormat(e.target.value)}
               label="Export Format"
             >
               <MenuItem value="csv">CSV</MenuItem>
               <MenuItem value="json">JSON</MenuItem>
               <MenuItem value="txt">Plain Text</MenuItem>
             </Select>
           </FormControl>
           
           <FormControlLabel
             control={
               <Checkbox
                 checked={includeTimestamp}
                 onChange={(e) => setIncludeTimestamp(e.target.checked)}
               />
             }
             label="Include timestamp"
           />
           
           <FormControlLabel
             control={
               <Checkbox
                 checked={includeFullPath}
                 onChange={(e) => setIncludeFullPath(e.target.checked)}
               />
             }
             label="Include full file path"
           />
         </Box>
       </DialogContent>
       <DialogActions sx={{ p: 2 }}>
         <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
         <Button onClick={handleExport} variant="contained" color="primary">
           Export
         </Button>
       </DialogActions>
     </Dialog>
     
     {/* Snackbar for notifications */}
     <Snackbar
       open={!!notification}
       autoHideDuration={6000}
       onClose={() => setNotification(null)}
       anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
     >
       <Alert 
         onClose={() => setNotification(null)} 
         severity={notification?.severity || 'info'}
         sx={{ width: '100%' }}
       >
         {notification?.message}
       </Alert>
     </Snackbar>
   </Container>
 );
};

export default App;