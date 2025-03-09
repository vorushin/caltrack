const fs = require('fs');
const path = require('path');

// Path to the app directory
const appDir = path.join(__dirname, 'app');

// Check if the app directory exists
if (fs.existsSync(appDir)) {
  console.log('Removing app directory to resolve routing conflict...');
  
  // Function to recursively delete a directory
  const deleteDirectory = (dirPath) => {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach((file) => {
        const curPath = path.join(dirPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // Recursive call for directories
          deleteDirectory(curPath);
        } else {
          // Delete file
          fs.unlinkSync(curPath);
          console.log(`Deleted file: ${curPath}`);
        }
      });
      // Delete the empty directory
      fs.rmdirSync(dirPath);
      console.log(`Deleted directory: ${dirPath}`);
    }
  };
  
  // Delete the app directory
  deleteDirectory(appDir);
  
  console.log('App directory removed successfully.');
  console.log('You can now run "npm run dev" or "npm run build" without conflicts.');
} else {
  console.log('App directory does not exist. No action needed.');
} 