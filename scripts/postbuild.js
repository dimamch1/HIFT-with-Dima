const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Enhance viewport meta tag
  html = html.replace(
    /<meta name="viewport"[^>]*>/i,
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />\n    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />\n    <link rel="alternate icon" type="image/png" href="/favicon.png" />\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n    <meta name="theme-color" content="#000000" />'
  );

  // Enhance CSS styles
  const cssInject = `
      *, *::before, *::after {
        box-sizing: border-box;
      }
      html {
        height: 100%;
        height: 100dvh;
        width: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #000000;
        -webkit-text-size-adjust: 100%;
      }
      body {
        height: 100%;
        height: 100dvh;
        width: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #000000;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        touch-action: pan-y;
        -webkit-font-smoothing: antialiased;
      }
      #root {
        display: flex;
        height: 100%;
        height: 100dvh;
        width: 100%;
        flex: 1;
        overflow: hidden;
        background-color: #000000;
      }`;

  html = html.replace(/<style id="expo-reset">[\s\S]*?<\/style>/i, `<style id="expo-reset">${cssInject}\n    </style>`);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✓ Successfully enhanced dist/index.html with mobile viewport-fit and 100dvh');
}

// Copy _redirects and favicons
try {
  fs.writeFileSync(path.join(distDir, '_redirects'), '/*    /index.html   200\n', 'utf8');
  const pubSvg = path.join(__dirname, '..', 'public', 'favicon.svg');
  const pubPng = path.join(__dirname, '..', 'public', 'favicon.png');
  if (fs.existsSync(pubSvg)) fs.copyFileSync(pubSvg, path.join(distDir, 'favicon.svg'));
  if (fs.existsSync(pubPng)) fs.copyFileSync(pubPng, path.join(distDir, 'favicon.png'));
  console.log('✓ Verified Netlify _redirects and favicons in dist/');
} catch (e) {
  console.error('Error copying assets:', e);
}
