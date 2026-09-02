const https = require('https');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\dimam\\.gemini\\antigravity\\brain\\7747de3a-5452-42b3-a569-980ec5eec61e';

function downloadQR(data, filename) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(data)}&margin=10`;
  const filePath = path.join(artifactDir, filename);
  const file = fs.createWriteStream(filePath);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Saved QR to ${filePath}`);
    });
  }).on('error', (err) => {
    console.error('Error downloading QR:', err.message);
  });
}

downloadQR('exp://172.20.10.11:8081', 'expo_go_qr.png');
downloadQR('http://172.20.10.11:8081', 'safari_web_qr.png');
downloadQR('https://sharp-steaks-go.loca.lt', 'global_tunnel_qr.png');
