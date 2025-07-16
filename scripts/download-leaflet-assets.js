const fs = require('fs');
const https = require('https');
const path = require('path');

// Create public/images directory if it doesn't exist
const dir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// URLs of the required Leaflet assets
const assets = [
  {
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x.png',
    filename: 'marker-icon-2x.png'
  },
  {
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon.png',
    filename: 'marker-icon.png'
  },
  {
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
    filename: 'marker-shadow.png'
  }
];

// Function to download a file
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${url} to ${filepath}`);
        resolve();
      });
    }).on('error', error => {
      fs.unlink(filepath, () => {
        console.error(`Error downloading ${url}:`, error);
        reject(error);
      });
    });
  });
}

// Download all assets
async function downloadAssets() {
  try {
    for (const asset of assets) {
      const filepath = path.join(dir, asset.filename);
      await downloadFile(asset.url, filepath);
    }
    console.log('All Leaflet assets downloaded successfully!');
  } catch (error) {
    console.error('Error downloading Leaflet assets:', error);
    process.exit(1);
  }
}

// Run the download
downloadAssets();
