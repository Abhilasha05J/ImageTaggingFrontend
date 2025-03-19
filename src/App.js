// import React, { useState, useEffect } from 'react';
// import { 
//   Button, Container, Paper, Typography, Radio, RadioGroup, 
//   FormControlLabel, LinearProgress, Box, Alert, Snackbar,
//   Dialog, DialogTitle, DialogContent, DialogActions, List, 
//   ListItem, ListItemText, ListItemButton, Divider, CircularProgress,
//   IconButton, Tooltip, Grid, Breadcrumbs, Link, Card, CardActionArea
// } from '@mui/material';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import FolderOpenIcon from '@mui/icons-material/FolderOpen';
// import SaveIcon from '@mui/icons-material/Save';
// import FolderIcon from '@mui/icons-material/Folder';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import HomeIcon from '@mui/icons-material/Home';
// import NavigateNextIcon from '@mui/icons-material/NavigateNext';
// import ZoomInIcon from '@mui/icons-material/ZoomIn';
// import ZoomOutIcon from '@mui/icons-material/ZoomOut';


// function App() {
//   const [folderPath, setFolderPath] = useState('');
//   const [images, setImages] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [categorizedImages, setCategorizedImages] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [showSnackbar, setShowSnackbar] = useState(false);
//   const [zoomLevel, setZoomLevel] = useState(1);
  
//   // Directory browser state
//   const [dirDialogOpen, setDirDialogOpen] = useState(false);
//   const [availableDirs, setAvailableDirs] = useState([]);
//   const [currentDir, setCurrentDir] = useState('');
//   const [subdirectories, setSubdirectories] = useState([]);
//   const [dirHistory, setDirHistory] = useState([]);
//   const [dirLoading, setDirLoading] = useState(false);
//   const [breadcrumbs, setBreadcrumbs] = useState([]);

//   // Changed to match backend categories
//   const categories = ['Normal', 'Initial Stage', 'Option3', 'Skip'];
  
//   // Updated to use environment variables or default API URLs
//   const API_BASE_URL = process.env.REACT_APP_API_URL || 
//     (window.location.hostname.includes("localhost")
//       ? "http://localhost:8080"
//       : "https://picsort-backend-python.onrender.com");

//   const isAllCategorized = images.every(image => categorizedImages[image]);
  
//   // Load initial directories when dialog opens
//   useEffect(() => {
//     if (dirDialogOpen) {
//       fetchInitialDirectories();
//     }
//   }, [dirDialogOpen]);

//   // Update breadcrumbs when directory changes
//   useEffect(() => {
//     if (currentDir) {
//       // For S3 paths, always use forward slashes
//       const pathParts = currentDir.split('/').filter(part => part);
      
//       const breadcrumbItems = [
//         { name: 'Root', path: '' },
//         ...pathParts.map((part, index) => {
//           const path = pathParts.slice(0, index + 1).join('/') + '/';
//           return { name: part, path: path };
//         })
//       ];
      
//       setBreadcrumbs(breadcrumbItems);
//     } else {
//       setBreadcrumbs([{ name: 'Root', path: '' }]);
//     }
//   }, [currentDir]);

//   const fetchInitialDirectories = async () => {
//     setDirLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/list-directories`);
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch directories');
//       }
      
//       const data = await response.json();
//       setAvailableDirs(data.directories);
//       setSubdirectories([]);
//       setCurrentDir('');
//       setDirHistory([]);
//       setBreadcrumbs([{ name: 'Root', path: '' }]);
//     } catch (err) {
//       setError('Error loading directories: ' + err.message);
//       setShowSnackbar(true);
//     } finally {
//       setDirLoading(false);
//     }
//   };

//   const fetchSubdirectories = async (dirPath) => {
//     setDirLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/list-subdirectories`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ directory: dirPath }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch subdirectories');
//       }
      
//       const data = await response.json();
//       setSubdirectories(data.subdirectories);
//       setCurrentDir(dirPath);
//       setDirHistory(prev => [...prev, dirPath]);
//     } catch (err) {
//       setError('Error loading subdirectories: ' + err.message);
//       setShowSnackbar(true);
//     } finally {
//       setDirLoading(false);
//     }
//   };

//   const handleNavigateBack = () => {
//     if (dirHistory.length > 1) {
//       // Remove current directory from history
//       const newHistory = [...dirHistory];
//       newHistory.pop();
      
//       // Get previous directory
//       const previousDir = newHistory[newHistory.length - 1];
      
//       // Fetch subdirectories of previous directory
//       fetchSubdirectories(previousDir);
      
//       // Update history (will be updated by fetchSubdirectories)
//       setDirHistory(newHistory);
//     } else {
//       // Go back to root directories list
//       setSubdirectories([]);
//       setCurrentDir('');
//       setDirHistory([]);
//       setBreadcrumbs([{ name: 'Root', path: '' }]);
//     }
//   };

//   const handleBrowseFolder = () => {
//     setDirDialogOpen(true);
//   };

//   const handleSelectDirectory = (dirPath) => {
//     fetchSubdirectories(dirPath);
//   };

//   const handleBreadcrumbClick = (path) => {
//     fetchSubdirectories(path);
//   };

//   const handleDialogClose = () => {
//     setDirDialogOpen(false);
//   };

//   const handleSelectFolder = async () => {
//     if (!currentDir && currentDir !== '') {
//       setError('Please select a folder first');
//       setShowSnackbar(true);
//       return;
//     }
    
//     setDirDialogOpen(false);
//     await fetchImages(currentDir);
//   };

//   const fetchImages = async (path) => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/list-images`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ folderPath: path }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch images');
//       }
      
//       const data = await response.json();
//       setFolderPath(data.folderPath);
//       setImages(data.images);
//       setCurrentIndex(0);
//       setCategorizedImages({});
//       setZoomLevel(1); // Reset zoom level when loading new images
      
//       if (data.images.length === 0) {
//         setError('No images found in the selected folder');
//         setShowSnackbar(true);
//       }
//     } catch (err) {
//       setError('Error loading images: ' + err.message);
//       setShowSnackbar(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCategoryChange = (event) => {
//     const updatedCategories = {
//       ...categorizedImages,
//       [images[currentIndex]]: event.target.value
//     };
//     setCategorizedImages(updatedCategories);
//   };

//   const handleNext = () => {
//     if (currentIndex < images.length - 1 && categorizedImages[images[currentIndex]]) {
//       setCurrentIndex(currentIndex + 1);
//       setZoomLevel(1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//       setZoomLevel(1);
//     }
//   };

//   const handleSubmitImage = () => {
//     // Move to next image after submission
//     if (currentIndex < images.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//     }
//   };

//   const handleSaveAll = async () => {
//     if (Object.keys(categorizedImages).length === 0) {
//       setError('No images have been categorized yet');
//       setShowSnackbar(true);
//       return;
//     }

//     setLoading(true);
//     try {
//       const categorizedList = Object.entries(categorizedImages).map(([filename, category]) => ({
//         filename,
//         category
//       }));

//       const response = await fetch(`${API_BASE_URL}/api/save-categorized`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           sourceFolder: folderPath,
//           categorizedImages: categorizedList
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to save categorized images');
//       }
      
//       const result = await response.json();
//       setSuccessMessage(`Successfully saved ${result.categorizedCount} images to ${result.destinationFolder}`);
//       setShowSnackbar(true);
//     } catch (err) {
//       setError('Error saving categorized images: ' + err.message);
//       setShowSnackbar(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const closeSnackbar = () => {
//     setShowSnackbar(false);
//     setError('');
//     setSuccessMessage('');
//   };
  
//   const handleZoomIn = () => {
//     setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 3.0)); // Increase zoom level up to 300%
//   };

//   const handleZoomOut = () => {
//     setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.2)); // Decrease zoom level, minimum 20%
//   };
  
//   // Render directory cards in a grid layout
//   const renderDirectoryGrid = (directories) => {
//     return (
//       <Grid container spacing={2} sx={{ mt: 1 }}>
//         {directories.map((dir) => (
//           <Grid item xs={6} sm={4} md={3} key={dir.path}>
//             <Card sx={{ height: '100%' }}>
//               <CardActionArea 
//                 onClick={() => handleSelectDirectory(dir.path)}
//                 sx={{ 
//                   display: 'flex', 
//                   flexDirection: 'column', 
//                   alignItems: 'center',
//                   p: 2,
//                   height: '100%'
//                 }}
//               >
//                 <FolderIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
//                 <Typography 
//                   variant="body2" 
//                   align="center" 
//                   noWrap 
//                   title={dir.name}
//                   sx={{ width: '100%' }}
//                 >
//                   {dir.name}
//                 </Typography>
//               </CardActionArea>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     );
//   };

//   // Correctly generate image URL based on the Flask backend's URL structure
//   const getImageUrl = (folderPath, filename) => {
//     // Ensure the folderPath doesn't start with a slash
//     const cleanPath = folderPath.startsWith('/') ? folderPath.substring(1) : folderPath;
//     return `${API_BASE_URL}/api/image/${encodeURIComponent(cleanPath)}/${encodeURIComponent(filename)}`;
//   };

//   return (
//     <Container maxWidth="md" sx={{ my: 4 }}>
//       <Paper elevation={3} sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
//         <Typography variant="h4" component="h1" gutterBottom align="center">
//           PicSort
//         </Typography>
        
//         <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
//           <Button 
//             variant="contained" 
//             startIcon={<FolderOpenIcon />}
//             onClick={handleBrowseFolder}
//             sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
//           >
//             Browse S3 Bucket
//           </Button>
//         </Box>
        
//         {folderPath && (
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="body2" color="text.secondary">
//               S3 Path: {folderPath}
//             </Typography>
//             <LinearProgress 
//               variant="determinate" 
//               value={(currentIndex + 1) / images.length * 100} 
//               sx={{ mt: 1, height: 10, borderRadius: 5 }}
//             />
//             <Typography variant="body2" align="right" color="text.secondary">
//               {currentIndex + 1} / {images.length}
//             </Typography>
//           </Box>
//         )}
        
//         {images.length > 0 && (
//           <>
//             {/* Image Display with Side Navigation Buttons */}
//             <Box sx={{ my: 3, position: 'relative', height: '400px' }}>
//               {/* Left Navigation Button */}
//               <IconButton
//                 sx={{
//                   position: 'absolute',
//                   left: '-12px',
//                   top: '50%',
//                   transform: 'translateY(-50%)',
//                   zIndex: 2,
//                   backgroundColor: 'rgba(255, 255, 255, 0.7)',
//                   '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
//                 }}
//                 onClick={handlePrevious}
//                 disabled={currentIndex === 0}
//               >
//                 <ArrowBackIcon />
//               </IconButton>
              
//               {/* Image Container */}
//               <Paper 
//                 elevation={2} 
//                 sx={{ 
//                   p: 1, 
//                   display: 'flex', 
//                   justifyContent: 'center', 
//                   alignItems: 'center',
//                   width: '100%',
//                   height: '100%',
//                   overflow: 'hidden',
//                   backgroundColor: '#ffffff',
//                   position: 'relative'
//                 }}
//               >
//                 {images[currentIndex] && (
//                   <img 
//                     src={getImageUrl(folderPath, images[currentIndex])}
//                     alt={`Image ${currentIndex + 1}`}
//                     style={{ 
//                       maxWidth: '100%', 
//                       maxHeight: '100%', 
//                       objectFit: 'contain',
//                       transform: `scale(${zoomLevel})`,
//                       transition: 'transform 0.2s ease'
//                     }}
//                   />
//                 )}
                
//                 {/* Zoom Controls */}
//                 <Box sx={{ 
//                   position: 'absolute', 
//                   bottom: 8, 
//                   right: 8, 
//                   display: 'flex',
//                   backgroundColor: 'rgba(255,255,255,0.7)',
//                   borderRadius: 1,
//                   padding: '2px'
//                 }}>
//                   <Tooltip title="Zoom Out">
//                     <IconButton 
//                       size="small" 
//                       onClick={handleZoomOut}
//                       disabled={zoomLevel <= 0.2}
//                     >
//                       <ZoomOutIcon />
//                     </IconButton>
//                   </Tooltip>
//                   <Typography variant="body2" sx={{ alignSelf: 'center', mx: 1 }}>
//                     {Math.round(zoomLevel * 100)}%
//                   </Typography>
//                   <Tooltip title="Zoom In">
//                     <IconButton 
//                       size="small" 
//                       onClick={handleZoomIn}
//                       disabled={zoomLevel >= 3.0}
//                     >
//                       <ZoomInIcon />
//                     </IconButton>
//                   </Tooltip>
//                 </Box>
//               </Paper>
              
//               {/* Right Navigation Button */}
//               <IconButton
//                 sx={{
//                   position: 'absolute',
//                   right: '-12px',
//                   top: '50%',
//                   transform: 'translateY(-50%)',
//                   zIndex: 2,
//                   backgroundColor: 'rgba(255, 255, 255, 0.7)',
//                   '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
//                 }}
//                 onClick={handleNext}
//                 disabled={currentIndex === images.length - 1 || !categorizedImages[images[currentIndex]]}
//               >
//                 <ArrowForwardIcon />
//               </IconButton>
//             </Box>
            
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="h6" gutterBottom>
//                 Select Category:
//               </Typography>
//               <RadioGroup 
//                 value={categorizedImages[images[currentIndex]] || ''}
//                 onChange={handleCategoryChange}
//                 row
//               >
//                 {categories.map((category) => (
//                   <FormControlLabel 
//                     key={category} 
//                     value={category} 
//                     control={<Radio />} 
//                     label={category} 
//                   />
//                 ))}
//               </RadioGroup>
//             </Box>
            
//             <Box sx={{ display: 'flex', justifyContent: 'center' }}>
//               <Button
//                 variant="contained"
//                 color="success"
//                 startIcon={<SaveIcon />}
//                 onClick={handleSaveAll}
//                 disabled={!isAllCategorized}
//               >
//                 Submit All
//               </Button>
//             </Box>
           
//           </>
//         )}
//       </Paper>
      
//       {/* File Explorer Dialog */}
//       <Dialog 
//         open={dirDialogOpen} 
//         onClose={handleDialogClose}
//         fullWidth
//         maxWidth="md"
//         PaperProps={{
//           sx: { height: '80vh' }
//         }}
//       >
//         <DialogTitle>
//           <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
//             <Tooltip title="Go Back">
//               <span>
//                 <IconButton 
//                   edge="start" 
//                   onClick={handleNavigateBack} 
//                   sx={{ mr: 1 }}
//                   disabled={dirHistory.length === 0}
//                 >
//                   <ChevronLeftIcon />
//                 </IconButton>
//               </span>
//             </Tooltip>
//             <Tooltip title="Home">
//               <IconButton edge="start" onClick={fetchInitialDirectories} sx={{ mr: 2 }}>
//                 <HomeIcon />
//               </IconButton>
//             </Tooltip>
//             <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
//               S3 Bucket Explorer
//             </Typography>
//           </Box>
          
//           {breadcrumbs.length > 0 && (
//             <Breadcrumbs 
//               separator={<NavigateNextIcon fontSize="small" />} 
//               aria-label="breadcrumb"
//               maxItems={4}
//               sx={{ pl: 1 }}
//             >
//               {breadcrumbs.map((item, index) => (
//                 <Link
//                   key={index}
//                   underline="hover"
//                   color="inherit"
//                   onClick={() => handleBreadcrumbClick(item.path)}
//                   sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
//                 >
//                   {index === 0 && <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />}
//                   <Typography variant="body2">{item.name}</Typography>
//                 </Link>
//               ))}
//             </Breadcrumbs>
//           )}
//         </DialogTitle>
        
//         <DialogContent dividers sx={{ p: 2 }}>
//           {dirLoading ? (
//             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
//               <CircularProgress />
//             </Box>
//           ) : (
//             <>
//               {!currentDir && availableDirs.length > 0 && (
//                 <>
//                   <Typography variant="subtitle1" gutterBottom sx={{ pl: 1 }}>
//                     S3 Bucket Contents
//                   </Typography>
//                   {renderDirectoryGrid(availableDirs)}
//                 </>
//               )}
              
//               {currentDir && (
//                 <>
//                   {subdirectories.length > 0 ? (
//                     renderDirectoryGrid(subdirectories)
//                   ) : (
//                     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
//                       <Alert severity="info" sx={{ width: '100%' }}>
//                         No subdirectories found in this location
//                       </Alert>
//                     </Box>
//                   )}
//                 </>
//               )}
//             </>
//           )}
//         </DialogContent>
        
//         <DialogActions sx={{ p: 2 }}>
//           <Button onClick={handleDialogClose}>Cancel</Button>
//           <Button 
//             onClick={handleSelectFolder} 
//             variant="contained"
//           >
//             Select This Folder
//           </Button>
//         </DialogActions>
//       </Dialog>
      
//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={showSnackbar}
//         autoHideDuration={6000}
//         onClose={closeSnackbar}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert 
//           onClose={closeSnackbar} 
//           severity={error ? "error" : "success"} 
//           sx={{ width: '100%' }}
//         >
//           {error || successMessage}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// }

// export default App;




import React, { useState, useEffect } from 'react';
import { 
  Button, Container, Paper, Typography, Radio, RadioGroup, 
  FormControlLabel, LinearProgress, Box, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, List, 
  ListItem, ListItemText, ListItemButton, Divider, CircularProgress,
  IconButton, Tooltip, Grid, Breadcrumbs, Link, Card, CardActionArea
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import FolderIcon from '@mui/icons-material/Folder';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import axios from 'axios';

// Import the new components
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
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setShowUploadForm(true)}
          sx={{ mr: 1 }}
        >
          Upload Images
        </Button>
      ) : (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Upload Images to {currentFolder || 'Root'}</Typography>
          <form onSubmit={handleUpload}>
            <Box sx={{ mb: 3 }}>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                disabled={uploading}
                style={{ width: '100%', padding: '10px 0' }}
              />
              <Typography variant="body2" color="text.secondary">
                Selected files: {files.length}
              </Typography>
            </Box>
            
            {uploading && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" align="center">{uploadProgress}%</Typography>
              </Box>
            )}
            
            {message && (
              <Alert severity={message.includes('Error') ? "error" : "success"} sx={{ mb: 3 }}>
                {message}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="success" 
                disabled={uploading || files.length === 0}
              >
                {uploading ? 'Uploading...' : 'Upload Files'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => setShowUploadForm(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      )}
    </div>
  );
}

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
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => setShowForm(true)}
          sx={{ mr: 1 }}
        >
          Create New Folder
        </Button>
      ) : (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Create New Folder in {currentFolder || 'Root'}</Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <input 
                type="text" 
                placeholder="Enter folder name" 
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                disabled={creating}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </Box>
            
            {message && (
              <Alert severity={message.includes('Error') ? "error" : "success"} sx={{ mb: 3 }}>
                {message}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="success" 
                disabled={creating || !folderName.trim()}
              >
                {creating ? 'Creating...' : 'Create Folder'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => setShowForm(false)}
                disabled={creating}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      )}
    </div>
  );
}

function App() {
  const [folderPath, setFolderPath] = useState('');
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categorizedImages, setCategorizedImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Directory browser state
  const [dirDialogOpen, setDirDialogOpen] = useState(false);
  const [availableDirs, setAvailableDirs] = useState([]);
  const [currentDir, setCurrentDir] = useState('');
  const [subdirectories, setSubdirectories] = useState([]);
  const [dirHistory, setDirHistory] = useState([]);
  const [dirLoading, setDirLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Changed to match backend categories
  const categories = ['Normal', 'Initial Stage', 'Option3', 'Skip'];
  
  // Updated to use environment variables or default API URLs
  const API_BASE_URL = process.env.REACT_APP_API_URL || 
    (window.location.hostname.includes("localhost")
      ? "http://localhost:8080"
      : "https://picsort-backend-python.onrender.com");

  const isAllCategorized = images.every(image => categorizedImages[image]);
  
  // Load initial directories when dialog opens
  useEffect(() => {
    if (dirDialogOpen) {
      fetchInitialDirectories();
    }
  }, [dirDialogOpen]);

  // Update breadcrumbs when directory changes
  useEffect(() => {
    if (currentDir) {
      // For S3 paths, always use forward slashes
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
      setFolderPath(data.folderPath);
      setImages(data.images);
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
    const updatedCategories = {
      ...categorizedImages,
      [images[currentIndex]]: event.target.value
    };
    setCategorizedImages(updatedCategories);
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1 && categorizedImages[images[currentIndex]]) {
      setCurrentIndex(currentIndex + 1);
      setZoomLevel(1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setZoomLevel(1);
    }
  };

  const handleSubmitImage = () => {
    // Move to next image after submission
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
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
    } catch (err) {
      setError('Error saving categorized images: ' + err.message);
      setShowSnackbar(true);
    } finally {
      setLoading(false);
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
  
  // Handle folder creation completion
  const handleFolderCreated = () => {
    // Refresh the current directory listing
    if (currentDir) {
      fetchSubdirectories(currentDir);
    } else {
      fetchInitialDirectories();
    }
  };
  
  // Handle image upload completion
  const handleUploadComplete = () => {
    // Refresh images in the current folder
    if (folderPath) {
      fetchImages(folderPath);
    }
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

  // Correctly generate image URL based on the Flask backend's URL structure
  const getImageUrl = (folderPath, filename) => {
    // Ensure the folderPath doesn't start with a slash
    const cleanPath = folderPath.startsWith('/') ? folderPath.substring(1) : folderPath;
    return `${API_BASE_URL}/api/image/${encodeURIComponent(cleanPath)}/${encodeURIComponent(filename)}`;
  };

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
            Browse S3 Bucket
          </Button>
          
          {/* Add the new components */}
          {currentDir && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FolderCreator 
                currentFolder={currentDir} 
                onFolderCreated={handleFolderCreated} 
              />
              <ImageUploader 
                currentFolder={currentDir} 
                onUploadComplete={handleUploadComplete} 
              />
            </Box>
          )}
        </Box>
        
        {folderPath && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              S3 Path: {folderPath}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(currentIndex + 1) / images.length * 100} 
              sx={{ mt: 1, height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" align="right" color="text.secondary">
              {currentIndex + 1} / {images.length}
            </Typography>
          </Box>
        )}
        
        {images.length > 0 && (
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
                {images[currentIndex] && (
                  <img 
                    src={getImageUrl(folderPath, images[currentIndex])}
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
                }}
                onClick={handleNext}
                disabled={currentIndex === images.length - 1 || !categorizedImages[images[currentIndex]]}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Category:
              </Typography>
              <RadioGroup 
                value={categorizedImages[images[currentIndex]] || ''}
                onChange={handleCategoryChange}
                row
              >
                {categories.map((category) => (
                  <FormControlLabel 
                    key={category} 
                    value={category} 
                    control={<Radio />} 
                    label={category} 
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
                Submit All
              </Button>
            </Box>
           
          </>
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
              S3 Bucket Explorer
            </Typography>
          </Box>
          
          {breadcrumbs.length > 0 && (
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" />} 
              aria-label="breadcrumb"
              maxItems={4}
              sx={{ pl: 1 }}
            >
              {breadcrumbs.map((item, index) => (
                <Link
                  key={index}
                  underline="hover"
                  color="inherit"
                  onClick={() => handleBreadcrumbClick(item.path)}
                  sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {index === 0 && <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />}
                  <Typography variant="body2">{item.name}</Typography>
                </Link>
              ))}
            </Breadcrumbs>
          )}
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 2 }}>
          {dirLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {currentDir && (
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                  <FolderCreator 
                    currentFolder={currentDir} 
                    onFolderCreated={handleFolderCreated} 
                  />
                  <ImageUploader 
                    currentFolder={currentDir} 
                    onUploadComplete={handleUploadComplete} 
                  />
                </Box>
              )}
              
              {!currentDir && availableDirs.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ pl: 1 }}>
                    S3 Bucket Contents
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
            Select This Folder
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;