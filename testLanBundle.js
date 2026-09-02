const http = require('http');

const url = 'http://172.20.10.11:8081/node_modules/expo-router/entry.bundle?platform=ios&dev=true&hot=false&lazy=true';
console.log('Testing iOS Metro Bundle on LAN IP:', url);

http.get(url, (res) => {
  console.log('LAN HTTP Status:', res.statusCode);
  let bytes = 0;
  res.on('data', (chunk) => { bytes += chunk.length; });
  res.on('end', () => {
    console.log(`LAN Bundle size: ${bytes} bytes`);
    if (res.statusCode === 200) {
      console.log('✅ LAN IOS BUNDLE COMPILED SUCCESSFULLY!');
    } else {
      console.error('❌ FAILED WITH STATUS', res.statusCode);
    }
  });
}).on('error', (e) => {
  console.error('Connection error on LAN IP:', e.message);
});
