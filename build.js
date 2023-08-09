const fs = require('fs');
const path = require('path');

// Specify the paths to the source and destination files
var sourcePath = path.join(__dirname, 'manifest.json');
var destPath = path.join(__dirname, 'dist', 'manifest.json');

// Copy the manifest.json file to the destination folder
fs.copyFile(sourcePath, destPath, (err) => {
  if (err) {
    console.error('Error copying manifest.json:', err);
  } else {
    console.log('manifest.json copied successfully!');
  }
});
