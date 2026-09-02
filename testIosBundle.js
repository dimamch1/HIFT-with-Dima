const http = require('http');

const url = 'http://localhost:8081/node_modules/expo-router/entry.bundle?platform=ios&dev=true&hot=false&lazy=true';
console.log('Testing iOS Metro Bundle from:', url);

http.get(url, (res) => {
  console.log('HTTP Status:', res.statusCode);
  let bytes = 0;
  res.on('data', (chunk) => { bytes += chunk.length; });
  res.on('end', () => {
    console.log(`iOS Bundle size: ${bytes} bytes`);
    if (res.statusCode === 200) {
      console.log('✅ IOS BUNDLE COMPILED SUCCESSFULLY!');
    } else {
      console.error('❌ FAILED WITH STATUS', res.statusCode);
    }
  });
}).on('error', (e) => {
  console.error('Connection error:', e.message);
});
