async function test() {
  try {
    const url = 'http://localhost:8081/node_modules/expo-router/entry.bundle?platform=web&dev=true&hot=false&lazy=true';
    console.log('Requesting bundle from:', url);
    const res = await fetch(url);
    console.log('HTTP Status:', res.status);
    const text = await res.text();
    console.log('Bundle Size:', text.length, 'bytes');
    if (res.status === 200 && text.length > 5000) {
      console.log('✅ BUNDLE COMPILED SUCCESSFULLY!');
    } else {
      console.log('❌ BUNDLE OUTPUT PREVIEW:', text.slice(0, 500));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();
